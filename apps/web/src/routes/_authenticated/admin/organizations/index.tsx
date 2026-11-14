import { useQuery } from "@tanstack/solid-query";
import { createFileRoute } from "@tanstack/solid-router";
import { createSignal, For, Show } from "solid-js";

import { platformOrganizationsQueryOptions } from "@/lib/query-options";
import { Alert, AlertDescription, AlertTitle } from "@/ui/alert";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/ui/field";
import { Input } from "@/ui/input";
import { Skeleton } from "@/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";

const PAGE_SIZE = 25;

export const Route = createFileRoute("/_authenticated/admin/organizations/")({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(
      platformOrganizationsQueryOptions(context.user.id, { limit: PAGE_SIZE, offset: 0 }),
    );
  },
  component: PlatformOrganizationsPage,
});

function PlatformOrganizationsPage() {
  const routeCtx = Route.useRouteContext();
  const [search, setSearch] = createSignal("");
  const [page, setPage] = createSignal(0);
  const query = useQuery(() =>
    platformOrganizationsQueryOptions(routeCtx().user.id, {
      search: search().trim() || undefined,
      limit: PAGE_SIZE,
      offset: page() * PAGE_SIZE,
    }),
  );
  const data = () => query.data;
  const pageCount = () => Math.max(1, Math.ceil((data()?.total ?? 0) / PAGE_SIZE));

  return (
    <div class="flex flex-col gap-6 p-6">
      <div>
        <h1 class="text-2xl font-bold">平台组织</h1>
        <p class="text-muted-foreground text-sm">
          查看组织基础信息与归档状态；此页面不进入租户业务数据。
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>组织目录</CardTitle>
          <CardDescription>仅返回组织基础信息、创建时间和归档标记。</CardDescription>
        </CardHeader>
        <CardContent class="flex flex-col gap-4">
          <FieldGroup class="gap-2">
            <Field>
              <FieldLabel for="organization-search">按名称或地址搜索</FieldLabel>
              <Input
                id="organization-search"
                value={search()}
                onValueChange={(value) => {
                  setSearch(value);
                  setPage(0);
                }}
                placeholder="输入组织名称或 slug"
              />
            </Field>
          </FieldGroup>

          <Show when={query.isError}>
            <Alert variant="destructive">
              <AlertTitle>无法读取组织</AlertTitle>
              <AlertDescription>{query.error?.message}</AlertDescription>
            </Alert>
          </Show>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>组织</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>创建时间</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <Show
                when={!query.isPending}
                fallback={
                  <For each={[0, 1, 2, 3]}>
                    {() => (
                      <TableRow>
                        <TableCell colspan={3}>
                          <Skeleton class="h-5 w-full" />
                        </TableCell>
                      </TableRow>
                    )}
                  </For>
                }
              >
                <Show
                  when={(data()?.items.length ?? 0) > 0}
                  fallback={
                    <TableRow>
                      <TableCell colspan={3} class="text-muted-foreground py-10 text-center">
                        没有匹配的组织
                      </TableCell>
                    </TableRow>
                  }
                >
                  <For each={data()?.items ?? []}>
                    {(item) => (
                      <TableRow>
                        <TableCell>
                          <div class="font-medium">{item.name}</div>
                          <div class="text-muted-foreground text-sm">{item.slug}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={item.archived ? "outline" : "secondary"}>
                            {item.archived ? "已归档" : "正常"}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(item.createdAt).toLocaleDateString()}</TableCell>
                      </TableRow>
                    )}
                  </For>
                </Show>
              </Show>
            </TableBody>
          </Table>

          <div class="flex items-center justify-between">
            <p class="text-muted-foreground text-sm">
              共 {data()?.total ?? 0} 个组织 · 第 {page() + 1} / {pageCount()} 页
            </p>
            <div class="flex gap-2">
              <Button
                variant="outline"
                disabled={page() === 0 || query.isFetching}
                onClick={() => setPage((current) => Math.max(0, current - 1))}
              >
                上一页
              </Button>
              <Button
                variant="outline"
                disabled={page() + 1 >= pageCount() || query.isFetching}
                onClick={() => setPage((current) => current + 1)}
              >
                下一页
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
