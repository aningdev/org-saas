import { hasOrganizationOwnerRole } from "@org-saas/auth/organization-owner";
import { useQueryClient } from "@tanstack/solid-query";
import { useNavigate } from "@tanstack/solid-router";
import { createSignal, For, Show } from "solid-js";

import { RoleBadge } from "@/components/role-badge";
import { UserAvatar } from "@/components/user-avatar";
import { usePermission } from "@/hooks/use-permission";
import { authClient } from "@/lib/auth-client";
import { useOrgContext } from "@/lib/org-context";
import { syncOrganizationCacheAfterChange } from "@/lib/organization-cache";
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
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";
import { toast } from "@/ui/toast";

import { RoleSelect } from "./role-select";
import { TransferOwnershipDialog } from "./transfer-ownership-dialog";

export function MemberTable(props: {
  members: Array<{
    id: string;
    userId: string;
    role: string;
    createdAt: Date;
    user: { name: string; email: string; image?: string | null };
  }>;
  invitations: Array<{
    id: string;
    email: string;
    role: string;
    status: string;
  }>;
  orgId: string;
}) {
  const orgCtx = useOrgContext();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [pendingAction, setPendingAction] = createSignal<string | null>(null);
  const [leaveOpen, setLeaveOpen] = createSignal(false);
  const canUpdateMembers = usePermission({ member: ["update"] });
  const canDeleteMembers = usePermission({ member: ["delete"] });
  const canCancelInvite = usePermission({ invitation: ["cancel"] });

  const handleRemoveMember = async (memberIdOrEmail: string) => {
    setPendingAction(memberIdOrEmail);
    try {
      const result = await authClient.organization.removeMember({
        memberIdOrEmail,
        organizationId: props.orgId,
      });
      if (result.error) throw new Error(result.error.message ?? "移除失败");
      toast.add({ title: "成员已移除", type: "success" });
      await syncOrganizationCacheAfterChange(
        queryClient,
        orgCtx.userId,
        props.orgId,
        "member-removed",
      );
    } catch (error) {
      toast.add({ title: error instanceof Error ? error.message : "移除失败", type: "error" });
    } finally {
      setPendingAction(null);
    }
  };

  const handleLeaveOrganization = async () => {
    setPendingAction("leave");
    try {
      const result = await authClient.organization.leave({ organizationId: props.orgId });
      if (result.error) throw new Error(result.error.message ?? "退出组织失败");
      toast.add({ title: "已退出组织", type: "success" });
      await syncOrganizationCacheAfterChange(
        queryClient,
        orgCtx.userId,
        props.orgId,
        "organization-left",
      );
      await navigate({ to: "/me/organizations" });
    } catch (error) {
      toast.add({
        title: error instanceof Error ? error.message : "退出组织失败",
        type: "error",
      });
    } finally {
      setPendingAction(null);
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    setPendingAction(invitationId);
    try {
      const result = await authClient.organization.cancelInvitation({ invitationId });
      if (result.error) throw new Error(result.error.message ?? "取消失败");
      toast.add({ title: "邀请已取消", type: "success" });
      await syncOrganizationCacheAfterChange(
        queryClient,
        orgCtx.userId,
        props.orgId,
        "invitation-canceled",
      );
    } catch (error) {
      toast.add({ title: error instanceof Error ? error.message : "取消失败", type: "error" });
    } finally {
      setPendingAction(null);
    }
  };

  const pendingInvitations = () => props.invitations.filter((inv) => inv.status === "pending");

  return (
    <div class="space-y-6">
      <Show when={pendingAction()}>
        <p role="status" class="text-muted-foreground text-sm">
          正在处理组织成员操作…
        </p>
      </Show>
      <div class="flex justify-end gap-2">
        <Show when={!orgCtx.isOwner}>
          <AlertDialog open={leaveOpen()} onOpenChange={setLeaveOpen}>
            <AlertDialogTrigger
              render={(p) => (
                <Button {...p} variant="outline" disabled={pendingAction() === "leave"} />
              )}
            >
              退出组织
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>退出当前组织？</AlertDialogTitle>
                <AlertDialogDescription>
                  退出后你将无法继续访问该组织。重新加入需要组织管理员再次邀请。
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={pendingAction() === "leave"}>取消</AlertDialogCancel>
                <AlertDialogAction
                  disabled={pendingAction() === "leave"}
                  onClick={() => void handleLeaveOrganization()}
                >
                  {pendingAction() === "leave" ? "退出中…" : "确认退出"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </Show>
        <Show when={orgCtx.isOwner}>
          <TransferOwnershipDialog members={props.members} orgId={props.orgId} />
        </Show>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>成员</TableHead>
            <TableHead>角色</TableHead>
            <TableHead class="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          <For each={props.members}>
            {(m) => (
              <TableRow>
                <TableCell>
                  <div class="flex items-center gap-3">
                    <UserAvatar name={m.user.name} image={m.user.image} />
                    <div>
                      <p class="font-medium">{m.user.name}</p>
                      <p class="text-muted-foreground text-sm">{m.user.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Show
                    when={canUpdateMembers && !hasOrganizationOwnerRole(m.role)}
                    fallback={<RoleBadge role={m.role} />}
                  >
                    <RoleSelect memberId={m.id} currentRole={m.role} />
                  </Show>
                </TableCell>
                <TableCell>
                  <Show when={canDeleteMembers && !hasOrganizationOwnerRole(m.role)}>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={(p) => <Button {...p} variant="ghost" size="icon" />}
                      >
                        ⋮
                      </DropdownMenuTrigger>
                      <DropdownMenuContent class="bg-card" align="end">
                        <DropdownMenuItem
                          variant="destructive"
                          disabled={pendingAction() === m.userId}
                          onSelect={() => void handleRemoveMember(m.userId)}
                        >
                          移除成员
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </Show>
                </TableCell>
              </TableRow>
            )}
          </For>
        </TableBody>
      </Table>

      <Show when={pendingInvitations().length > 0}>
        <div>
          <h3 class="mb-3 text-lg font-semibold">待处理邀请</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>邮箱</TableHead>
                <TableHead>角色</TableHead>
                <TableHead>状态</TableHead>
                <TableHead class="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              <For each={pendingInvitations()}>
                {(inv) => (
                  <TableRow>
                    <TableCell>{inv.email}</TableCell>
                    <TableCell>
                      <RoleBadge role={inv.role} />
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">待接受</Badge>
                    </TableCell>
                    <TableCell>
                      <Show when={canCancelInvite}>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={pendingAction() === inv.id}
                          onClick={() => void handleCancelInvitation(inv.id)}
                        >
                          ×
                        </Button>
                      </Show>
                    </TableCell>
                  </TableRow>
                )}
              </For>
            </TableBody>
          </Table>
        </div>
      </Show>
    </div>
  );
}
