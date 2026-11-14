import { createFileRoute, Link, Outlet } from "@tanstack/solid-router";
import { For } from "solid-js";

import { Separator } from "@/ui/separator";
import { requirePlatformAdmin } from "@/utils/guards";

export const Route = createFileRoute("/_authenticated/admin")({
  ssr: "data-only",
  beforeLoad: ({ context }) => requirePlatformAdmin(context.user.role),
  component: PlatformAdminLayout,
});

function PlatformAdminLayout() {
  const links = [
    { to: "/admin/users" as const, label: "用户", icon: "users" },
    { to: "/admin/organizations" as const, label: "组织", icon: "building" },
    { to: "/admin/audit" as const, label: "审计", icon: "activity" },
  ];

  return (
    <div class="flex min-h-screen">
      <aside class="border-border bg-card flex w-64 shrink-0 flex-col border-r">
        <div class="border-border flex h-14 items-center border-b px-4">
          <Link to="/me" class="font-bold">
            平台管理
          </Link>
        </div>
        <nav class="flex-1 p-3">
          <div class="flex flex-col gap-1">
            <For each={links}>
              {(item) => (
                <Link
                  to={item.to}
                  class="text-muted-foreground hover:bg-accent hover:text-accent-foreground flex items-center gap-3 rounded-md px-3 py-2 text-sm"
                  activeProps={{ class: "bg-accent text-accent-foreground font-medium" }}
                >
                  <AdminNavIcon name={item.icon} class="size-4" />
                  {item.label}
                </Link>
              )}
            </For>
          </div>
        </nav>
        <Separator />
        <div class="p-3">
          <Link to="/me" class="text-muted-foreground hover:text-foreground text-sm">
            返回个人中心
          </Link>
        </div>
      </aside>
      <main class="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}

function AdminNavIcon(props: { name: string; class?: string }) {
  if (props.name === "building") {
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
  if (props.name === "activity") {
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
        <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2" />
      </svg>
    );
  }
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
