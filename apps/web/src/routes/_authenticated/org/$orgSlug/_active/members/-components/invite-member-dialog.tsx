import { useQuery, useQueryClient } from "@tanstack/solid-query";
import { createSignal, For, Show } from "solid-js";
import { z } from "zod";

import { authClient } from "@/lib/auth-client";
import { useOrgContext } from "@/lib/org-context";
import { syncOrganizationCacheAfterChange } from "@/lib/organization-cache";
import { grantableRolesQueryOptions } from "@/lib/query-options";
import { Button } from "@/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/ui/field";
import { Input } from "@/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";
import { toast } from "@/ui/toast";

const schema = z.object({
  email: z.email("请输入有效的邮箱地址"),
  role: z.string().min(1, "请选择一个角色"),
});

export function InviteMemberDialog(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orgId: string;
}) {
  const orgCtx = useOrgContext();
  const queryClient = useQueryClient();
  const grantableRoles = useQuery(() =>
    grantableRolesQueryOptions(orgCtx.userId, props.orgId, "invitation.create"),
  );
  const [email, setEmail] = createSignal("");
  const [role, setRole] = createSignal("member");
  const [errors, setErrors] = createSignal<Array<{ message?: string }>>([]);
  const [submitting, setSubmitting] = createSignal(false);

  const reset = () => {
    setEmail("");
    setRole("member");
    setErrors([]);
  };

  const onSubmit = async (event: Event) => {
    event.preventDefault();
    event.stopPropagation();
    const parsed = schema.safeParse({ email: email(), role: role() });
    if (!parsed.success) {
      setErrors(parsed.error.issues.map((issue) => ({ message: issue.message })));
      return;
    }
    setErrors([]);
    setSubmitting(true);
    try {
      if (!grantableRoles.data?.some((item) => item.name === parsed.data.role)) {
        toast.add({ title: "你当前不能授予此角色", type: "error" });
        return;
      }
      const result = await authClient.organization.inviteMember({
        email: parsed.data.email,
        role: parsed.data.role,
        organizationId: props.orgId,
      });
      if (result.error) throw new Error(result.error.message ?? "邀请失败");
      toast.add({ title: `已向 ${parsed.data.email} 发送邀请`, type: "success" });
      props.onOpenChange(false);
      reset();
      await syncOrganizationCacheAfterChange(
        queryClient,
        orgCtx.userId,
        props.orgId,
        "invitation-created",
      );
    } catch (error) {
      toast.add({
        title: error instanceof Error ? error.message : "邀请失败，请重试",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>邀请成员</DialogTitle>
          <DialogDescription>通过邮箱地址邀请新成员加入组织</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <FieldGroup class="gap-4">
            <Field data-invalid={errors().length > 0 || undefined}>
              <FieldLabel for="invite-email">邮箱</FieldLabel>
              <Input
                id="invite-email"
                type="email"
                placeholder="user@example.com"
                value={email()}
                onValueChange={(value) => {
                  setEmail(value);
                }}
              />
              <Show when={errors().length > 0}>
                <FieldError errors={errors()} />
              </Show>
            </Field>

            <Field data-disabled={grantableRoles.isPending || grantableRoles.isError || undefined}>
              <FieldLabel>角色</FieldLabel>
              <Show
                when={!grantableRoles.isPending}
                fallback={<FieldDescription>正在读取可授予角色…</FieldDescription>}
              >
                <Show
                  when={!grantableRoles.isError}
                  fallback={
                    <FieldDescription class="text-destructive">
                      无法读取可授予角色，请关闭后重试。
                    </FieldDescription>
                  }
                >
                  <Select value={role()} onValueChange={(value) => setRole(value ?? "")}>
                    <SelectTrigger aria-label="选择角色">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <For each={grantableRoles.data ?? []}>
                          {(item) => (
                            <SelectItem value={item.name}>
                              {item.name}
                              {item.custom ? "（自定义）" : ""}
                            </SelectItem>
                          )}
                        </For>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Show>
              </Show>
            </Field>

            <div class="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => props.onOpenChange(false)}>
                取消
              </Button>
              <Button
                type="submit"
                disabled={submitting() || grantableRoles.isPending || grantableRoles.isError}
              >
                {submitting() ? "发送中…" : "发送邀请"}
              </Button>
            </div>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
