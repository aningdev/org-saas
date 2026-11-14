import { useRouter } from "@tanstack/solid-router";
import { createSignal, onSettled, Show } from "solid-js";

import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/ui/card";

export function OfflinePage() {
  const router = useRouter();
  const [isOnline, setIsOnline] = createSignal(
    typeof navigator !== "undefined" ? navigator.onLine : true,
  );

  onSettled(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // 网络恢复后自动刷新页面
      setTimeout(() => {
        void router.invalidate();
      }, 1000);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  });

  const handleRefresh = () => {
    void router.invalidate();
  };

  return (
    <div class="flex min-h-[50vh] items-center justify-center p-4">
      <Card class="w-full max-w-md">
        <CardHeader>
          <div class="flex items-center gap-2">
            <Show
              when={isOnline()}
              fallback={
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
                  <path d="M12 20h.01" />
                  <path d="M8.5 16.429a5 5 0 0 1 7 0" />
                  <path d="M5 12.859a10 10 0 0 1 5.17-2.69" />
                  <path d="M19 12.859a10 10 0 0 0-2.007-1.523" />
                  <path d="M2 8.82a15 15 0 0 1 4.177-2.318" />
                  <path d="M22 8.82a15 15 0 0 0-11.288-3.764" />
                  <path d="m2 2 20 20" />
                </svg>
              }
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
                class="h-6 w-6 text-green-600 dark:text-green-400"
              >
                <path d="M12 20h.01" />
                <path d="M8.5 16.429a5 5 0 0 1 7 0" />
                <path d="M5 12.859a10 10 0 0 1 14 0" />
                <path d="M2 8.82a15 15 0 0 1 20 0" />
              </svg>
            </Show>
            <CardTitle>{isOnline() ? "网络已恢复" : "网络连接断开"}</CardTitle>
          </div>
          <CardDescription>
            {isOnline() ? "正在重新加载..." : "请检查您的网络连接后重试"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Show
            when={isOnline()}
            fallback={
              <div class="bg-muted rounded-md p-3">
                <p class="text-muted-foreground text-sm">
                  您似乎已断开网络连接。请检查您的网络设置或稍后再试。
                </p>
              </div>
            }
          >
            <div class="flex items-center justify-center py-4">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
                class="h-6 w-6 animate-spin text-green-600 dark:text-green-400"
              >
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              <span class="text-muted-foreground ml-2">正在恢复连接...</span>
            </div>
          </Show>
        </CardContent>
        <Show when={!isOnline()}>
          <CardFooter>
            <Button onClick={handleRefresh} class="w-full">
              重新连接
            </Button>
          </CardFooter>
        </Show>
      </Card>
    </div>
  );
}
