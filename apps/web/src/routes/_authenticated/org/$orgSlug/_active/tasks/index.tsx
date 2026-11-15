import { createOrganizationTaskInput } from "@org-saas/api/contracts/task";
import { useMutation, useQuery, useQueryClient } from "@tanstack/solid-query";
import { createFileRoute } from "@tanstack/solid-router";
import { createSignal, For, Show } from "solid-js";

import { usePermission } from "@/hooks/use-permission";
import { useOrgContext } from "@/lib/org-context";
import { organizationQueryKeys } from "@/lib/organization-query-keys";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { toast } from "@/ui/toast";
import { ForbiddenError } from "@/utils/errors";
import { client, orpc } from "@/utils/orpc";

export const Route = createFileRoute("/_authenticated/org/$orgSlug/_active/tasks/")({
  beforeLoad: ({ context }) => {
    if (!context.access.operations.task.read) {
      throw new ForbiddenError("您没有查看组织任务的权限");
    }
  },
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(
      // @ts-expect-error orpc query utils target react-query option types
      orpc.task.list.queryOptions({
        input: { organizationId: context.org.id },
        queryKey: organizationQueryKeys.tasks(context.user.id, context.org.id),
      }),
    );
  },
  component: OrganizationTasksPage,
});

function OrganizationTasksPage() {
  const orgCtx = useOrgContext();
  const queryClient = useQueryClient();
  const canCreate = usePermission({ task: ["create"] });
  const canUpdate = usePermission({ task: ["update"] });
  const canDelete = usePermission({ task: ["delete"] });
  const [title, setTitle] = createSignal("");
  const [formError, setFormError] = createSignal<string | undefined>();

  const listQuery = useQuery(() =>
    // @ts-expect-error orpc query utils target react-query option types
    orpc.task.list.queryOptions({
      input: { organizationId: orgCtx.org.id },
      queryKey: organizationQueryKeys.tasks(orgCtx.userId, orgCtx.org.id),
    }),
  );

  const invalidate = async () => {
    await queryClient.invalidateQueries({
      queryKey: organizationQueryKeys.tasks(orgCtx.userId, orgCtx.org.id),
    });
  };

  const createMutation = useMutation(() => ({
    mutationFn: (nextTitle: string) =>
      client.task.create({ organizationId: orgCtx.org.id, title: nextTitle }),
    onSuccess: async () => {
      setTitle("");
      setFormError(undefined);
      await invalidate();
      toast.add({ title: "任务已创建", type: "success" });
    },
    onError: (error: Error) => {
      toast.add({ title: error.message || "创建失败", type: "error" });
    },
  }));

  const updateMutation = useMutation(() => ({
    mutationFn: (input: { taskId: string; status: "open" | "completed" }) =>
      client.task.update({
        organizationId: orgCtx.org.id,
        taskId: input.taskId,
        status: input.status,
      }),
    onSuccess: async () => {
      await invalidate();
    },
    onError: (error: Error) => {
      toast.add({ title: error.message || "更新失败", type: "error" });
    },
  }));

  const deleteMutation = useMutation(() => ({
    mutationFn: (taskId: string) => client.task.delete({ organizationId: orgCtx.org.id, taskId }),
    onSuccess: async () => {
      await invalidate();
      toast.add({ title: "任务已删除", type: "success" });
    },
    onError: (error: Error) => {
      toast.add({ title: error.message || "删除失败", type: "error" });
    },
  }));

  const handleCreate = (event: SubmitEvent) => {
    event.preventDefault();
    const parsed = createOrganizationTaskInput.safeParse({
      organizationId: orgCtx.org.id,
      title: title(),
    });
    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message ?? "标题无效");
      return;
    }
    void createMutation.mutate(parsed.data.title);
  };

  return (
    <div class="p-6">
      <h1 class="mb-6 text-2xl font-bold">任务</h1>

      <Show when={canCreate}>
        <form class="mb-8 flex max-w-xl flex-col gap-3" onSubmit={handleCreate}>
          <div class="flex flex-col gap-2">
            <Label for="task-title">新任务</Label>
            <Input
              id="task-title"
              value={title()}
              placeholder="例如：准备季度汇报"
              onInput={(event) => setTitle(event.currentTarget.value)}
              disabled={createMutation.isPending}
            />
            <Show when={formError()}>
              {(message) => <p class="text-destructive text-sm">{message()}</p>}
            </Show>
          </div>
          <div>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "创建中…" : "创建"}
            </Button>
          </div>
        </form>
      </Show>

      <Show
        when={(listQuery.data?.items.length ?? 0) > 0}
        fallback={<p class="text-muted-foreground text-sm">暂无任务。</p>}
      >
        <ul class="divide-border max-w-2xl divide-y border-y">
          <For each={listQuery.data?.items ?? []}>
            {(task) => (
              <li class="flex items-center justify-between gap-4 py-3">
                <div class="min-w-0">
                  <p
                    class={`truncate font-medium ${task.status === "completed" ? "text-muted-foreground line-through" : ""}`}
                  >
                    {task.title}
                  </p>
                  <p class="text-muted-foreground text-xs">
                    {task.status === "completed" ? "已完成" : "未完成"}
                  </p>
                </div>
                <div class="flex shrink-0 gap-2">
                  <Show when={canUpdate}>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={updateMutation.isPending}
                      onClick={() =>
                        void updateMutation.mutate({
                          taskId: task.id,
                          status: task.status === "completed" ? "open" : "completed",
                        })
                      }
                    >
                      {task.status === "completed" ? "重开" : "完成"}
                    </Button>
                  </Show>
                  <Show when={canDelete}>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={deleteMutation.isPending}
                      onClick={() => void deleteMutation.mutate(task.id)}
                    >
                      删除
                    </Button>
                  </Show>
                </div>
              </li>
            )}
          </For>
        </ul>
      </Show>
    </div>
  );
}
