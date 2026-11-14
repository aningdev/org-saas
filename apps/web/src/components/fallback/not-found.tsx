import { useRouter } from "@tanstack/solid-router";

import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/ui/card";

export function NotFoundPage() {
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
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
              <path d="m8 8 6 6" />
            </svg>
            <CardTitle>页面不存在</CardTitle>
          </div>
          <CardDescription>您访问的页面不存在或已被删除</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
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
                  请检查您输入的 URL 是否正确，或联系系统管理员。
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
