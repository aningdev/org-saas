import { useQueryClient } from "@tanstack/solid-query";
import { createFileRoute, Link, Outlet, redirect, useNavigate } from "@tanstack/solid-router";
import { For, Show } from "solid-js";

import { OrgSwitcher } from "@/components/org-switcher";
import { UserAvatar } from "@/components/user-avatar";
import { usePermission } from "@/hooks/use-permission";
import { authClient } from "@/lib/auth-client";
import { useOrgContext } from "@/lib/org-context";
import { Button } from "@/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/ui/dropdown-menu";
import { Separator } from "@/ui/separator";
import { toast } from "@/ui/toast";

export const Route = createFileRoute("/_authenticated/org/$orgSlug/_active")({
  ssr: "data-only",
  beforeLoad: ({ context, params, location }) => {
    const { access } = context;
    const canReadArchivedAudit =
      location.pathname.endsWith("/audit") && access.operations.audit.read;
    if (access.status === "archived" && !canReadArchivedAudit) {
      throw redirect({ to: "/org/$orgSlug/archived", params });
    }
  },
  component: ActiveOrganizationLayout,
});

function ActiveOrganizationLayout() {
  const orgCtx = useOrgContext();
  const routeCtx = Route.useRouteContext();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const canUpdateSettings = usePermission({ organization: ["update"] });
  const canArchive = usePermission({ organization: ["archive"] });
  const canReadRoles = usePermission({ ac: ["read"] });
  const canReadAudit = usePermission({ audit: ["read"] });

  const navItems = () => {
    const items = [
      { to: `/org/${orgCtx.org.slug}`, label: "概览", exact: true },
      { to: `/org/${orgCtx.org.slug}/members`, label: "成员", exact: false },
      { to: `/org/${orgCtx.org.slug}/teams`, label: "团队", exact: false },
    ];
    if (canReadRoles) {
      items.push({ to: `/org/${orgCtx.org.slug}/roles`, label: "角色", exact: false });
    }
    if (canReadAudit) {
      items.push({ to: `/org/${orgCtx.org.slug}/audit`, label: "审计", exact: false });
    }
    if (canUpdateSettings || canArchive) {
      items.push({ to: `/org/${orgCtx.org.slug}/settings`, label: "设置", exact: false });
    }
    return items;
  };

  return (
    <div class="flex min-h-screen">
      <aside class="border-border bg-card flex w-64 shrink-0 flex-col border-r">
        <div class="border-border flex h-14 items-center gap-2 border-b px-4">
          <Link to="/me" class="text-muted-foreground hover:text-foreground">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
              class="size-4"
            >
              <path d="m12 19-7-7 7-7" />
              <path d="M19 12H5" />
            </svg>
          </Link>
          <span class="truncate font-bold">{orgCtx.org.name}</span>
        </div>

        <div class="p-3">
          <OrgSwitcher activeOrgSlug={orgCtx.org.slug} userId={orgCtx.userId} />
        </div>

        <Separator />

        <nav class="flex-1 p-3">
          <div class="flex flex-col gap-1">
            <For each={navItems()}>
              {(item) => (
                <Link
                  to={item.to}
                  class="text-muted-foreground hover:bg-accent hover:text-accent-foreground flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors"
                  activeProps={{ class: "bg-accent text-accent-foreground font-medium" }}
                  activeOptions={{ exact: item.exact }}
                >
                  {item.label}
                </Link>
              )}
            </For>
          </div>
        </nav>

        <Separator />

        <div class="p-3">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={(p) => <Button {...p} variant="ghost" class="w-full justify-start gap-2" />}
            >
              <UserAvatar name={routeCtx().user.name} image={routeCtx().user.image} size="sm" />
              <span class="truncate text-sm">{routeCtx().user.name}</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent class="bg-card w-56" align="start">
              <DropdownMenuGroup>
                <DropdownMenuLabel>{routeCtx().user.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => navigate({ to: "/me" })}>
                  个人中心
                </DropdownMenuItem>
                <Show when={orgCtx.isOwner && canArchive}>
                  <DropdownMenuItem
                    onSelect={() =>
                      navigate({
                        to: "/org/$orgSlug/settings",
                        params: { orgSlug: orgCtx.org.slug },
                      })
                    }
                  >
                    组织设置
                  </DropdownMenuItem>
                </Show>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={() => {
                    void authClient.signOut({
                      fetchOptions: {
                        onSuccess: () => {
                          queryClient.clear();
                          void navigate({ to: "/" });
                        },
                        onError: (error) => {
                          toast.add({
                            title: error.error.message ?? "退出失败",
                            type: "error",
                          });
                        },
                      },
                    });
                  }}
                >
                  退出登录
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      <main class="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
