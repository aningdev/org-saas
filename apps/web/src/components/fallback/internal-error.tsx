import { useRouter } from "@tanstack/solid-router";
import { Show } from "solid-js";

import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/ui/card";

interface ErrorBoundaryProps {
  error: unknown;
  reset?: () => void;
}

export function ErrorBoundary(props: ErrorBoundaryProps) {
  const router = useRouter();
  const requestId = () => {
    const data =
      typeof props.error === "object" && props.error !== null && "data" in props.error
        ? props.error.data
        : undefined;
    return typeof data === "object" && data !== null && "requestId" in data
      ? data.requestId
      : undefined;
  };

  const handleReset = () => {
    props.reset?.();
    void router.invalidate();
  };

  const handleGoHome = () => {
    void router.navigate({ to: "/" });
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
              <circle cx="12" cy="12" r="10" />
              <line x1="12" x2="12" y1="8" y2="12" />
              <line x1="12" x2="12.01" y1="16" y2="16" />
            </svg>
            <CardTitle>出错了</CardTitle>
          </div>
          <CardDescription>应用遇到了一个意外错误。请尝试刷新页面或返回首页。</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="bg-muted rounded-md p-3">
            <p class="text-muted-foreground text-sm">暂时无法完成请求，请稍后重试</p>
            <Show
              when={
                typeof requestId() === "string" &&
                /^[a-zA-Z0-9_-]{8,128}$/.test(requestId() as string)
                  ? (requestId() as string)
                  : undefined
              }
            >
              {(id) => <p class="text-muted-foreground mt-2 text-xs">问题编号：{id()}</p>}
            </Show>
          </div>
        </CardContent>
        <CardFooter class="flex gap-2">
          <Button variant="outline" onClick={handleGoHome} class="flex-1">
            返回首页
          </Button>
          <Button onClick={handleReset} class="flex-1">
            刷新页面
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
