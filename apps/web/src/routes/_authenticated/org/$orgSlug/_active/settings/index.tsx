import { useMutation, useQueryClient } from "@tanstack/solid-query";
import { createFileRoute, useNavigate, useRouter } from "@tanstack/solid-router";
import { createSignal, Show } from "solid-js";
import { z } from "zod";

import { usePermission } from "@/hooks/use-permission";
import { authClient } from "@/lib/auth-client";
import { useOrgContext } from "@/lib/org-context";
import { syncOrganizationCacheAfterChange } from "@/lib/organization-cache";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/ui/alert-dialog";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/ui/field";
import { Input } from "@/ui/input";
import { toast } from "@/ui/toast";
import { ForbiddenError } from "@/utils/errors";
import { client } from "@/utils/orpc";

const schema = z.object({
  name: z.string().min(2, "组织名称至少 2 个字符"),
  slug: z
    .string()
    .min(2, "Slug 至少 2 个字符")
    .regex(/^[a-z0-9-]+$/, "Slug 只能包含小写字母、数字和连字符"),
});

export const Route = createFileRoute("/_authenticated/org/$orgSlug/_active/settings/")({
  beforeLoad: ({ context }) => {
    if (!context.access.operations.organization.update && !context.access.isOwner) {
      throw new ForbiddenError("您没有组织设置或生命周期操作权限");
    }
  },
  component: SettingsPage,
});

function SettingsPage() {
  const orgCtx = useOrgContext();
  const navigate = useNavigate();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [archiveOpen, setArchiveOpen] = createSignal(false);
  const canUpdate = usePermission({ organization: ["update"] });
  const canArchive = usePermission({ organization: ["archive"] });
  const [name, setName] = createSignal(orgCtx.org.name);
  const [slug, setSlug] = createSignal(orgCtx.org.slug);
  const [errors, setErrors] = createSignal<Record<string, Array<{ message?: string }>>>({});
  const [submitting, setSubmitting] = createSignal(false);

  const onSubmit = async (event: Event) => {
    event.preventDefault();
    event.stopPropagation();
    const parsed = schema.safeParse({ name: name(), slug: slug() });
    if (!parsed.success) {
      const next: Record<string, Array<{ message?: string }>> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "");
        if (!key) continue;
        next[key] = [...(next[key] ?? []), { message: issue.message }];
      }
      setErrors(next);
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      const result = await authClient.organization.update({
        data: { name: parsed.data.name, slug: parsed.data.slug },
        organizationId: orgCtx.org.id,
      });
      if (result.error) {
        toast.add({ title: result.error.message ?? "更新失败", type: "error" });
        return;
      }
      toast.add({ title: "组织设置已更新", type: "success" });
      await syncOrganizationCacheAfterChange(
        queryClient,
        orgCtx.userId,
        orgCtx.org.id,
        "organization-settings-changed",
      );
      await router.invalidate();
      if (parsed.data.slug !== orgCtx.org.slug) {
        await navigate({
          to: "/org/$orgSlug/settings",
          params: { orgSlug: parsed.data.slug },
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const archiveMutation = useMutation(() => ({
    mutationFn: () => client.organization.archive({ organizationId: orgCtx.org.id }),
    onSuccess: async () => {
      toast.add({ title: "组织已归档", type: "success" });
      setArchiveOpen(false);
      await syncOrganizationCacheAfterChange(
        queryClient,
        orgCtx.userId,
        orgCtx.org.id,
        "organization-archived",
      );
      await router.invalidate();
      await navigate({ to: "/org/$orgSlug/archived", params: { orgSlug: orgCtx.org.slug } });
    },
    onError: (error) => toast.add({ title: error.message || "归档失败，请重试", type: "error" }),
  }));

  return (
    <div class="mx-auto flex max-w-2xl flex-col gap-6 p-6">
      <div>
        <h1 class="text-2xl font-bold">组织设置</h1>
        <p class="text-muted-foreground text-sm">仅展示当前账号有权执行的组织操作。</p>
      </div>

      <Show when={canUpdate}>
        <Card>
          <CardHeader>
            <CardTitle>基本信息</CardTitle>
            <CardDescription>更新组织名称和地址</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit}>
              <FieldGroup class="gap-4">
                <Field data-invalid={(errors().name?.length ?? 0) > 0 || undefined}>
                  <FieldLabel for="org-name">组织名称</FieldLabel>
                  <Input
                    id="org-name"
                    value={name()}
                    onValueChange={(value) => {
                      setName(value);
                    }}
                  />
                  <Show when={(errors().name?.length ?? 0) > 0}>
                    <FieldError errors={errors().name} />
                  </Show>
                </Field>

                <Field data-invalid={(errors().slug?.length ?? 0) > 0 || undefined}>
                  <FieldLabel for="org-slug">组织地址</FieldLabel>
                  <Input
                    id="org-slug"
                    value={slug()}
                    onValueChange={(value) => {
                      setSlug(value);
                    }}
                  />
                  <Show when={(errors().slug?.length ?? 0) > 0}>
                    <FieldError errors={errors().slug} />
                  </Show>
                </Field>

                <Button type="submit" disabled={submitting()}>
                  {submitting() ? "保存中…" : "保存设置"}
                </Button>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </Show>

      <Show when={orgCtx.isOwner && canArchive}>
        <Card>
          <CardHeader>
            <CardTitle>归档组织</CardTitle>
            <CardDescription>
              归档会保留组织和历史数据，并暂停普通组织操作。组织所有者可以之后恢复。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialog open={archiveOpen()} onOpenChange={setArchiveOpen}>
              <AlertDialogTrigger
                render={(p) => (
                  <Button {...p} variant="destructive" disabled={archiveMutation.isPending} />
                )}
              >
                归档组织
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>归档“{orgCtx.org.name}”？</AlertDialogTitle>
                  <AlertDialogDescription>
                    组织成员将暂时无法访问正常业务页面。组织数据会保留，你可以从归档页面恢复。
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={archiveMutation.isPending}>取消</AlertDialogCancel>
                  <AlertDialogAction
                    variant="destructive"
                    disabled={archiveMutation.isPending}
                    onClick={() => void archiveMutation.mutate()}
                  >
                    {archiveMutation.isPending ? "归档中…" : "确认归档"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </Show>
    </div>
  );
}
