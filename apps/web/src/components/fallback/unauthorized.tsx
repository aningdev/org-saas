import { useRouter } from "@tanstack/solid-router";

import { Button } from "@/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/ui/card";
import type { UnauthorizedError } from "@/utils/errors";

interface UnauthorizedPageProps {
  error: UnauthorizedError;
}

export function UnauthorizedPage(props: UnauthorizedPageProps) {
  const router = useRouter();

  const handleLogin = () => {
    const target = new URL(props.error.redirectTo, window.location.origin);
    target.searchParams.set("redirect", window.location.href);
    router.history.push(target.pathname + target.search);
  };

  return (
    <div class="flex min-h-[50vh] items-center justify-center p-4">
      <Card class="w-full max-w-md">
        <CardHeader>
          <div class="flex items-center gap-2">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
              class="text-destructive h-6 w-6"
            >
              <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
            </svg>
            <CardTitle>需要登录</CardTitle>
          </div>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="bg-muted rounded-md p-3">
            <p class="text-muted-foreground text-sm">{props.error.message}</p>
          </div>

          <div class="rounded-md bg-blue-50 p-3 dark:bg-blue-950">
            <p class="text-sm text-blue-900 dark:text-blue-100">
              请登录以继续访问此页面。登录后您将返回到您原本想访问的页面。
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleLogin} class="w-full">
            前往登录
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
