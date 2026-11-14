import { useMutation, useQuery, useQueryClient } from "@tanstack/solid-query";
import { For, Show } from "solid-js";

import { authClient } from "@/lib/auth-client";
import { useOrgContext } from "@/lib/org-context";
import { syncOrganizationCacheAfterChange } from "@/lib/organization-cache";
import { grantableRolesQueryOptions } from "@/lib/query-options";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";
import { toast } from "@/ui/toast";

export function RoleSelect(props: { memberId: string; currentRole: string }) {
  const orgCtx = useOrgContext();
  const queryClient = useQueryClient();
  const rolesQuery = useQuery(() =>
    grantableRolesQueryOptions(orgCtx.userId, orgCtx.org.id, "member.update"),
  );
  const roles = () => rolesQuery.data ?? [];
  const mutation = useMutation(() => ({
    mutationFn: async (role: string) => {
      const result = await authClient.organization.updateMemberRole({
        memberId: props.memberId,
        role: role as "admin" | "member" | "owner",
        organizationId: orgCtx.org.id,
      });
      if (result.error) throw new Error(result.error.message ?? "角色更新失败");
    },
    onSuccess: async () => {
      toast.add({ title: "角色已更新", type: "success" });
      await syncOrganizationCacheAfterChange(
        queryClient,
        orgCtx.userId,
        orgCtx.org.id,
        "member-role-updated",
      );
    },
    onError: (error) => toast.add({ title: error.message || "角色更新失败", type: "error" }),
  }));

  return (
    <Show
      when={!rolesQuery.isPending}
      fallback={<span class="text-muted-foreground text-sm">读取可授予角色…</span>}
    >
      <Show
        when={!rolesQuery.isError}
        fallback={<span class="text-destructive text-sm">无法读取角色</span>}
      >
        <Show
          when={roles().some((role) => role.name === props.currentRole)}
          fallback={<span class="text-sm">{props.currentRole}</span>}
        >
          <div class="space-y-2">
            <Select
              value={props.currentRole}
              onValueChange={(role) => {
                if (role && role !== props.currentRole) void mutation.mutate(role);
              }}
              disabled={mutation.isPending}
            >
              <SelectTrigger class="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <For each={roles()}>
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
            <Show when={mutation.isPending}>
              <span role="status" class="text-muted-foreground text-xs">
                正在更新角色…
              </span>
            </Show>
          </div>
        </Show>
      </Show>
    </Show>
  );
}
