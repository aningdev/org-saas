import { oc } from "@orpc/contract";
import { openapi } from "@orpc/openapi";
import { z } from "zod";

const organizationIdSchema = z.string().min(1).max(200);
const taskIdSchema = z.string().min(1).max(200);
const taskTitleSchema = z.string().trim().min(1).max(200);
const taskStatusSchema = z.enum(["open", "completed"]);

const taskDto = z.object({
  id: z.string(),
  organizationId: z.string(),
  title: z.string(),
  status: taskStatusSchema,
  createdByUserId: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  completedAt: z.string().datetime().nullable(),
});

const taskPage = z.object({
  items: z.array(taskDto),
  total: z.number().int().nonnegative(),
  limit: z.number().int().positive(),
  offset: z.number().int().nonnegative(),
});

export const createOrganizationTaskInput = z.object({
  organizationId: organizationIdSchema,
  title: taskTitleSchema,
});

export const updateOrganizationTaskInput = z.object({
  organizationId: organizationIdSchema,
  taskId: taskIdSchema,
  title: taskTitleSchema.optional(),
  status: taskStatusSchema.optional(),
});

export const taskContract = {
  list: oc
    .meta(
      openapi({
        method: "GET",
        path: "/organizations/{organizationId}/tasks",
        summary: "列出组织任务",
        tags: ["组织任务"],
      }),
    )
    .errors({
      UNAUTHORIZED: { message: "请先登录" },
      FORBIDDEN: { message: "您无权查看此组织的任务" },
      NOT_FOUND: { message: "组织不存在" },
      CONFLICT: { message: "组织所有权状态需要审查" },
    })
    .input(
      z.object({
        organizationId: organizationIdSchema,
        limit: z.coerce.number().int().min(1).max(100).default(50),
        offset: z.coerce.number().int().min(0).max(100_000).default(0),
      }),
    )
    .output(taskPage),
  create: oc
    .meta(
      openapi({
        method: "POST",
        path: "/organizations/{organizationId}/tasks",
        summary: "创建组织任务",
        tags: ["组织任务"],
      }),
    )
    .errors({
      UNAUTHORIZED: { message: "请先登录" },
      FORBIDDEN: { message: "您无权在此组织创建任务" },
      NOT_FOUND: { message: "组织不存在" },
      CONFLICT: { message: "组织所有权状态需要审查" },
    })
    .input(createOrganizationTaskInput)
    .output(taskDto),
  update: oc
    .meta(
      openapi({
        method: "PATCH",
        path: "/organizations/{organizationId}/tasks/{taskId}",
        summary: "更新组织任务",
        tags: ["组织任务"],
      }),
    )
    .errors({
      UNAUTHORIZED: { message: "请先登录" },
      FORBIDDEN: { message: "您无权更新此任务" },
      NOT_FOUND: { message: "任务不存在" },
      CONFLICT: { message: "组织所有权状态需要审查" },
      BAD_REQUEST: { message: "没有可更新的字段" },
    })
    .input(updateOrganizationTaskInput)
    .output(taskDto),
  delete: oc
    .meta(
      openapi({
        method: "DELETE",
        path: "/organizations/{organizationId}/tasks/{taskId}",
        summary: "删除组织任务",
        tags: ["组织任务"],
      }),
    )
    .errors({
      UNAUTHORIZED: { message: "请先登录" },
      FORBIDDEN: { message: "您无权删除此任务" },
      NOT_FOUND: { message: "任务不存在" },
      CONFLICT: { message: "组织所有权状态需要审查" },
    })
    .input(
      z.object({
        organizationId: organizationIdSchema,
        taskId: taskIdSchema,
      }),
    )
    .output(z.object({ id: z.string() })),
};

export type OrganizationTaskDto = z.infer<typeof taskDto>;
export type CreateOrganizationTaskInput = z.infer<typeof createOrganizationTaskInput>;
export type UpdateOrganizationTaskInput = z.infer<typeof updateOrganizationTaskInput>;
