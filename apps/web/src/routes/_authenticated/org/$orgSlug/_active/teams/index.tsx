import { useQuery } from "@tanstack/solid-query";
import { createFileRoute, Link } from "@tanstack/solid-router";
import { createSignal, For, Show } from "solid-js";

import { usePermission } from "@/hooks/use-permission";
import { useOrgContext } from "@/lib/org-context";
import { organizationFullQueryOptions } from "@/lib/query-options";
import { Button } from "@/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/ui/card";

import { CreateTeamDialog } from "./-components/create-team-dialog";

export const Route = createFileRoute("/_authenticated/org/$orgSlug/_active/teams/")({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(
      organizationFullQueryOptions(context.user.id, context.org.id),
    );
  },
  component: TeamsPage,
});

function TeamsPage() {
  const orgCtx = useOrgContext();
  const params = Route.useParams();
  const canCreateTeam = usePermission({ team: ["create"] });
  const [createOpen, setCreateOpen] = createSignal(false);
  const orgQuery = useQuery(() => organizationFullQueryOptions(orgCtx.userId, orgCtx.org.id));
  const teams = () => orgQuery.data?.teams ?? [];

  return (
    <div class="p-6">
      <div class="mb-6 flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold">团队管理</h1>
          <p class="text-muted-foreground text-sm">创建和管理组织内的团队</p>
        </div>
        <Show when={canCreateTeam}>
          <Button onClick={() => setCreateOpen(true)}>创建团队</Button>
        </Show>
      </div>

      <Show
        when={teams().length > 0}
        fallback={
          <Card class="flex flex-col items-center justify-center py-12">
            <CardHeader class="items-center p-0">
              <CardTitle class="text-lg">还没有团队</CardTitle>
              <CardDescription>创建第一个团队来组织成员</CardDescription>
            </CardHeader>
          </Card>
        }
      >
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <For each={teams()}>
            {(team) => (
              <Link
                to="/org/$orgSlug/teams/$teamId"
                params={{ orgSlug: params().orgSlug, teamId: team.id }}
              >
                <Card class="hover:bg-accent/50 cursor-pointer transition-colors">
                  <CardHeader>
                    <CardTitle class="text-base">{team.name}</CardTitle>
                  </CardHeader>
                </Card>
              </Link>
            )}
          </For>
        </div>
      </Show>

      <CreateTeamDialog open={createOpen()} onOpenChange={setCreateOpen} orgId={orgCtx.org.id} />
    </div>
  );
}
