import { useQueryClient } from "@tanstack/solid-query";
import { createSignal, Show } from "solid-js";
import { z } from "zod";

import { authClient } from "@/lib/auth-client";
import { useOrgContext } from "@/lib/org-context";
import { syncOrganizationCacheAfterChange } from "@/lib/organization-cache";
import { Button } from "@/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/ui/field";
import { Input } from "@/ui/input";
import { toast } from "@/ui/toast";

const schema = z.object({ name: z.string().min(2, "团队名称至少 2 个字符") });

export function CreateTeamDialog(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orgId: string;
}) {
  const orgCtx = useOrgContext();
  const queryClient = useQueryClient();
  const [name, setName] = createSignal("");
  const [errors, setErrors] = createSignal<Array<{ message?: string }>>([]);
  const [submitting, setSubmitting] = createSignal(false);

  const onSubmit = async (event: Event) => {
    event.preventDefault();
    event.stopPropagation();
    const parsed = schema.safeParse({ name: name() });
    if (!parsed.success) {
      setErrors(parsed.error.issues.map((issue) => ({ message: issue.message })));
      return;
    }
    setErrors([]);
    setSubmitting(true);
    try {
      const result = await authClient.organization.createTeam({
        name: parsed.data.name,
        organizationId: props.orgId,
      });
      if (result.error) {
        toast.add({ title: result.error.message ?? "创建失败", type: "error" });
        return;
      }
      toast.add({ title: "团队创建成功", type: "success" });
      props.onOpenChange(false);
      setName("");
      await syncOrganizationCacheAfterChange(
        queryClient,
        orgCtx.userId,
        props.orgId,
        "team-created",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>创建团队</DialogTitle>
          <DialogDescription>在组织内创建一个新团队</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <FieldGroup class="gap-4">
            <Field data-invalid={errors().length > 0 || undefined}>
              <FieldLabel for="team-name">团队名称</FieldLabel>
              <Input
                id="team-name"
                placeholder="如：前端团队"
                value={name()}
                onValueChange={(value) => {
                  setName(value);
                }}
              />
              <Show when={errors().length > 0}>
                <FieldError errors={errors()} />
              </Show>
            </Field>
            <div class="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => props.onOpenChange(false)}>
                取消
              </Button>
              <Button type="submit" disabled={submitting()}>
                {submitting() ? "创建中…" : "创建团队"}
              </Button>
            </div>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
