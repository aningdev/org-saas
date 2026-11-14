import { createEffect, createSignal, For, Show } from "solid-js";

import type { OrganizationAccess } from "@/lib/query-options";
import { Button } from "@/ui/button";
import { Checkbox } from "@/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/ui/dialog";
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/ui/field";
import { Input } from "@/ui/input";

export interface RoleDraft {
  id?: string;
  name: string;
  permission: Record<string, string[]>;
}

export function RoleEditorDialog(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialDraft: RoleDraft | null;
  catalog: Record<string, string[]>;
  access: OrganizationAccess;
  affectedMemberCount: number;
  isSaving: boolean;
  onSave: (draft: RoleDraft) => void;
}) {
  const [name, setName] = createSignal("");
  const [permission, setPermission] = createSignal<Record<string, string[]>>({});

  createEffect(
    () => [props.open, props.initialDraft] as const,
    ([open, draft]) => {
      if (open) {
        setName(draft?.name ?? "");
        setPermission(draft?.permission ?? {});
      }
    },
  );

  const operationMap = () =>
    props.access.operations as unknown as Record<string, Record<string, boolean>>;
  const allowed = (resource: string, action: string) =>
    operationMap()[resource === "ac" ? "roleDefinition" : resource]?.[action] === true;
  const withinGrantBoundary = () =>
    Object.entries(permission()).every(([resource, actions]) =>
      actions.every((action) => allowed(resource, action)),
    );

  const togglePermission = (resource: string, action: string, checked: boolean) => {
    setPermission((current) => {
      const actions = new Set(current[resource] ?? []);
      if (checked) actions.add(action);
      else actions.delete(action);
      const next = { ...current };
      if (actions.size > 0) next[resource] = [...actions];
      else delete next[resource];
      return next;
    });
  };

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent class="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{props.initialDraft?.id ? "编辑自定义角色" : "创建自定义角色"}</DialogTitle>
          <DialogDescription>
            权限选项来自服务端声明的资源和操作。保存会影响 {props.affectedMemberCount} 个成员。
          </DialogDescription>
        </DialogHeader>
        <FieldGroup class="gap-4">
          <Field>
            <FieldLabel for="role-name">角色名称</FieldLabel>
            <Input
              id="role-name"
              value={name()}
              onValueChange={(value) => {
                setName(value);
              }}
              placeholder="例如：项目协调员"
              disabled={props.isSaving}
            />
          </Field>
          <For each={Object.entries(props.catalog)}>
            {([resource, actions]) => (
              <FieldSet>
                <FieldLegend variant="label">{resource}</FieldLegend>
                <FieldDescription>只勾选当前操作者有权授予的操作。</FieldDescription>
                <FieldGroup class="gap-2">
                  <For each={actions}>
                    {(action) => {
                      const checked = () => permission()[resource]?.includes(action) ?? false;
                      const canGrant = () => allowed(resource, action);
                      const id = `role-${resource}-${action}`;
                      return (
                        <Field
                          orientation="horizontal"
                          data-disabled={(!canGrant() && !checked()) || undefined}
                        >
                          <Checkbox
                            id={id}
                            checked={checked()}
                            disabled={props.isSaving || (!canGrant() && !checked())}
                            onCheckedChange={(value) =>
                              togglePermission(resource, action, value === true)
                            }
                          />
                          <FieldLabel for={id} class="font-normal">
                            {action}
                          </FieldLabel>
                        </Field>
                      );
                    }}
                  </For>
                </FieldGroup>
              </FieldSet>
            )}
          </For>
          <Show when={!withinGrantBoundary()}>
            <p class="text-destructive text-sm">
              此角色包含你当前不能授予的操作。请先取消这些权限。
            </p>
          </Show>
        </FieldGroup>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => props.onOpenChange(false)}>
            取消
          </Button>
          <Button
            type="button"
            disabled={!name().trim() || !withinGrantBoundary() || props.isSaving}
            onClick={() =>
              props.onSave({
                id: props.initialDraft?.id,
                name: name().trim(),
                permission: permission(),
              })
            }
          >
            {props.isSaving ? "保存中…" : "保存角色"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
