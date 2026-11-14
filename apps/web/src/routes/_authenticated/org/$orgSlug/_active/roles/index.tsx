import { roles as builtInRoles } from "@org-saas/auth/permissions";
import { useMutation, useQuery, useQueryClient } from "@tanstack/solid-query";
import { createFileRoute } from "@tanstack/solid-router";
import { createSignal, For, Show } from "solid-js";

import { authClient } from "@/lib/auth-client";
import { useOrgContext } from "@/lib/org-context";
import { syncOrganizationCacheAfterChange } from "@/lib/organization-cache";
import { organizationFullQueryOptions, organizationRolesQueryOptions } from "@/lib/query-options";
import { Alert, AlertDescription, AlertTitle } from "@/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/ui/alert-dialog";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";
import { toast } from "@/ui/toast";
import { ForbiddenError } from "@/utils/errors";

import { RoleEditorDialog, type RoleDraft } from "./-components/role-editor-dialog";

const permissionCatalog = builtInRoles.owner.statements as unknown as Record<string, string[]>;
const builtIns = Object.entries(builtInRoles).map(([name, role]) => ({
  name,
  permission: role.statements as unknown as Record<string, string[]>,
}));

export const Route = createFileRoute("/_authenticated/org/$orgSlug/_active/roles/")({
  beforeLoad: ({ context }) => {
    if (!context.access.operations.ac.read) {
      throw new ForbiddenError("您没有查看组织角色定义的权限");
    }
  },
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(
      organizationFullQueryOptions(context.user.id, context.org.id),
    );
  },
  component: OrganizationRolesPage,
});

function OrganizationRolesPage() {
  const orgCtx = useOrgContext();
  const queryClient = useQueryClient();
  const [draft, setDraft] = createSignal<RoleDraft | null>(null);
  const [deleteTarget, setDeleteTarget] = createSignal<{ id: string; name: string } | null>(null);
  const [roleFeedback, setRoleFeedback] = createSignal<string | null>(null);
  const rolesQuery = useQuery(() => organizationRolesQueryOptions(orgCtx.userId, orgCtx.org.id));
  const orgQuery = useQuery(() => organizationFullQueryOptions(orgCtx.userId, orgCtx.org.id));
  const members = () => orgQuery.data?.members ?? [];
  const invitations = () => orgQuery.data?.invitations ?? [];
  const canViewInvitations = () => orgCtx.access.operations.invitation.viewPending;
  const canCreate = () => orgCtx.access.operations.ac.create;
  const canUpdate = () => orgCtx.access.operations.ac.update;
  const canDelete = () => orgCtx.access.operations.ac.delete;

  const saveMutation = useMutation(() => ({
    mutationFn: async (value: RoleDraft) => {
      if (value.id) {
        const result = await authClient.organization.updateRole({
          organizationId: orgCtx.org.id,
          roleId: value.id,
          data: { roleName: value.name, permission: value.permission },
        });
        if (result.error) throw new Error(result.error.message ?? "保存角色失败");
      } else {
        const result = await authClient.organization.createRole({
          organizationId: orgCtx.org.id,
          role: value.name,
          permission: value.permission,
        });
        if (result.error) throw new Error(result.error.message ?? "创建角色失败");
      }
    },
    onSuccess: async () => {
      setDraft(null);
      await syncOrganizationCacheAfterChange(
        queryClient,
        orgCtx.userId,
        orgCtx.org.id,
        "role-definition-changed",
      );
    },
    onError: (error) => {
      const message = error.message || "角色保存失败，请重试";
      setRoleFeedback(message);
      toast.add({ title: message, type: "error" });
    },
  }));

  const deleteMutation = useMutation(() => ({
    mutationFn: async (roleId: string) => {
      const result = await authClient.organization.deleteRole({
        organizationId: orgCtx.org.id,
        roleId,
      });
      if (result.error) throw new Error(result.error.message ?? "删除角色失败");
    },
    onSuccess: async () => {
      setDeleteTarget(null);
      await syncOrganizationCacheAfterChange(
        queryClient,
        orgCtx.userId,
        orgCtx.org.id,
        "role-definition-changed",
      );
    },
    onError: (error) => {
      const message = error.message || "角色仍被成员或待处理邀请引用";
      setRoleFeedback(message);
      toast.add({ title: message, type: "error" });
    },
  }));

  const openDraft = (value: RoleDraft) => {
    setRoleFeedback(null);
    setDraft(value);
  };

  const memberCount = (role: string) => members().filter((member) => member.role === role).length;
  const invitationCount = (role: string) =>
    invitations().filter(
      (invitation) => invitation.status === "pending" && invitation.role === role,
    ).length;

  return (
    <div class="flex flex-col gap-6 p-6">
      <div class="flex items-start justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold">组织角色</h1>
          <p class="text-muted-foreground text-sm">
            预置角色只读；自定义角色仅组合服务端支持且当前操作者可授予的权限。
          </p>
        </div>
        <Show when={canCreate()}>
          <Button onClick={() => openDraft({ name: "", permission: {} })}>创建角色</Button>
        </Show>
      </div>

      <Show when={roleFeedback()}>
        {(feedback) => (
          <Alert variant="destructive">
            <AlertTitle>角色操作未完成</AlertTitle>
            <AlertDescription>{feedback()}</AlertDescription>
            <p class="text-sm">
              如果角色仍被使用，请先在成员页面调整成员角色；待处理邀请需要有邀请权限的成员先取消。
            </p>
          </Alert>
        )}
      </Show>

      <section class="flex flex-col gap-4">
        <h2 class="text-lg font-semibold">预置角色</h2>
        <div class="grid gap-4 md:grid-cols-3">
          <For each={builtIns}>
            {(item) => (
              <Card>
                <CardHeader>
                  <CardTitle class="flex items-center justify-between">
                    <span>{item.name}</span>
                    <Badge variant="outline">预置 · 只读</Badge>
                  </CardTitle>
                  <CardDescription>平台维护的组织角色定义。</CardDescription>
                </CardHeader>
                <CardContent class="flex flex-col gap-3">
                  <PermissionBadges permission={item.permission} />
                  <Show when={canCreate()}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        openDraft({
                          name: `${item.name}-copy`,
                          permission: Object.fromEntries(
                            Object.entries(item.permission).map(([resource, actions]) => [
                              resource,
                              [...actions],
                            ]),
                          ),
                        })
                      }
                    >
                      复制权限
                    </Button>
                  </Show>
                </CardContent>
              </Card>
            )}
          </For>
        </div>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>自定义角色</CardTitle>
          <CardDescription>
            保存角色会影响列出的成员数量。删除操作会由服务端再次检查成员和待处理邀请引用。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Show
            when={!rolesQuery.isPending}
            fallback={<p class="text-muted-foreground text-sm">正在读取角色…</p>}
          >
            <Show
              when={!rolesQuery.isError}
              fallback={
                <Alert variant="destructive">
                  <AlertTitle>无法读取角色</AlertTitle>
                  <AlertDescription>{rolesQuery.error?.message}</AlertDescription>
                </Alert>
              }
            >
              <Show
                when={(rolesQuery.data?.length ?? 0) > 0}
                fallback={
                  <p class="text-muted-foreground py-8 text-center text-sm">尚未创建自定义角色</p>
                }
              >
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>角色</TableHead>
                      <TableHead>权限</TableHead>
                      <TableHead>成员</TableHead>
                      <TableHead>待处理邀请</TableHead>
                      <TableHead class="w-40">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <For each={rolesQuery.data ?? []}>
                      {(role) => {
                        const permission = () => normalizePermission(role.permission);
                        const assignedMembers = () => memberCount(role.role);
                        const pendingInvitations = () => invitationCount(role.role);
                        const grantable = () => withinGrantBoundary(permission(), orgCtx.access);
                        const adminEquivalent = () => hasAdminPermissions(permission());
                        const protectedRole = () => adminEquivalent() && !orgCtx.access.isOwner;
                        const blockedByReferences = () =>
                          assignedMembers() > 0 ||
                          (canViewInvitations() && pendingInvitations() > 0);

                        return (
                          <TableRow>
                            <TableCell class="font-medium">{role.role}</TableCell>
                            <TableCell>
                              <PermissionBadges permission={permission()} />
                            </TableCell>
                            <TableCell>{assignedMembers()}</TableCell>
                            <TableCell>
                              {canViewInvitations() ? pendingInvitations() : "受限"}
                            </TableCell>
                            <TableCell>
                              <div class="flex gap-2">
                                <Show when={canUpdate() && grantable() && !protectedRole()}>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      openDraft({
                                        id: role.id,
                                        name: role.role,
                                        permission: permission(),
                                      })
                                    }
                                  >
                                    编辑
                                  </Button>
                                </Show>
                                <Show when={canDelete() && !protectedRole()}>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    disabled={blockedByReferences() || deleteMutation.isPending}
                                    aria-label={`删除角色 ${role.role}`}
                                    onClick={() =>
                                      setDeleteTarget({ id: role.id, name: role.role })
                                    }
                                  >
                                    ×
                                  </Button>
                                </Show>
                              </div>
                              <Show when={assignedMembers() > 0}>
                                <p class="text-muted-foreground mt-1 text-xs">
                                  先为这些成员调整角色后才能删除。
                                </p>
                              </Show>
                              <Show when={canViewInvitations() && pendingInvitations() > 0}>
                                <p class="text-muted-foreground mt-1 text-xs">
                                  先取消引用此角色的待处理邀请。
                                </p>
                              </Show>
                              <Show when={!canViewInvitations() && canDelete()}>
                                <p class="text-muted-foreground mt-1 text-xs">
                                  待处理邀请引用由服务器在删除时检查。
                                </p>
                              </Show>
                            </TableCell>
                          </TableRow>
                        );
                      }}
                    </For>
                  </TableBody>
                </Table>
              </Show>
            </Show>
          </Show>
        </CardContent>
      </Card>

      <RoleEditorDialog
        open={draft() !== null}
        onOpenChange={(open) => !open && setDraft(null)}
        initialDraft={draft()}
        catalog={permissionCatalog}
        access={orgCtx.access}
        affectedMemberCount={draft()?.id ? memberCount(draft()!.name) : 0}
        isSaving={saveMutation.isPending}
        onSave={(value) => void saveMutation.mutate(value)}
      />

      <AlertDialog
        open={deleteTarget() !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>删除自定义角色“{deleteTarget()?.name}”？</AlertDialogTitle>
            <AlertDialogDescription>
              有成员或待处理邀请引用时，服务端会拒绝删除。请先调整成员角色或处理邀请。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>取消</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={!deleteTarget() || deleteMutation.isPending}
              onClick={() => {
                const target = deleteTarget();
                if (target) void deleteMutation.mutate(target.id);
              }}
            >
              {deleteMutation.isPending ? "删除中…" : "确认删除"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function normalizePermission(value: unknown): Record<string, string[]> {
  if (typeof value === "string") {
    try {
      return normalizePermission(JSON.parse(value) as unknown);
    } catch {
      return {};
    }
  }
  if (typeof value !== "object" || value === null || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value).filter(
      (entry): entry is [string, string[]] =>
        Array.isArray(entry[1]) && entry[1].every((action) => typeof action === "string"),
    ),
  );
}

function withinGrantBoundary(
  permission: Record<string, string[]>,
  access: ReturnType<typeof useOrgContext>["access"],
): boolean {
  const operations = access.operations as unknown as Record<string, Record<string, boolean>>;
  return Object.entries(permission).every(([resource, actions]) =>
    actions.every((action) => operations[resource]?.[action] === true),
  );
}

function hasAdminPermissions(permission: Record<string, string[]>): boolean {
  const admin = builtInRoles.admin.statements as unknown as Record<string, string[]>;
  return Object.entries(admin).every(([resource, actions]) =>
    actions.every((action) => permission[resource]?.includes(action)),
  );
}

function PermissionBadges(props: { permission: Record<string, string[]> }) {
  const entries = () =>
    Object.entries(props.permission).flatMap(([resource, actions]) =>
      actions.map((action) => `${resource}.${action}`),
    );
  return (
    <Show
      when={entries().length > 0}
      fallback={<span class="text-muted-foreground text-sm">无额外权限</span>}
    >
      <div class="flex flex-wrap gap-1">
        <For each={entries()}>{(entry) => <Badge variant="secondary">{entry}</Badge>}</For>
      </div>
    </Show>
  );
}
