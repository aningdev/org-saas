import { createFileRoute, Link } from "@tanstack/solid-router";

import { UserAvatar } from "@/components/user-avatar";
import { Button } from "@/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/ui/card";

export const Route = createFileRoute("/_authenticated/me/")({
  component: PersonalOverview,
});

function PersonalOverview() {
  const routeCtx = Route.useRouteContext();

  return (
    <div class="mx-auto max-w-3xl space-y-6 p-6">
      <div>
        <h1 class="text-2xl font-bold">个人中心</h1>
        <p class="text-muted-foreground text-sm">管理你的个人资料和组织入口</p>
      </div>

      <Card>
        <CardHeader class="flex-row items-center gap-4">
          <UserAvatar name={routeCtx().user.name} image={routeCtx().user.image} size="lg" />
          <div class="min-w-0">
            <CardTitle class="truncate">{routeCtx().user.name}</CardTitle>
            <CardDescription class="truncate">{routeCtx().user.email}</CardDescription>
          </div>
        </CardHeader>
      </Card>

      <div class="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <BuildingIcon class="text-muted-foreground mb-2 size-5" />
            <CardTitle>我的组织</CardTitle>
            <CardDescription>查看你可以访问的组织，或创建新组织</CardDescription>
            <Button render={(p) => <Link {...p} to="/me/organizations" />} class="mt-2 w-fit">
              查看组织
            </Button>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <UserIcon class="text-muted-foreground mb-2 size-5" />
            <CardTitle>个人资料</CardTitle>
            <CardDescription>更新你的姓名和头像</CardDescription>
            <Button
              variant="outline"
              render={(p) => <Link {...p} to="/me/settings/profile" />}
              class="mt-2 w-fit"
            >
              编辑资料
            </Button>
          </CardHeader>
        </Card>
      </div>
    </div>
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

function UserIcon(props: { class?: string }) {
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
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
