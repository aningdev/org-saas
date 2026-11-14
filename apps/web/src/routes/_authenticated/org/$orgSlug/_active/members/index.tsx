import { useQuery } from "@tanstack/solid-query";
import { createFileRoute } from "@tanstack/solid-router";
import { createSignal, Show } from "solid-js";

import { usePermission } from "@/hooks/use-permission";
import { useOrgContext } from "@/lib/org-context";
import { organizationFullQueryOptions } from "@/lib/query-options";
import { Button } from "@/ui/button";

import { InviteMemberDialog } from "./-components/invite-member-dialog";
import { MemberTable } from "./-components/member-table";

export const Route = createFileRoute("/_authenticated/org/$orgSlug/_active/members/")({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(
      organizationFullQueryOptions(context.user.id, context.org.id),
    );
  },
  component: MembersPage,
});

function MembersPage() {
  const orgCtx = useOrgContext();
  const canInvite = usePermission({ invitation: ["create"] });
  const [inviteOpen, setInviteOpen] = createSignal(false);
  const orgQuery = useQuery(() => organizationFullQueryOptions(orgCtx.userId, orgCtx.org.id));

  const members = () => orgQuery.data?.members ?? [];
  const invitations = () => orgQuery.data?.invitations ?? [];

  return (
    <div class="p-6">
      <div class="mb-6 flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold">成员管理</h1>
          <p class="text-muted-foreground text-sm">查看成员并管理当前权限允许的操作</p>
        </div>
        <Show when={canInvite}>
          <Button onClick={() => setInviteOpen(true)}>邀请成员</Button>
        </Show>
      </div>

      <MemberTable members={members()} invitations={invitations()} orgId={orgCtx.org.id} />
      <Show when={canInvite}>
        <InviteMemberDialog
          open={inviteOpen()}
          onOpenChange={setInviteOpen}
          orgId={orgCtx.org.id}
        />
      </Show>
    </div>
  );
}
