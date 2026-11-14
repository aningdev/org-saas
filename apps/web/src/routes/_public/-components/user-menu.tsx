import { useQuery, useQueryClient } from "@tanstack/solid-query";
import { Link, useNavigate } from "@tanstack/solid-router";
import { Loading, Show } from "solid-js";

import { getSession } from "@/functions/auth.fn";
import { authClient } from "@/lib/auth-client";
import { Button, buttonVariants } from "@/ui/button";
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
import { toast } from "@/ui/toast";

export function UserMenu() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const sessionQuery = useQuery(() => ({
    queryKey: ["session"],
    queryFn: () => getSession(),
  }));

  return (
    <Loading fallback={<Skeleton class="h-9 w-24" />}>
      <Show
        when={sessionQuery.data?.user}
        fallback={
          <Link to="/login" search={{ redirect: undefined }}>
            <Button variant="outline">Sign In</Button>
          </Link>
        }
      >
        {(user) => (
          <DropdownMenu>
            <DropdownMenuTrigger class={buttonVariants({ variant: "outline" })}>
              {user().name}
            </DropdownMenuTrigger>
            <DropdownMenuContent class="bg-card">
              <DropdownMenuGroup>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>{user().email}</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => void navigate({ to: "/me" })}>
                  个人中心
                </DropdownMenuItem>
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
                          toast.add({ title: error.error.message ?? "退出失败", type: "error" });
                        },
                      },
                    });
                  }}
                >
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </Show>
    </Loading>
  );
}
