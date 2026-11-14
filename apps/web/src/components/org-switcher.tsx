import { useQuery } from "@tanstack/solid-query";
import { useNavigate } from "@tanstack/solid-router";
import { For, Show } from "solid-js";

import { UserAvatar } from "@/components/user-avatar";
import { orgListQueryOptions } from "@/lib/query-options";
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
import { Skeleton } from "@/ui/skeleton";

export function OrgSwitcher(props: { activeOrgSlug?: string; userId: string }) {
  const navigate = useNavigate();
  const orgsQuery = useQuery(() => orgListQueryOptions(props.userId));
  const orgs = () => orgsQuery.data ?? [];
  const activeOrg = () => orgs().find((o: { slug: string }) => o.slug === props.activeOrgSlug);

  return (
    <Show when={!orgsQuery.isPending} fallback={<Skeleton class="h-10 w-full" />}>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={(triggerProps) => (
            <Button {...triggerProps} variant="outline" class="w-full justify-between" />
          )}
        >
          <div class="flex items-center gap-2 truncate text-sm">
            <Show
              when={activeOrg()}
              fallback={
                <>
                  <BuildingIcon class="size-4" />
                  <span class="text-muted-foreground">选择组织</span>
                </>
              }
            >
              {(org) => (
                <>
                  <UserAvatar name={org().name} image={org().logo} size="sm" />
                  <span class="truncate font-semibold">{org().name}</span>
                </>
              )}
            </Show>
          </div>
          <ChevronsIcon class="ml-auto size-4 shrink-0" />
        </DropdownMenuTrigger>
        <DropdownMenuContent class="bg-card w-56" align="start">
          <DropdownMenuGroup>
            <DropdownMenuLabel>组织</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <For each={orgs()}>
              {(org) => (
                <DropdownMenuItem
                  onSelect={() => {
                    void navigate({
                      to: "/org/$orgSlug",
                      params: { orgSlug: org.slug },
                    });
                  }}
                >
                  <UserAvatar name={org.name} image={org.logo} size="sm" />
                  <span class="truncate">{org.name}</span>
                </DropdownMenuItem>
              )}
            </For>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={() => {
              void navigate({ to: "/me/organizations/new" });
            }}
          >
            <PlusIcon class="size-4" />
            <span>创建新组织</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </Show>
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
      <path d="M10 6h4" />
      <path d="M10 10h4" />
      <path d="M10 14h4" />
      <path d="M10 18h4" />
    </svg>
  );
}

function ChevronsIcon(props: { class?: string }) {
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
      <path d="m7 15 5 5 5-5" />
      <path d="m7 9 5-5 5 5" />
    </svg>
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
