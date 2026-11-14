import { useMutation, useQuery, useQueryClient } from "@tanstack/solid-query";
import { createFileRoute, redirect, useNavigate, useRouter } from "@tanstack/solid-router";

import { useOrgContext } from "@/lib/org-context";
import { syncOrganizationCacheAfterChange } from "@/lib/organization-cache";
import { organizationQueryKeys } from "@/lib/organization-query-keys";
import { Alert } from "@/ui/alert";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { toast } from "@/ui/toast";
import { ForbiddenError } from "@/utils/errors";
import { client } from "@/utils/orpc";

export const Route = createFileRoute("/_authenticated/org/$orgSlug/archived")({
  beforeLoad: ({ context, params }) => {
    if (!context.access.isOwner) {
      throw new ForbiddenError("只有组织所有者可以查看归档状态");
    }
    if (context.access.status === "active") {
      throw redirect({ to: "/org/$orgSlug", params });
    }
  },
  loader: async ({ context }) => {
    const queryKey = organizationQueryKeys.archivedStatus(context.user.id, context.org.id);
    await context.queryClient.ensureQueryData({
      queryKey,
      queryFn: () => client.organization.archivedStatus({ organizationId: context.org.id }),
    });
  },
  component: ArchivedOrganizationPage,
});

function ArchivedOrganizationPage() {
  const orgCtx = useOrgContext();
  const navigate = useNavigate();
  const router = useRouter();
  const queryClient = useQueryClient();
  const statusQuery = useQuery(() => ({
    queryKey: organizationQueryKeys.archivedStatus(orgCtx.userId, orgCtx.org.id),
    queryFn: () => client.organization.archivedStatus({ organizationId: orgCtx.org.id }),
  }));

  const restoreMutation = useMutation(() => ({
    mutationFn: () => client.organization.restore({ organizationId: orgCtx.org.id }),
    onSuccess: async () => {
      toast.add({ title: "组织已恢复", type: "success" });
      await syncOrganizationCacheAfterChange(
        queryClient,
        orgCtx.userId,
        orgCtx.org.id,
        "organization-restored",
      );
      await router.invalidate();
      await navigate({ to: "/org/$orgSlug", params: { orgSlug: statusQuery.data.slug } });
    },
    onError: (error) => {
      toast.add({ title: error.message || "恢复失败，请重试", type: "error" });
    },
  }));

  return (
    <main class="mx-auto flex min-h-screen max-w-2xl items-center p-6">
      <Card class="w-full">
        <CardHeader>
          <CardTitle>组织已归档</CardTitle>
          <CardDescription>{statusQuery.data.name} 已停止普通组织操作。</CardDescription>
        </CardHeader>
        <CardContent class="flex flex-col gap-4">
          <Alert>
            <p>归档期间组织数据会保留，成员、团队和管理页面暂不可访问。</p>
            <p class="text-muted-foreground text-sm">
              归档时间：{new Date(statusQuery.data.archivedAt ?? "").toLocaleString()}
            </p>
          </Alert>
          <div class="flex flex-wrap gap-3">
            <Button
              disabled={restoreMutation.isPending}
              onClick={() => void restoreMutation.mutate()}
            >
              {restoreMutation.isPending ? "恢复中..." : "恢复组织"}
            </Button>
            <Button variant="outline" render={(p) => <a {...p} href="/me/organizations" />}>
              返回我的组织
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
