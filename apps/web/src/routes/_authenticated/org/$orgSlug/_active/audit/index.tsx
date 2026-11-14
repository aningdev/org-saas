import type { AuditEvent } from "@org-saas/api/contracts/audit";
import { useQuery } from "@tanstack/solid-query";
import { createFileRoute } from "@tanstack/solid-router";
import { createSignal, For, Show } from "solid-js";

import { useOrgContext } from "@/lib/org-context";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Input } from "@/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";
import { ForbiddenError } from "@/utils/errors";
import { orpc } from "@/utils/orpc";

const pageSize = 25;

const actionLabels: Record<string, string> = {
  "organization.created": "创建组织",
  "organization.updated": "更新组织设置",
  "organization.ownership_transferred": "转让组织所有权",
  "organization.archived": "归档组织",
  "organization.restored": "恢复组织",
  "member.added": "添加成员",
  "member.removed": "移除成员",
  "member.left": "成员退出",
  "member.role_changed": "调整成员角色",
  "invitation.sent": "发送邀请",
  "invitation.accepted": "接受邀请",
  "invitation.canceled": "取消邀请",
  "invitation.rejected": "拒绝邀请",
  "team.created": "创建团队",
  "team.updated": "更新团队",
  "team.deleted": "删除团队",
  "team.member_added": "加入团队成员",
  "team.member_removed": "移出团队成员",
  "role.created": "创建角色",
  "role.updated": "更新角色",
  "role.deleted": "删除角色",
};

const summaryLabels: Record<string, string> = {
  role: "角色",
  formerOwnerRole: "原所有者角色",
  changedFields: "变更字段",
};

export const Route = createFileRoute("/_authenticated/org/$orgSlug/_active/audit/")({
  beforeLoad: ({ context }) => {
    if (!context.access.operations.audit.read) {
      throw new ForbiddenError("您没有查看组织审计记录的权限");
    }
  },
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(
      // @ts-expect-error orpc query utils target react-query option types
      orpc.audit.listOrganizationEvents.queryOptions({
        input: { organizationId: context.org.id, limit: pageSize, offset: 0 },
      }),
    );
  },
  component: OrganizationAuditPage,
});

function OrganizationAuditPage() {
  const orgCtx = useOrgContext();
  const [page, setPage] = createSignal(0);
  const [actionInput, setActionInput] = createSignal("");
  const [actionFilter, setActionFilter] = createSignal("");
  const query = useQuery(() =>
    // @ts-expect-error orpc query utils target react-query option types
    orpc.audit.listOrganizationEvents.queryOptions({
      input: {
        organizationId: orgCtx.org.id,
        limit: pageSize,
        offset: page() * pageSize,
        action: actionFilter() || undefined,
      },
    }),
  );
  const data = () => query.data;
  const lastPage = () => Math.max(0, Math.ceil((data()?.total ?? 0) / pageSize) - 1);

  return (
    <div class="flex flex-col gap-6 p-6">
      <div>
        <h1 class="text-2xl font-bold">组织审计</h1>
        <p class="text-muted-foreground text-sm">
          记录成员、邀请、角色、团队和组织管理操作，保留 180 天。
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>操作记录</CardTitle>
          <CardDescription>按发生时间倒序排列。</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            class="mb-4 flex max-w-xl gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              setActionFilter(actionInput().trim());
              setPage(0);
            }}
          >
            <Input
              aria-label="按操作类型筛选"
              placeholder="操作标识，例如 member.role_changed"
              value={actionInput()}
              onValueChange={(value) => {
                setActionInput(value);
              }}
            />
            <Button type="submit" variant="outline">
              筛选
            </Button>
            <Show when={actionFilter()}>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setActionInput("");
                  setActionFilter("");
                  setPage(0);
                }}
              >
                清除
              </Button>
            </Show>
          </form>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>时间</TableHead>
                <TableHead>操作人</TableHead>
                <TableHead>操作</TableHead>
                <TableHead>目标</TableHead>
                <TableHead>变更摘要</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <For each={data()?.items ?? []}>
                {(event) => (
                  <TableRow>
                    <TableCell class="whitespace-nowrap">
                      {new Date(event.occurredAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <span>{event.actorName}</span>
                      <span class="text-muted-foreground ml-2 text-xs">{event.actorId}</span>
                    </TableCell>
                    <TableCell>{actionLabels[event.action] ?? event.action}</TableCell>
                    <TableCell>
                      <span>{targetLabel(event.targetType)}</span>
                      <Show when={event.targetId}>
                        <span class="text-muted-foreground ml-2 font-mono text-xs">
                          {event.targetId}
                        </span>
                      </Show>
                    </TableCell>
                    <TableCell>{formatSummary(event)}</TableCell>
                  </TableRow>
                )}
              </For>
              <Show when={(data()?.items.length ?? 0) === 0}>
                <TableRow>
                  <TableCell colspan={5} class="text-muted-foreground py-10 text-center">
                    还没有审计记录
                  </TableCell>
                </TableRow>
              </Show>
            </TableBody>
          </Table>
          <div class="mt-4 flex items-center justify-between">
            <span class="text-muted-foreground text-sm">共 {data()?.total ?? 0} 条记录</span>
            <div class="flex gap-2">
              <Button variant="outline" disabled={page() === 0} onClick={() => setPage(page() - 1)}>
                上一页
              </Button>
              <Button
                variant="outline"
                disabled={page() >= lastPage()}
                onClick={() => setPage(page() + 1)}
              >
                下一页
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function targetLabel(targetType: string): string {
  const labels: Record<string, string> = {
    organization: "组织",
    member: "成员",
    invitation: "邀请",
    team: "团队",
    role: "角色",
    user: "用户",
  };
  return labels[targetType] ?? targetType;
}

function formatSummary(event: AuditEvent): string {
  return Object.entries(event.summary)
    .map(([key, value]) => {
      const label = summaryLabels[key] ?? key;
      return `${label}：${Array.isArray(value) ? value.join("、") : value}`;
    })
    .join("；");
}
