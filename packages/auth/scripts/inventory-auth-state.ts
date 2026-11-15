/**
 * Read-only inventory of authorization-related rows for a target database.
 *
 * Usage (from repo root, after confirming the connection target):
 *   DATABASE_URL=postgres://... vp run --filter @org-saas/auth inventory:auth
 *
 * Does not mutate data. Schema apply (`db:push` / migrate) is intentionally separate
 * and must wait for an explicit maintainer-named environment.
 */
import { and, count, db, eq, isNull, sql } from "@org-saas/db";
import { invitation, member, organization, organizationRole, user } from "@org-saas/db/schema/auth";

import { roles } from "../src/permissions";
import { platformAdminRoles } from "../src/platform-permissions";

const presetRoleNames = new Set(Object.keys(roles));
const platformAdminRole = platformAdminRoles[0];

type Finding = {
  code: string;
  severity: "info" | "warn" | "error";
  message: string;
  samples?: string[];
};

async function inventory(): Promise<void> {
  const findings: Finding[] = [];

  const [userTotals] = await db.select({ total: count() }).from(user);
  const platformAdmins = await db
    .select({ id: user.id, email: user.email, role: user.role })
    .from(user)
    .where(sql`${user.role} ~ ${`(^|,)[[:space:]]*${platformAdminRole}[[:space:]]*(,|$)`}`);

  findings.push({
    code: "platform.users",
    severity: "info",
    message: `users=${userTotals?.total ?? 0}, platform-admin=${platformAdmins.length}`,
    samples: platformAdmins.slice(0, 5).map((row) => `${row.id}:${row.email}`),
  });

  const ownerCounts = await db
    .select({
      organizationId: member.organizationId,
      owners: count(),
    })
    .from(member)
    .where(eq(member.role, "owner"))
    .groupBy(member.organizationId);

  const zeroOwnerOrgs = await db
    .select({ id: organization.id, slug: organization.slug })
    .from(organization)
    .leftJoin(member, and(eq(member.organizationId, organization.id), eq(member.role, "owner")))
    .where(isNull(member.id));

  const multiOwner = ownerCounts.filter((row) => Number(row.owners) > 1);
  if (zeroOwnerOrgs.length > 0) {
    findings.push({
      code: "org.owner.missing",
      severity: "error",
      message: `${zeroOwnerOrgs.length} organization(s) have no owner`,
      samples: zeroOwnerOrgs.slice(0, 10).map((row) => `${row.id}:${row.slug}`),
    });
  }
  if (multiOwner.length > 0) {
    findings.push({
      code: "org.owner.multiple",
      severity: "error",
      message: `${multiOwner.length} organization(s) have more than one owner`,
      samples: multiOwner.slice(0, 10).map((row) => `${row.organizationId}:${row.owners}`),
    });
  }

  const multiRoleMembers = await db
    .select({ id: member.id, organizationId: member.organizationId, role: member.role })
    .from(member)
    .where(sql`${member.role} like '%,%'`);
  if (multiRoleMembers.length > 0) {
    findings.push({
      code: "member.multi-role",
      severity: "error",
      message: `${multiRoleMembers.length} member row(s) use comma-separated roles`,
      samples: multiRoleMembers.slice(0, 10).map((row) => `${row.id}:${row.role}`),
    });
  }

  const dynamicRoles = await db
    .select({ organizationId: organizationRole.organizationId, role: organizationRole.role })
    .from(organizationRole);
  const dynamicByOrg = new Map<string, Set<string>>();
  for (const row of dynamicRoles) {
    const set = dynamicByOrg.get(row.organizationId) ?? new Set<string>();
    set.add(row.role);
    dynamicByOrg.set(row.organizationId, set);
  }
  const allMembers = await db
    .select({ id: member.id, organizationId: member.organizationId, role: member.role })
    .from(member);
  const unknown = allMembers.filter((row) => {
    if (presetRoleNames.has(row.role)) return false;
    return !dynamicByOrg.get(row.organizationId)?.has(row.role);
  });
  if (unknown.length > 0) {
    findings.push({
      code: "member.unknown-role",
      severity: "warn",
      message: `${unknown.length} member(s) reference unknown role names`,
      samples: unknown.slice(0, 10).map((row) => `${row.id}:${row.role}`),
    });
  }

  const archived = await db
    .select({ id: organization.id, slug: organization.slug })
    .from(organization)
    .where(sql`${organization.archivedAt} is not null`);
  findings.push({
    code: "org.archived",
    severity: "info",
    message: `${archived.length} archived organization(s)`,
    samples: archived.slice(0, 10).map((row) => `${row.id}:${row.slug}`),
  });

  const pendingInvites = await db
    .select({ total: count() })
    .from(invitation)
    .where(eq(invitation.status, "pending"));
  findings.push({
    code: "invite.pending",
    severity: "info",
    message: `pending invitations=${pendingInvites[0]?.total ?? 0}`,
  });

  const [orgTotal] = await db.select({ total: count() }).from(organization);
  findings.push({
    code: "org.total",
    severity: "info",
    message: `organizations=${orgTotal?.total ?? 0}`,
  });

  const errors = findings.filter((item) => item.severity === "error");
  const payload = {
    generatedAt: new Date().toISOString(),
    databaseHost: (() => {
      try {
        return new URL(process.env.DATABASE_URL ?? "").host;
      } catch {
        return "(unparsed)";
      }
    })(),
    findings,
    summary: {
      error: errors.length,
      warn: findings.filter((item) => item.severity === "warn").length,
      info: findings.filter((item) => item.severity === "info").length,
    },
  };

  console.log(JSON.stringify(payload, null, 2));
  if (errors.length > 0) process.exitCode = 2;
}

await inventory();
