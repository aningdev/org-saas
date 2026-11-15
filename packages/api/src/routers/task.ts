import { and, count, db, desc, eq } from "@org-saas/db";
import { organizationTask } from "@org-saas/db/schema/task";
import { ORPCError } from "@orpc/server";

import { protectedImplementer } from "../index";
import { loadOrganizationAccess } from "../organization-access";

function toTaskDto(row: typeof organizationTask.$inferSelect) {
  return {
    id: row.id,
    organizationId: row.organizationId,
    title: row.title,
    status: row.status as "open" | "completed",
    createdByUserId: row.createdByUserId,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    completedAt: row.completedAt?.toISOString() ?? null,
  };
}

async function requireActiveTaskAccess(
  organizationId: string,
  userId: string,
  headers: Headers,
  action: "create" | "read" | "update" | "delete",
) {
  const access = await loadOrganizationAccess(organizationId, userId, headers);
  if (access.archivedAt) {
    throw new ORPCError("FORBIDDEN", { message: "此组织当前不可访问" });
  }
  if (!access.operations.task[action]) {
    throw new ORPCError("FORBIDDEN", {
      message:
        action === "read"
          ? "您无权查看此组织的任务"
          : action === "create"
            ? "您无权在此组织创建任务"
            : action === "update"
              ? "您无权更新此任务"
              : "您无权删除此任务",
    });
  }
  return access;
}

export const taskRouter = {
  list: protectedImplementer.task.list.handler(async ({ context, input }) => {
    await requireActiveTaskAccess(
      input.organizationId,
      context.session.user.id,
      context.headers,
      "read",
    );

    const where = eq(organizationTask.organizationId, input.organizationId);
    const [totalRow] = await db.select({ count: count() }).from(organizationTask).where(where);
    const items = await db
      .select()
      .from(organizationTask)
      .where(where)
      .orderBy(desc(organizationTask.createdAt))
      .limit(input.limit)
      .offset(input.offset);

    return {
      items: items.map(toTaskDto),
      total: totalRow?.count ?? 0,
      limit: input.limit,
      offset: input.offset,
    };
  }),

  create: protectedImplementer.task.create.handler(async ({ context, input }) => {
    await requireActiveTaskAccess(
      input.organizationId,
      context.session.user.id,
      context.headers,
      "create",
    );

    const [created] = await db
      .insert(organizationTask)
      .values({
        id: crypto.randomUUID(),
        organizationId: input.organizationId,
        title: input.title,
        status: "open",
        createdByUserId: context.session.user.id,
      })
      .returning();

    if (!created) {
      throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "创建任务失败" });
    }
    return toTaskDto(created);
  }),

  update: protectedImplementer.task.update.handler(async ({ context, input }) => {
    await requireActiveTaskAccess(
      input.organizationId,
      context.session.user.id,
      context.headers,
      "update",
    );

    if (input.title === undefined && input.status === undefined) {
      throw new ORPCError("BAD_REQUEST", { message: "没有可更新的字段" });
    }

    const [existing] = await db
      .select()
      .from(organizationTask)
      .where(
        and(
          eq(organizationTask.id, input.taskId),
          eq(organizationTask.organizationId, input.organizationId),
        ),
      )
      .limit(1);
    if (!existing) {
      throw new ORPCError("NOT_FOUND", { message: "任务不存在" });
    }

    const nextStatus = input.status ?? existing.status;
    const [updated] = await db
      .update(organizationTask)
      .set({
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
        completedAt:
          nextStatus === "completed"
            ? (existing.completedAt ?? new Date())
            : nextStatus === "open"
              ? null
              : existing.completedAt,
      })
      .where(
        and(
          eq(organizationTask.id, input.taskId),
          eq(organizationTask.organizationId, input.organizationId),
        ),
      )
      .returning();

    if (!updated) {
      throw new ORPCError("NOT_FOUND", { message: "任务不存在" });
    }
    return toTaskDto(updated);
  }),

  delete: protectedImplementer.task.delete.handler(async ({ context, input }) => {
    await requireActiveTaskAccess(
      input.organizationId,
      context.session.user.id,
      context.headers,
      "delete",
    );

    const deleted = await db
      .delete(organizationTask)
      .where(
        and(
          eq(organizationTask.id, input.taskId),
          eq(organizationTask.organizationId, input.organizationId),
        ),
      )
      .returning({ id: organizationTask.id });

    if (!deleted[0]) {
      throw new ORPCError("NOT_FOUND", { message: "任务不存在" });
    }
    return { id: deleted[0].id };
  }),
};
