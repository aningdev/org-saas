import { useQuery } from "@tanstack/solid-query";
import { createFileRoute, useNavigate } from "@tanstack/solid-router";
import { For, Show } from "solid-js";

import { UserAvatar } from "@/components/user-avatar";
import { orgListQueryOptions } from "@/lib/query-options";
import { Button } from "@/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/ui/card";

export const Route = createFileRoute("/_authenticated/me/organizations/")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(orgListQueryOptions(context.user.id)),
  component: DashboardIndex,
});

function DashboardIndex() {
  const navigate = useNavigate();
  const routeCtx = Route.useRouteContext();
  const orgsQuery = useQuery(() => orgListQueryOptions(routeCtx().user.id));
  const orgs = () => orgsQuery.data ?? [];

  return (
    <div class="p-6">
      <div class="mb-6 flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold">我的组织</h1>
          <p class="text-muted-foreground text-sm">管理你已加入的组织和个人设置</p>
        </div>
        <Button onClick={() => navigate({ to: "/me/organizations/new" })}>
          <PlusIcon class="size-4" />
          创建组织
        </Button>
      </div>

      <h2 class="mb-4 text-lg font-semibold">我的组织</h2>

      <Show
        when={orgs().length > 0}
        fallback={
          <Card class="flex flex-col items-center justify-center py-12">
            <BuildingIcon class="text-muted-foreground mb-4 size-12" />
            <CardHeader class="items-center p-0">
              <CardTitle class="text-lg">还没有加入任何组织</CardTitle>
              <CardDescription>创建一个新组织或等待邀请加入</CardDescription>
            </CardHeader>
          </Card>
        }
      >
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <For each={orgs()}>
            {(org) => (
              <Card
                class="hover:bg-accent/50 cursor-pointer transition-colors"
                onClick={() => navigate({ to: `/org/${org.slug}` as string })}
              >
                <CardHeader class="flex-row items-center gap-3">
                  <UserAvatar name={org.name} image={org.logo} size="lg" />
                  <div class="min-w-0 flex-1">
                    <CardTitle class="truncate text-base">{org.name}</CardTitle>
                    <CardDescription class="text-xs">/{org.slug}</CardDescription>
                  </div>
                </CardHeader>
              </Card>
            )}
          </For>
        </div>
      </Show>
    </div>
  );
}

function PlusIcon(props: { class?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
      class={props.class}
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}

function BuildingIcon(props: { class?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
      class={props.class}
    >
      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
      <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
      <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
    </svg>
  );
}
