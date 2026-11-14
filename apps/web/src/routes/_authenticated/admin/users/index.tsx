import { useMutation, useQuery, useQueryClient } from "@tanstack/solid-query";
import { createFileRoute } from "@tanstack/solid-router";
import { createSignal, For, Show, type Accessor } from "solid-js";

import { authClient } from "@/lib/auth-client";
import {
  platformQueryKeys,
  platformUserSessionsQueryOptions,
  platformUsersQueryOptions,
} from "@/lib/query-options";
import { Alert, AlertDescription, AlertTitle } from "@/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/ui/alert-dialog";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/ui/field";
import { Input } from "@/ui/input";
import { Skeleton } from "@/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";
import { toast } from "@/ui/toast";

const PAGE_SIZE = 25;

export const Route = createFileRoute("/_authenticated/admin/users/")({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(
      platformUsersQueryOptions(context.user.id, { limit: PAGE_SIZE, offset: 0 }),
    );
  },
  component: PlatformUsersPage,
});

function PlatformUsersPage() {
  const routeCtx = Route.useRouteContext();
  const queryClient = useQueryClient();
  const [search, setSearch] = createSignal("");
  const [page, setPage] = createSignal(0);
  const [banTarget, setBanTarget] = createSignal<{
    id: string;
    name: string;
    banned: boolean;
  } | null>(null);
  const [banReason, setBanReason] = createSignal("");
  const [sessionsTarget, setSessionsTarget] = createSignal<{ id: string; name: string } | null>(
    null,
  );
  const [revokeSessionsOpen, setRevokeSessionsOpen] = createSignal(false);

  const query = useQuery(() =>
    platformUsersQueryOptions(routeCtx().user.id, {
      search: search().trim() || undefined,
      limit: PAGE_SIZE,
      offset: page() * PAGE_SIZE,
    }),
  );
  const data = () => query.data;
  const pageCount = () => Math.max(1, Math.ceil((data()?.total ?? 0) / PAGE_SIZE));

  const banMutation = useMutation(() => ({
    mutationFn: async (target: { id: string; banned: boolean; reason: string }) => {
      const result = target.banned
        ? await authClient.admin.unbanUser({ userId: target.id })
        : await authClient.admin.banUser({
            userId: target.id,
            banReason: target.reason,
          });
      if (result.error) throw new Error(result.error.message ?? "更新账号状态失败");
    },
    onSuccess: async (_result, target) => {
      toast.add({ title: target.banned ? "用户已解封" : "用户已封禁", type: "success" });
      setBanTarget(null);
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: [...platformQueryKeys.root(routeCtx().user.id), "users"],
        }),
        queryClient.invalidateQueries({
          queryKey: platformQueryKeys.userSessions(routeCtx().user.id, target.id),
        }),
      ]);
    },
    onError: (error) => toast.add({ title: error.message || "更新账号状态失败", type: "error" }),
  }));

  const revokeSessionsMutation = useMutation(() => ({
    mutationFn: async (targetUserId: string) => {
      const result = await authClient.admin.revokeUserSessions({ userId: targetUserId });
      if (result.error) throw new Error(result.error.message ?? "撤销会话失败");
    },
    onSuccess: async () => {
      toast.add({ title: "用户会话已撤销", type: "success" });
      setRevokeSessionsOpen(false);
      const target = sessionsTarget();
      if (target) {
        await queryClient.invalidateQueries({
          queryKey: platformQueryKeys.userSessions(routeCtx().user.id, target.id),
        });
      }
    },
    onError: (error) => toast.add({ title: error.message || "撤销会话失败", type: "error" }),
  }));

  return (
    <div class="flex flex-col gap-6 p-6">
      <div>
        <h1 class="text-2xl font-bold">平台用户</h1>
        <p class="text-muted-foreground text-sm">查询普通用户、管理账号封禁状态及登录会话。</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>用户目录</CardTitle>
          <CardDescription>平台管理员账号不出现在普通用户管理列表中。</CardDescription>
        </CardHeader>
        <CardContent class="flex flex-col gap-4">
          <FieldGroup class="gap-2">
            <Field>
              <FieldLabel for="user-search">按姓名或邮箱搜索</FieldLabel>
              <Input
                id="user-search"
                value={search()}
                onValueChange={(value) => {
                  setSearch(value);
                  setPage(0);
                }}
                placeholder="输入姓名或邮箱"
              />
            </Field>
          </FieldGroup>

          <Show when={query.isError}>
            <Alert variant="destructive">
              <AlertTitle>无法读取用户</AlertTitle>
              <AlertDescription>{query.error?.message}</AlertDescription>
            </Alert>
          </Show>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>用户</TableHead>
                <TableHead>邮箱验证</TableHead>
                <TableHead>账号状态</TableHead>
                <TableHead>注册时间</TableHead>
                <TableHead>管理</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <Show
                when={!query.isPending}
                fallback={
                  <For each={[0, 1, 2, 3]}>
                    {() => (
                      <TableRow>
                        <TableCell colspan={5}>
                          <Skeleton class="h-5 w-full" />
                        </TableCell>
                      </TableRow>
                    )}
                  </For>
                }
              >
                <Show
                  when={(data()?.items.length ?? 0) > 0}
                  fallback={
                    <TableRow>
                      <TableCell colspan={5} class="text-muted-foreground py-10 text-center">
                        没有匹配的用户
                      </TableCell>
                    </TableRow>
                  }
                >
                  <For each={data()?.items ?? []}>
                    {(item) => (
                      <TableRow>
                        <TableCell>
                          <div class="font-medium">{item.name}</div>
                          <div class="text-muted-foreground text-sm">{item.email}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={item.emailVerified ? "secondary" : "outline"}>
                            {item.emailVerified ? "已验证" : "未验证"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={item.banned ? "destructive" : "secondary"}>
                            {item.banned ? "已封禁" : "正常"}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(item.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div class="flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSessionsTarget({ id: item.id, name: item.name })}
                            >
                              管理会话
                            </Button>
                            <Button
                              size="sm"
                              variant={item.banned ? "outline" : "destructive"}
                              onClick={() => {
                                setBanReason("");
                                setBanTarget({
                                  id: item.id,
                                  name: item.name,
                                  banned: item.banned,
                                });
                              }}
                            >
                              {item.banned ? "解封" : "封禁"}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </For>
                </Show>
              </Show>
            </TableBody>
          </Table>

          <div class="flex items-center justify-between">
            <p class="text-muted-foreground text-sm">
              共 {data()?.total ?? 0} 个用户 · 第 {page() + 1} / {pageCount()} 页
            </p>
            <div class="flex gap-2">
              <Button
                variant="outline"
                disabled={page() === 0 || query.isFetching}
                onClick={() => setPage((current) => Math.max(0, current - 1))}
              >
                上一页
              </Button>
              <Button
                variant="outline"
                disabled={page() + 1 >= pageCount() || query.isFetching}
                onClick={() => setPage((current) => current + 1)}
              >
                下一页
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={sessionsTarget() !== null}
        onOpenChange={(open) => !open && setSessionsTarget(null)}
      >
        <DialogContent>
          <Show when={sessionsTarget()}>
            {(target) => (
              <SessionsPanel
                userId={routeCtx().user.id}
                target={target}
                revokeOpen={revokeSessionsOpen}
                setRevokeOpen={setRevokeSessionsOpen}
                revokePending={() => revokeSessionsMutation.isPending}
                onRevoke={() => {
                  const current = sessionsTarget();
                  if (current) void revokeSessionsMutation.mutate(current.id);
                }}
              />
            )}
          </Show>
        </DialogContent>
      </Dialog>

      <AlertDialog open={banTarget() !== null} onOpenChange={(open) => !open && setBanTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {banTarget()?.banned ? "解封" : "封禁"}用户“{banTarget()?.name}”？
            </AlertDialogTitle>
            <AlertDialogDescription>
              {banTarget()?.banned
                ? "该用户将可以重新登录。"
                : "封禁会阻止该用户登录，平台管理员账号不在此列表中。"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Show when={banTarget() && !banTarget()!.banned}>
            <Field>
              <FieldLabel for="platform-ban-reason">封禁原因</FieldLabel>
              <Input
                id="platform-ban-reason"
                value={banReason()}
                onValueChange={(value) => {
                  setBanReason(value);
                }}
                placeholder="说明封禁原因"
                disabled={banMutation.isPending}
              />
            </Field>
          </Show>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={banMutation.isPending}>取消</AlertDialogCancel>
            <AlertDialogAction
              variant={banTarget()?.banned ? "default" : "destructive"}
              disabled={
                !banTarget() ||
                banMutation.isPending ||
                (!!banTarget() && !banTarget()!.banned && !banReason().trim())
              }
              onClick={() => {
                const target = banTarget();
                if (target) void banMutation.mutate({ ...target, reason: banReason().trim() });
              }}
            >
              {banMutation.isPending ? "处理中…" : banTarget()?.banned ? "确认解封" : "确认封禁"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={revokeSessionsOpen()} onOpenChange={setRevokeSessionsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>撤销 {sessionsTarget()?.name} 的全部会话？</AlertDialogTitle>
            <AlertDialogDescription>
              该用户的所有现有登录会话都会失效，需要重新登录。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={revokeSessionsMutation.isPending}>取消</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={!sessionsTarget() || revokeSessionsMutation.isPending}
              onClick={() => {
                const target = sessionsTarget();
                if (target) void revokeSessionsMutation.mutate(target.id);
              }}
            >
              {revokeSessionsMutation.isPending ? "撤销中…" : "确认撤销"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function SessionsPanel(props: {
  userId: string;
  target: Accessor<{ id: string; name: string }>;
  revokeOpen: Accessor<boolean>;
  setRevokeOpen: (open: boolean) => void;
  revokePending: Accessor<boolean>;
  onRevoke: () => void;
}) {
  const sessionsQuery = useQuery(() =>
    platformUserSessionsQueryOptions(props.userId, props.target().id),
  );

  return (
    <>
      <DialogHeader>
        <DialogTitle>{props.target().name} 的登录会话</DialogTitle>
        <DialogDescription>查看会话时间和客户端信息，或撤销该用户的全部会话。</DialogDescription>
      </DialogHeader>
      <Show
        when={!sessionsQuery.isPending}
        fallback={
          <p role="status" class="text-muted-foreground text-sm">
            正在读取会话…
          </p>
        }
      >
        <Show
          when={!sessionsQuery.isError}
          fallback={
            <Alert variant="destructive">
              <AlertTitle>无法读取会话</AlertTitle>
              <AlertDescription>{sessionsQuery.error?.message}</AlertDescription>
            </Alert>
          }
        >
          <Show
            when={(sessionsQuery.data?.length ?? 0) > 0}
            fallback={<p class="text-muted-foreground text-sm">此用户没有有效会话。</p>}
          >
            <div class="max-h-64 space-y-3 overflow-y-auto">
              <For each={sessionsQuery.data ?? []}>
                {(session) => (
                  <div class="border-border rounded-md border p-3 text-sm">
                    <p>创建时间：{new Date(session.createdAt).toLocaleString()}</p>
                    <p>到期时间：{new Date(session.expiresAt).toLocaleString()}</p>
                    <p class="text-muted-foreground">IP：{session.ipAddress ?? "未知"}</p>
                    <p class="text-muted-foreground break-all">
                      设备：{session.userAgent ?? "未知"}
                    </p>
                  </div>
                )}
              </For>
            </div>
          </Show>
        </Show>
      </Show>
      <Button
        variant="destructive"
        disabled={!sessionsQuery.data?.length || props.revokePending()}
        onClick={() => props.setRevokeOpen(true)}
      >
        撤销全部会话
      </Button>
    </>
  );
}
