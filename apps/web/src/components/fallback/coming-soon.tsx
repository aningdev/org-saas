import { useRouter } from "@tanstack/solid-router";
import { Show } from "solid-js";

import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/ui/card";

interface ComingSoonPageProps {
  /**
   * 预计上线时间
   */
  estimatedDate?: string;
  /**
   * 功能描述
   */
  description?: string;
}

export function ComingSoonPage(props: ComingSoonPageProps) {
  const router = useRouter();
  const description = () => props.description ?? "此功能正在开发中，敬请期待";

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
              class="h-6 w-6 text-blue-600 dark:text-blue-400"
            >
              <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
              <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
              <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
              <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
            </svg>
            <CardTitle>即将上线</CardTitle>
          </div>
          <CardDescription>{description()}</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="bg-muted rounded-md p-3">
            <p class="text-muted-foreground text-sm">
              我们正在努力开发这个功能，预计很快就会与您见面。
              <Show when={props.estimatedDate}>
                {(date) => (
                  <span>
                    预计上线时间：
                    <span class="font-semibold">{date()}</span>
                  </span>
                )}
              </Show>
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleGoHome} class="w-full">
            返回首页
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
