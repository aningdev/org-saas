import { useRouter } from "@tanstack/solid-router";
import { Show } from "solid-js";

import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/ui/card";
import type { ForbiddenError } from "@/utils/errors";

interface ForbiddenPageProps {
  error: ForbiddenError;
}

export function ForbiddenPage(props: ForbiddenPageProps) {
  const router = useRouter();

  const handleGoHome = () => {
    void router.navigate({ to: "/" });
  };

  const handleGoBack = () => {
    router.history.back();
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
            <CardTitle>访问被拒绝</CardTitle>
          </div>
          <CardDescription>您没有权限访问此资源</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="bg-muted rounded-md p-3">
            <p class="text-muted-foreground text-sm">{props.error.message}</p>
          </div>

          <Show when={props.error.details}>
            {(details) => (
              <div class="border-border rounded-md border p-3">
                <p class="text-muted-foreground text-sm">
                  <span class="font-semibold">所需权限：</span>
                  <Show when={details().requiredRole}>{(role) => <span>角色: {role()}</span>}</Show>
                  <Show when={details().requiredPermission}>
                    {(permission) => (
                      <span>
                        {permission().resource}: {permission().actions.join(", ")}
                      </span>
                    )}
                  </Show>
                </p>
              </div>
            )}
          </Show>

          <div class="rounded-md bg-blue-50 p-3 dark:bg-blue-950">
            <div class="flex items-start gap-2">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
                class="mt-0.5 h-4 w-4 text-blue-600 dark:text-blue-400"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" x2="12" y1="8" y2="12" />
                <line x1="12" x2="12.01" y1="16" y2="16" />
              </svg>
              <div class="text-sm">
                <p class="font-medium text-blue-900 dark:text-blue-100">需要帮助？</p>
                <p class="mt-1 text-blue-700 dark:text-blue-300">
                  如果您认为这是一个错误，请联系组织管理员或系统管理员。
                </p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter class="flex gap-2">
          <Button variant="outline" onClick={handleGoBack} class="flex-1">
            返回上一页
          </Button>
          <Button onClick={handleGoHome} class="flex-1">
            返回首页
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
