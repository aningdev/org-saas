import { useQuery } from "@tanstack/solid-query";
import { createFileRoute } from "@tanstack/solid-router";
import { For } from "solid-js";

import { useOrgContext } from "@/lib/org-context";
import { organizationQueryKeys } from "@/lib/organization-query-keys";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/_authenticated/org/$orgSlug/_active/")({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(
      // @ts-expect-error orpc query utils target react-query option types
      orpc.dashboard.orgStats.queryOptions({
        input: { orgId: context.org.id },
        queryKey: organizationQueryKeys.dashboardStats(context.user.id, context.org.id),
      }),
    );
  },
  component: OrgDashboard,
});

function OrgDashboard() {
  const orgCtx = useOrgContext();

  const statsQuery = useQuery(() =>
    // @ts-expect-error orpc query utils target react-query option types
    orpc.dashboard.orgStats.queryOptions({
      input: { orgId: orgCtx.org.id },
      queryKey: organizationQueryKeys.dashboardStats(orgCtx.userId, orgCtx.org.id),
    }),
  );

  const statCards = () => [
    { label: "成员", value: statsQuery.data?.memberCount ?? 0 },
    { label: "团队", value: statsQuery.data?.teamCount ?? 0 },
    { label: "待处理邀请", value: statsQuery.data?.pendingInvitationCount ?? 0 },
  ];

  return (
    <div class="p-6">
      <h1 class="mb-6 text-2xl font-bold">{orgCtx.org.name}</h1>

      <div class="grid gap-4 sm:grid-cols-3">
        <For each={statCards()}>
          {(card) => (
            <Card>
              <CardHeader class="flex-row items-center justify-between pb-2">
                <CardTitle class="text-muted-foreground text-sm font-medium">
                  {card.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p class="text-2xl font-bold">{card.value}</p>
              </CardContent>
            </Card>
          )}
        </For>
      </div>
    </div>
  );
}
