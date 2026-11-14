import { useQueryClient } from "@tanstack/solid-query";
import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/solid-router";
import { For, Show } from "solid-js";

import { OrgSwitcher } from "@/components/org-switcher";
import { UserAvatar } from "@/components/user-avatar";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/ui/button";
import { Separator } from "@/ui/separator";
import { toast } from "@/ui/toast";

export const Route = createFileRoute("/_authenticated/me")({
  component: PersonalSpaceLayout,
});

function PersonalSpaceLayout() {
  const routeCtx = Route.useRouteContext();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const navItems = () => {
    const items: Array<{ to: string; label: string; icon: string }> = [
      { to: "/me", label: "个人首页", icon: "home" },
      { to: "/me/organizations", label: "我的组织", icon: "users" },
      { to: "/me/settings/profile", label: "个人资料", icon: "settings" },
    ];
    if (
      routeCtx()
        .user.role.split(",")
        .some((role) => role.trim() === "platform-admin")
    ) {
      items.push({ to: "/admin/users", label: "平台管理", icon: "shield" });
    }
    return items;
  };

  return (
    <div class="flex min-h-screen">
      <aside class="border-border bg-card flex w-64 shrink-0 flex-col border-r">
        <div class="border-border flex h-14 items-center border-b px-4">
          <Link to="/" class="text-lg font-bold">
            ORG SAAS
          </Link>
        </div>

        <div class="p-3">
          <OrgSwitcher userId={routeCtx().user.id} />
        </div>

        <Separator />

        <nav class="flex-1 space-y-1 p-3">
          <For each={navItems()}>
            {(item) => (
              <Link
                to={item.to as any}
                class="text-muted-foreground hover:bg-accent hover:text-accent-foreground flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors"
                activeProps={{
                  class: "bg-accent text-accent-foreground font-medium",
                }}
                activeOptions={{ exact: true }}
              >
                <NavIcon name={item.icon} class="size-4" />
                {item.label}
              </Link>
            )}
          </For>
        </nav>

        <Separator />

        <div class="p-3">
          <Button
            variant="ghost"
            class="w-full justify-start gap-2"
            onClick={() => {
              void authClient.signOut({
                fetchOptions: {
                  onSuccess: () => {
                    queryClient.clear();
                    void navigate({ to: "/" });
                  },
                  onError: (error) => {
                    toast.add({ title: error.error.message ?? "退出失败", type: "error" });
                  },
                },
              });
            }}
          >
            <UserAvatar name={routeCtx().user.name} image={routeCtx().user.image} size="sm" />
            <span class="truncate text-sm">{routeCtx().user.name}</span>
            <LogoutIcon class="ml-auto size-4" />
          </Button>
        </div>
      </aside>

      <main class="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}

function NavIcon(props: { name: string; class?: string }) {
  return (
    <Show
      when={props.name === "home"}
      fallback={
        <Show
          when={props.name === "users"}
          fallback={
            <Show when={props.name === "settings"} fallback={<ShieldIcon class={props.class} />}>
              <SettingsIcon class={props.class} />
            </Show>
          }
        >
          <UsersIcon class={props.class} />
        </Show>
      }
    >
      <HomeIcon class={props.class} />
    </Show>
  );
}

function HomeIcon(props: { class?: string }) {
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
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function UsersIcon(props: { class?: string }) {
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
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function SettingsIcon(props: { class?: string }) {
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
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function ShieldIcon(props: { class?: string }) {
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
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    </svg>
  );
}

function LogoutIcon(props: { class?: string }) {
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
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" x2="9" y1="12" y2="12" />
    </svg>
  );
}
