import { hasOrganizationOwnerRole } from "@org-saas/auth/organization-owner";
import { useQuery, useQueryClient } from "@tanstack/solid-query";
import { useRouter } from "@tanstack/solid-router";
import { createSignal, For, Show } from "solid-js";

import { authClient } from "@/lib/auth-client";
import { useOrgContext } from "@/lib/org-context";
import { syncOrganizationCacheAfterChange } from "@/lib/organization-cache";
import { grantableRolesQueryOptions } from "@/lib/query-options";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";
import { toast } from "@/ui/toast";

export function TransferOwnershipDialog(props: {
  members: Array<{
    id: string;
    userId: string;
    role: string;
    user: { name: string; email: string };
  }>;
  orgId: string;
}) {
  const orgCtx = useOrgContext();
  const queryClient = useQueryClient();
  const router = useRouter();
  const currentOwner = () => props.members.find((member) => hasOrganizationOwnerRole(member.role));
  const candidates = () => props.members.filter((member) => !hasOrganizationOwnerRole(member.role));
  const [targetMemberId, setTargetMemberId] = createSignal(candidates()[0]?.id ?? "");
  const [formerOwnerRole, setFormerOwnerRole] = createSignal("member");
  const [open, setOpen] = createSignal(false);
  const [isPending, setIsPending] = createSignal(false);
  const rolesQuery = useQuery(() =>
    grantableRolesQueryOptions(orgCtx.userId, props.orgId, "member.update"),
  );
  const roles = () => rolesQuery.data ?? [];

  const transferOwnership = async () => {
    if (!targetMemberId() || !roles().some((role) => role.name === formerOwnerRole())) return;
    setIsPending(true);
    try {
      const result = await authClient.organization.transferOwnership({
        organizationId: props.orgId,
        newOwnerMemberId: targetMemberId(),
        formerOwnerRole: formerOwnerRole(),
      });
      if (result.error) throw new Error(result.error.message ?? "所有权转让失败");
      toast.add({ title: "组织所有权已转让", type: "success" });
      setOpen(false);
      await syncOrganizationCacheAfterChange(
        queryClient,
        orgCtx.userId,
        props.orgId,
        "ownership-transferred",
      );
      await router.invalidate();
    } catch (error) {
      toast.add({
        title: error instanceof Error ? error.message : "所有权转让失败，请重试",
        type: "error",
      });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Show
      when={currentOwner() && currentOwner()!.userId === orgCtx.userId && candidates().length > 0}
    >
      <AlertDialog open={open()} onOpenChange={setOpen}>
        <AlertDialogTrigger render={(p) => <Button {...p} variant="outline" />}>
          转让组织所有权
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>转让“{currentOwner()?.user.name}”的组织所有权？</AlertDialogTitle>
            <AlertDialogDescription>
              新 owner 将获得组织所有权；你将保留所选角色。转让完成后，你的管理权限会按新角色变化。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div class="flex flex-col gap-4">
            <Select
              value={targetMemberId()}
              onValueChange={(value) => setTargetMemberId(value ?? "")}
            >
              <SelectTrigger aria-label="选择新 owner">
                <SelectValue placeholder="选择新 owner" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <For each={candidates()}>
                    {(member) => (
                      <SelectItem value={member.id}>
                        {member.user.name}（{member.user.email}）· {member.role}
                      </SelectItem>
                    )}
                  </For>
                </SelectGroup>
              </SelectContent>
            </Select>
            <Select
              value={formerOwnerRole()}
              onValueChange={(value) => setFormerOwnerRole(value ?? "")}
              disabled={rolesQuery.isPending || rolesQuery.isError}
            >
              <SelectTrigger aria-label="选择转让后的角色">
                <SelectValue placeholder="选择你转让后的角色" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <For each={roles().filter((role) => role.name !== "owner")}>
                    {(role) => (
                      <SelectItem value={role.name}>
                        {role.name}
                        {role.custom ? "（自定义）" : ""}
                      </SelectItem>
                    )}
                  </For>
                </SelectGroup>
              </SelectContent>
            </Select>
            <Show when={rolesQuery.isError}>
              <p role="alert" class="text-destructive text-sm">
                无法读取可分配角色，请关闭后重试。
              </p>
            </Show>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending()}>取消</AlertDialogCancel>
            <AlertDialogAction
              disabled={
                isPending() ||
                rolesQuery.isPending ||
                rolesQuery.isError ||
                !targetMemberId() ||
                !roles().some((role) => role.name === formerOwnerRole())
              }
              onClick={() => void transferOwnership()}
            >
              {isPending() ? "转让中…" : "确认转让"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Show>
  );
}
