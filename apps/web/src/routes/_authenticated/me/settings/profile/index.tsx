import { createFileRoute } from "@tanstack/solid-router";
import { createSignal, Show } from "solid-js";
import { z } from "zod";

import { UserAvatar } from "@/components/user-avatar";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { toast } from "@/ui/toast";
import { orpc } from "@/utils/orpc";

const schema = z.object({
  name: z.string().min(2, "名称至少 2 个字符"),
  image: z.string().url("请输入有效的 URL").or(z.literal("")),
});

export const Route = createFileRoute("/_authenticated/me/settings/profile/")({
  component: ProfilePage,
});

function ProfilePage() {
  const routeCtx = Route.useRouteContext();
  const [name, setName] = createSignal(routeCtx().user.name);
  const [image, setImage] = createSignal(routeCtx().user.image ?? "");
  const [errors, setErrors] = createSignal<Record<string, string>>({});
  const [submitting, setSubmitting] = createSignal(false);

  const onSubmit = async (event: Event) => {
    event.preventDefault();
    event.stopPropagation();
    const parsed = schema.safeParse({ name: name(), image: image() });
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
      await orpc.user.updateProfile.call({
        name: parsed.data.name || undefined,
        image: parsed.data.image || undefined,
      });
      toast.add({ title: "个人信息已更新", type: "success" });
    } catch {
      toast.add({ title: "更新失败", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div class="mx-auto max-w-2xl p-6">
      <h1 class="mb-6 text-2xl font-bold">个人资料</h1>

      <Card>
        <CardHeader>
          <CardTitle>个人信息</CardTitle>
          <CardDescription>更新你的个人资料</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="mb-6 flex items-center gap-4">
            <UserAvatar name={routeCtx().user.name} image={routeCtx().user.image} size="lg" />
            <div>
              <p class="font-medium">{routeCtx().user.name}</p>
              <p class="text-muted-foreground text-sm">{routeCtx().user.email}</p>
            </div>
          </div>

          <form onSubmit={onSubmit} class="space-y-4">
            <div class="space-y-2">
              <Label for="name">名称</Label>
              <Input
                id="name"
                value={name()}
                onValueChange={(value) => {
                  setName(value);
                }}
              />
              <Show when={errors().name}>
                {(msg) => <p class="text-destructive text-sm">{msg()}</p>}
              </Show>
            </div>

            <div class="space-y-2">
              <Label for="image">头像 URL</Label>
              <Input
                id="image"
                value={image()}
                placeholder="https://example.com/avatar.png"
                onValueChange={(value) => {
                  setImage(value);
                }}
              />
              <Show when={errors().image}>
                {(msg) => <p class="text-destructive text-sm">{msg()}</p>}
              </Show>
            </div>

            <Button type="submit" disabled={submitting()}>
              {submitting() ? "保存中..." : "保存"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
