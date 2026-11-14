import { useQueryClient } from "@tanstack/solid-query";
import { createFileRoute, useNavigate } from "@tanstack/solid-router";
import { createSignal, Show } from "solid-js";
import { z } from "zod";

import { authClient } from "@/lib/auth-client";
import { syncOrganizationListCacheAfterChange } from "@/lib/organization-cache";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { toast } from "@/ui/toast";

const schema = z.object({
  name: z.string().min(2, "组织名称至少 2 个字符"),
  slug: z
    .string()
    .min(2, "Slug 至少 2 个字符")
    .regex(/^[a-z0-9-]+$/, "Slug 只能包含小写字母、数字和连字符"),
});

export const Route = createFileRoute("/_authenticated/me/organizations/new")({
  component: NewOrgPage,
});

function NewOrgPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const routeCtx = Route.useRouteContext();
  const [name, setName] = createSignal("");
  const [slug, setSlug] = createSignal("");
  const [errors, setErrors] = createSignal<Record<string, string>>({});
  const [submitting, setSubmitting] = createSignal(false);

  const onSubmit = async (event: Event) => {
    event.preventDefault();
    event.stopPropagation();
    const parsed = schema.safeParse({ name: name(), slug: slug() });
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "");
        if (key && !next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      const result = await authClient.organization.create({
        name: parsed.data.name,
        slug: parsed.data.slug,
      });

      if (result.error) {
        toast.add({ title: result.error.message ?? "创建失败", type: "error" });
        return;
      }

      toast.add({ title: "组织创建成功", type: "success" });
      await syncOrganizationListCacheAfterChange(queryClient, routeCtx().user.id);
      void navigate({ to: `/org/${parsed.data.slug}` as string });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div class="mx-auto max-w-lg p-6">
      <h1 class="mb-6 text-2xl font-bold">创建新组织</h1>

      <Card>
        <CardHeader>
          <CardTitle>组织信息</CardTitle>
          <CardDescription>创建一个新的组织来管理你的团队</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} class="space-y-4">
            <div class="space-y-2">
              <Label for="name">组织名称</Label>
              <Input
                id="name"
                value={name()}
                placeholder="我的组织"
                onValueChange={(value) => {
                  setName(value);
                  const nextSlug = value
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/^-|-$/g, "");
                  setSlug(nextSlug);
                }}
              />
              <Show when={errors().name}>
                {(msg) => <p class="text-destructive text-sm">{msg()}</p>}
              </Show>
            </div>

            <div class="space-y-2">
              <Label for="slug">Slug</Label>
              <Input
                id="slug"
                value={slug()}
                placeholder="my-org"
                onValueChange={(value) => {
                  setSlug(value);
                }}
              />
              <p class="text-muted-foreground text-xs">用于 URL: /org/{slug() || "slug"}</p>
              <Show when={errors().slug}>
                {(msg) => <p class="text-destructive text-sm">{msg()}</p>}
              </Show>
            </div>

            <div class="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => navigate({ to: "/me" })}>
                取消
              </Button>
              <Button type="submit" disabled={submitting()}>
                {submitting() ? "创建中..." : "创建组织"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
