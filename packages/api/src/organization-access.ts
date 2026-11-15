import { organizationHasPermission } from "@org-saas/auth/organization-has-permission";
import { resolveOrganizationOwner } from "@org-saas/auth/organization-owner";
import { and, db, eq } from "@org-saas/db";
import { member, organization, organizationRole } from "@org-saas/db/schema/auth";
import { ORPCError } from "@orpc/server";

import type { EffectiveOrganizationOperations } from "./contracts/organization";
import { getRoleStatements } from "./organization-permissions";

export function fail(
  code: "CONFLICT" | "FORBIDDEN" | "NOT_FOUND",
  message: string,
  reason?: string,
): never {
  throw new ORPCError(code, { message, data: reason ? { reason } : undefined });
}

function emptyOperations(): EffectiveOrganizationOperations {
  return {
    organization: { update: false, archive: false, restore: false },
    member: { create: false, update: false, delete: false },
    invitation: { create: false, cancel: false, viewPending: false },
    team: { create: false, update: false, delete: false },
    ac: { read: false, create: false, update: false, delete: false },
    audit: { read: false },
    task: { create: false, read: false, update: false, delete: false },
  };
}

async function resolveOperationsViaHasPermission(input: {
  headers: Headers;
  organizationId: string;
  isOwner: boolean;
  archived: boolean;
}): Promise<EffectiveOrganizationOperations> {
  if (input.archived) {
    return {
      ...emptyOperations(),
      organization: { update: false, archive: false, restore: input.isOwner },
      audit: { read: input.isOwner },
    };
  }

  const check = (permissions: Record<string, string[]>) =>
    organizationHasPermission({
      headers: input.headers,
      organizationId: input.organizationId,
      permissions,
    });

  const [
    organizationUpdate,
    memberCreate,
    memberUpdate,
    memberDelete,
    invitationCreate,
    invitationCancel,
    teamCreate,
    teamUpdate,
    teamDelete,
    acRead,
    acCreate,
    acUpdate,
    acDelete,
    auditRead,
    taskCreate,
    taskRead,
    taskUpdate,
    taskDelete,
  ] = await Promise.all([
    check({ organization: ["update"] }),
    check({ member: ["create"] }),
    check({ member: ["update"] }),
    check({ member: ["delete"] }),
    check({ invitation: ["create"] }),
    check({ invitation: ["cancel"] }),
    check({ team: ["create"] }),
    check({ team: ["update"] }),
    check({ team: ["delete"] }),
    check({ ac: ["read"] }),
    check({ ac: ["create"] }),
    check({ ac: ["update"] }),
    check({ ac: ["delete"] }),
    check({ audit: ["read"] }),
    check({ task: ["create"] }),
    check({ task: ["read"] }),
    check({ task: ["update"] }),
    check({ task: ["delete"] }),
  ]);

  return {
    organization: {
      update: organizationUpdate,
      // Product extension: archive/restore are owner-only, not Better Auth statements.
      archive: input.isOwner,
      restore: false,
    },
    member: {
      create: memberCreate,
      update: memberUpdate,
      delete: memberDelete,
    },
    invitation: {
      create: invitationCreate,
      cancel: invitationCancel,
      // Product rule: cancel-capable managers may also see pending invites.
      viewPending: invitationCreate || invitationCancel,
    },
    team: {
      create: teamCreate,
      update: teamUpdate,
      delete: teamDelete,
    },
    ac: {
      read: acRead,
      create: acCreate,
      update: acUpdate,
      delete: acDelete,
    },
    audit: { read: auditRead },
    task: {
      create: taskCreate,
      read: taskRead,
      update: taskUpdate,
      delete: taskDelete,
    },
  };
}

export async function loadOrganizationAccess(
  organizationId: string,
  userId: string,
  headers: Headers,
) {
  const [organizationRow] = await db
    .select({ id: organization.id, archivedAt: organization.archivedAt })
    .from(organization)
    .where(eq(organization.id, organizationId))
    .limit(1);
  if (!organizationRow) fail("NOT_FOUND", "Organization not found.");

  const [membership] = await db
    .select({ role: member.role })
    .from(member)
    .where(and(eq(member.organizationId, organizationId), eq(member.userId, userId)))
    .limit(1);
  if (!membership) {
    fail(
      "FORBIDDEN",
      "You are not a member of this organization.",
      "ORGANIZATION_MEMBERSHIP_REQUIRED",
    );
  }

  const memberships = await db
    .select({ userId: member.userId, role: member.role })
    .from(member)
    .where(eq(member.organizationId, organizationId));
  const ownerState = resolveOrganizationOwner(memberships);
  if (ownerState.status !== "valid") {
    fail(
      "CONFLICT",
      "Organization ownership requires review before permission data is available.",
      "OWNER_STATE_INVALID",
    );
  }

  const isOwner = membership.role === "owner";
  if (organizationRow.archivedAt && !isOwner) {
    fail(
      "FORBIDDEN",
      "Only the organization owner may access archived organization status.",
      "OWNER_REQUIRED",
    );
  }

  const [customRole] = await db
    .select({ permission: organizationRole.permission })
    .from(organizationRole)
    .where(
      and(
        eq(organizationRole.organizationId, organizationId),
        eq(organizationRole.role, membership.role),
      ),
    )
    .limit(1);
  // Kept for grantable-role comparison; live allow/deny uses Better Auth hasPermission.
  const statements = getRoleStatements(membership.role, customRole?.permission);
  const operations = await resolveOperationsViaHasPermission({
    headers,
    organizationId,
    isOwner,
    archived: Boolean(organizationRow.archivedAt),
  });

  return {
    organizationId,
    role: membership.role,
    isOwner,
    archivedAt: organizationRow.archivedAt,
    operations,
    statements,
  };
}

export function accessContextOutput(access: Awaited<ReturnType<typeof loadOrganizationAccess>>) {
  return {
    organizationId: access.organizationId,
    role: access.role,
    isOwner: access.isOwner,
    status: access.archivedAt ? ("archived" as const) : ("active" as const),
    operations: access.operations,
  };
}
