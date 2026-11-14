import { useMutation, useQuery, useQueryClient } from "@tanstack/solid-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/solid-router";
import { createSignal, For, Show } from "solid-js";

import { UserAvatar } from "@/components/user-avatar";
import { usePermission } from "@/hooks/use-permission";
import { authClient } from "@/lib/auth-client";
import { useOrgContext } from "@/lib/org-context";
import { syncOrganizationCacheAfterChange } from "@/lib/organization-cache";
import { organizationFullQueryOptions } from "@/lib/query-options";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/ui/alert-dialog";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";
import { toast } from "@/ui/toast";

import { EditTeamDialog } from "./-components/edit-team-dialog";

export const Route = createFileRoute("/_authenticated/org/$orgSlug/_active/teams/$teamId")({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(
      organizationFullQueryOptions(context.user.id, context.org.id),
    );
  },
  component: TeamDetailPage,
});

function TeamDetailPage() {
  const orgCtx = useOrgContext();
  const params = Route.useParams();
  const canDeleteTeam = usePermission({ team: ["delete"] });
  const canUpdateTeam = usePermission({ team: ["update"] });
  const canManageTeamMembers = usePermission({ member: ["update"] });
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [deleteOpen, setDeleteOpen] = createSignal(false);
  const [editOpen, setEditOpen] = createSignal(false);
  const [selectedUserId, setSelectedUserId] = createSignal("");
  const orgQuery = useQuery(() => organizationFullQueryOptions(orgCtx.userId, orgCtx.org.id));

  const teams = () =>
    (orgQuery.data?.teams as unknown as
      | Array<{
          id: string;
          name: string;
          members?: Array<{
            userId: string;
            user: { name: string; email: string; image?: string | null };
          }>;
        }>
      | undefined) ?? [];
  const team = () => teams().find((candidate) => candidate.id === params().teamId);
  const teamMembers = () => team()?.members ?? [];
  const organizationMembers = () => orgQuery.data?.members ?? [];
  const availableMembers = () => {
    const assigned = new Set(teamMembers().map((member) => member.userId));
    return organizationMembers().filter((member) => !assigned.has(member.userId));
  };

  const teamMemberMutation = useMutation(() => ({
    mutationFn: async (input: { userId: string; action: "add" | "remove" }) => {
      const result =
        input.action === "add"
          ? await authClient.organization.addTeamMember({
              teamId: params().teamId,
              userId: input.userId,
              organizationId: orgCtx.org.id,
            })
          : await authClient.organization.removeTeamMember({
              teamId: params().teamId,
              userId: input.userId,
              organizationId: orgCtx.org.id,
            });
      if (result.error) throw new Error(result.error.message ?? "团队成员更新失败");
    },
    onSuccess: async (_, input) => {
      toast.add({
        title: input.action === "add" ? "成员已加入团队" : "成员已移出团队",
        type: "success",
      });
      if (input.action === "add") setSelectedUserId("");
      await syncOrganizationCacheAfterChange(
        queryClient,
        orgCtx.userId,
        orgCtx.org.id,
        "team-member-changed",
      );
    },
    onError: (error) => toast.add({ title: error.message || "团队成员更新失败", type: "error" }),
  }));

  const deleteMutation = useMutation(() => ({
    mutationFn: async () => {
      const result = await authClient.organization.removeTeam({
        teamId: params().teamId,
        organizationId: orgCtx.org.id,
      });
      if (result.error) throw new Error(result.error.message ?? "删除团队失败");
    },
    onSuccess: async () => {
      toast.add({ title: "团队已删除", type: "success" });
      setDeleteOpen(false);
      await syncOrganizationCacheAfterChange(
        queryClient,
        orgCtx.userId,
        orgCtx.org.id,
        "team-deleted",
      );
      await navigate({ to: "/org/$orgSlug/teams", params: { orgSlug: params().orgSlug } });
    },
    onError: (error) => toast.add({ title: error.message || "删除失败，请重试", type: "error" }),
  }));

  return (
    <Show
      when={team()}
      fallback={
        <div class="p-6">
          <p class="text-muted-foreground">团队不存在</p>
        </div>
      }
    >
      {(current) => (
        <div class="p-6">
          <div class="mb-6">
            <Link
              to="/org/$orgSlug/teams"
              params={{ orgSlug: params().orgSlug }}
              class="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1 text-sm"
            >
              返回团队列表
            </Link>
            <div class="flex items-center justify-between">
              <h1 class="text-2xl font-bold">{current().name}</h1>
              <div class="flex items-center gap-2">
                <Show when={canUpdateTeam}>
                  <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
                    修改名称
                  </Button>
                </Show>
                <Show when={canDeleteTeam}>
                  <AlertDialog open={deleteOpen()} onOpenChange={setDeleteOpen}>
                    <AlertDialogTrigger
                      render={(p) => (
                        <Button
                          {...p}
                          variant="destructive"
                          size="sm"
                          disabled={deleteMutation.isPending}
                        />
                      )}
                    >
                      删除团队
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>删除团队“{current().name}”？</AlertDialogTitle>
                        <AlertDialogDescription>团队成员关系会被移除。</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleteMutation.isPending}>
                          取消
                        </AlertDialogCancel>
                        <AlertDialogAction
                          variant="destructive"
                          disabled={deleteMutation.isPending}
                          onClick={() => void deleteMutation.mutate()}
                        >
                          {deleteMutation.isPending ? "删除中…" : "确认删除"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </Show>
              </div>
            </div>
          </div>

          <Card>
            <CardHeader class="flex-row items-center justify-between gap-4">
              <CardTitle class="text-base">团队成员</CardTitle>
              <Show when={canManageTeamMembers}>
                <div class="flex items-center gap-2">
                  <Select
                    value={selectedUserId()}
                    onValueChange={(value) => setSelectedUserId(value ?? "")}
                  >
                    <SelectTrigger aria-label="选择要加入团队的组织成员" class="min-w-56">
                      <SelectValue placeholder="选择组织成员" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <For each={availableMembers()}>
                          {(member) => (
                            <SelectItem value={member.userId}>
                              {member.user.name}（{member.user.email}）
                            </SelectItem>
                          )}
                        </For>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    disabled={!selectedUserId() || teamMemberMutation.isPending}
                    onClick={() =>
                      void teamMemberMutation.mutate({ userId: selectedUserId(), action: "add" })
                    }
                  >
                    {teamMemberMutation.isPending ? "处理中…" : "加入团队"}
                  </Button>
                </div>
              </Show>
            </CardHeader>
            <CardContent>
              <Show
                when={teamMembers().length > 0}
                fallback={<p class="text-muted-foreground text-sm">此团队暂无成员</p>}
              >
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>成员</TableHead>
                      <Show when={canManageTeamMembers}>
                        <TableHead class="w-24">操作</TableHead>
                      </Show>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <For each={teamMembers()}>
                      {(member) => (
                        <TableRow>
                          <TableCell>
                            <div class="flex items-center gap-3">
                              <UserAvatar name={member.user.name} image={member.user.image} />
                              <div>
                                <p class="font-medium">{member.user.name}</p>
                                <p class="text-muted-foreground text-sm">{member.user.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <Show when={canManageTeamMembers}>
                            <TableCell>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={teamMemberMutation.isPending}
                                onClick={() =>
                                  void teamMemberMutation.mutate({
                                    userId: member.userId,
                                    action: "remove",
                                  })
                                }
                              >
                                移出团队
                              </Button>
                            </TableCell>
                          </Show>
                        </TableRow>
                      )}
                    </For>
                  </TableBody>
                </Table>
              </Show>
            </CardContent>
          </Card>
          <EditTeamDialog
            open={editOpen()}
            onOpenChange={setEditOpen}
            orgId={orgCtx.org.id}
            teamId={current().id}
            teamName={current().name}
          />
        </div>
      )}
    </Show>
  );
}
