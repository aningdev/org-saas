import { useQuery } from "@tanstack/solid-query";
import { createFileRoute } from "@tanstack/solid-router";
import { createSignal, For, Show } from "solid-js";

import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Input } from "@/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";
import { orpc } from "@/utils/orpc";

const pageSize = 25;

const actionLabels: Record<string, string> = {
  "user.banned": "封禁用户",
  "user.unbanned": "解除封禁",
  "session.revoked": "撤销用户会话",
  "session.revoked_all": "撤销用户全部会话",
};

export const Route = createFileRoute("/_authenticated/admin/audit/")({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(
      // @ts-expect-error orpc query utils target react-query option types
      orpc.audit.listPlatformEvents.queryOptions({ input: { limit: pageSize, offset: 0 } }),
    );
  },
  component: PlatformAuditPage,
});

function PlatformAuditPage() {
  const [page, setPage] = createSignal(0);
  const [actionInput, setActionInput] = createSignal("");
  const [actionFilter, setActionFilter] = createSignal("");
  const query = useQuery(() =>
    // @ts-expect-error orpc query utils target react-query option types
    orpc.audit.listPlatformEvents.queryOptions({
      input: {
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
        <h1 class="text-2xl font-bold">平台审计</h1>
        <p class="text-muted-foreground text-sm">
          记录平台管理员的用户封禁和会话撤销操作，保留 180 天。
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>管理操作</CardTitle>
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
              placeholder="操作标识，例如 user.banned"
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
                <TableHead>目标用户</TableHead>
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
                      {event.actorName}
                      <span class="text-muted-foreground ml-2 text-xs">{event.actorId}</span>
                    </TableCell>
                    <TableCell>{actionLabels[event.action] ?? event.action}</TableCell>
                    <TableCell class="font-mono text-xs">{event.targetId ?? "—"}</TableCell>
                  </TableRow>
                )}
              </For>
              <Show when={(data()?.items.length ?? 0) === 0}>
                <TableRow>
                  <TableCell colspan={4} class="text-muted-foreground py-10 text-center">
                    还没有平台审计记录
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
