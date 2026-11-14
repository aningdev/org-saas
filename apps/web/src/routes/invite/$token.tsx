import { useQuery, useQueryClient } from "@tanstack/solid-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/solid-router";
import { createSignal, Loading, Show } from "solid-js";

import { getSession } from "@/functions/auth.fn";
import { authClient } from "@/lib/auth-client";
import { syncOrganizationListCacheAfterChange } from "@/lib/organization-cache";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";

export const Route = createFileRoute("/invite/$token")({
  component: InvitePage,
});

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
      class="size-4"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
      class="size-4"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

function LogOutIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
      class="size-4"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" x2="9" y1="12" y2="12" />
    </svg>
  );
}

function InvitePage() {
  const params = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [loading, setLoading] = createSignal(false);
  const [feedback, setFeedback] = createSignal<string>();
  const invitePath = () => `/invite/${encodeURIComponent(params().token)}`;

  const sessionQuery = useQuery(() => ({
    queryKey: ["session"],
    queryFn: () => getSession(),
  }));

  const invitationQuery = useQuery(() => {
    const userId = sessionQuery.isPending ? undefined : sessionQuery.data?.user?.id;
    return {
      queryKey: ["invitation", params().token, userId],
      queryFn: () => authClient.organization.getInvitation({ query: { id: params().token } }),
      enabled: userId != null,
      retry: false,
    };
  });

  const handleSignOut = async () => {
    setLoading(true);
    setFeedback(undefined);
    try {
      const result = await authClient.signOut();
      if (result.error) {
        setFeedback(result.error.message ?? "退出登录失败，请重试");
        return;
      }
      queryClient.clear();
      await navigate({ to: "/login", search: { redirect: invitePath() } });
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "退出登录失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    setLoading(true);
    setFeedback(undefined);
    try {
      const result = await authClient.organization.acceptInvitation({
        invitationId: params().token,
      });
      if (result.error) {
        setFeedback(result.error.message ?? "接受邀请失败");
        return;
      }

      const acceptedOrganizationId = result.data?.member.organizationId;
      if (
        !acceptedOrganizationId ||
        result.data?.invitation.organizationId !== acceptedOrganizationId
      ) {
        setFeedback("邀请已处理，但无法确认加入的组织。请从个人中心检查组织列表。");
        return;
      }

      const organizationsResult = await authClient.organization.list();
      if (organizationsResult.error) {
        setFeedback(organizationsResult.error.message ?? "已加入组织，但无法加载组织列表");
        return;
      }
      const organization = organizationsResult.data?.find(
        (item) => item.id === acceptedOrganizationId,
      );
      if (!organization) {
        setFeedback("已加入组织，但当前账号的组织列表尚未返回该组织，请稍后从个人中心进入。");
        return;
      }

      const userId = sessionQuery.data?.user?.id;
      if (userId) {
        await syncOrganizationListCacheAfterChange(queryClient, userId);
      }
      await navigate({ to: `/org/${organization.slug}` as string });
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "接受邀请失败");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    setFeedback(undefined);
    try {
      const result = await authClient.organization.rejectInvitation({
        invitationId: params().token,
      });
      if (result.error) {
        setFeedback(result.error.message ?? "拒绝邀请失败");
        return;
      }
      await navigate({ to: "/" });
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "拒绝邀请失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="flex min-h-screen items-center justify-center p-4">
      <Card class="w-full max-w-md">
        <CardHeader class="text-center">
          <CardTitle>组织邀请</CardTitle>
          <CardDescription>
            <Loading fallback="正在确认邀请状态…">
              <Show when={sessionQuery.data?.user} fallback="登录受邀账号后即可继续处理此邀请。">
                <Loading fallback="正在确认邀请状态…">
                  <InviteDescription invitationQuery={invitationQuery} />
                </Loading>
              </Show>
            </Loading>
          </CardDescription>
        </CardHeader>
        <CardContent class="flex flex-col items-center gap-4">
          <Show when={feedback()}>
            {(message) => (
              <p role="alert" class="text-destructive text-sm">
                {message()}
              </p>
            )}
          </Show>

          <Loading fallback={null}>
            <Show
              when={sessionQuery.data?.user}
              fallback={
                <Link to="/login" search={{ redirect: invitePath() }}>
                  <Button>登录或注册以继续</Button>
                </Link>
              }
            >
              <Loading fallback={null}>
                <InviteBody
                  invitationQuery={invitationQuery}
                  loading={loading}
                  onSignOut={handleSignOut}
                  onAccept={handleAccept}
                  onReject={handleReject}
                />
              </Loading>
            </Show>
          </Loading>
        </CardContent>
      </Card>
    </div>
  );
}

function InviteDescription(props: { invitationQuery: { data: unknown } }) {
  void props.invitationQuery.data;
  return <>你收到了一个加入组织的邀请</>;
}

function InviteBody(props: {
  invitationQuery: {
    data: Awaited<ReturnType<typeof authClient.organization.getInvitation>>;
    error: Error | null;
    isError: boolean;
  };
  loading: () => boolean;
  onSignOut: () => Promise<void>;
  onAccept: () => Promise<void>;
  onReject: () => Promise<void>;
}) {
  return (
    <Show
      when={!props.invitationQuery.isError}
      fallback={
        <p role="alert" class="text-center text-sm">
          {props.invitationQuery.error instanceof Error
            ? props.invitationQuery.error.message
            : "暂时无法确认此邀请，请稍后重试。"}
        </p>
      }
    >
      <InviteBodyReady
        invitationQuery={props.invitationQuery}
        loading={props.loading}
        onSignOut={props.onSignOut}
        onAccept={props.onAccept}
        onReject={props.onReject}
      />
    </Show>
  );
}

function InviteBodyReady(props: {
  invitationQuery: {
    data: Awaited<ReturnType<typeof authClient.organization.getInvitation>>;
  };
  loading: () => boolean;
  onSignOut: () => Promise<void>;
  onAccept: () => Promise<void>;
  onReject: () => Promise<void>;
}) {
  const invitationError = () => props.invitationQuery.data.error;
  const isAccountMismatch = () =>
    invitationError()?.code === "YOU_ARE_NOT_THE_RECIPIENT_OF_THE_INVITATION";
  const invitation = () => props.invitationQuery.data.data;

  return (
    <>
      <Show when={isAccountMismatch()}>
        <>
          <p class="text-center text-sm" role="alert">
            当前登录账号与邀请接收账号不匹配。请切换到受邀账号后重新打开邀请链接。
          </p>
          <Button onClick={() => void props.onSignOut()} disabled={props.loading()}>
            <LogOutIcon />
            切换账号
          </Button>
        </>
      </Show>

      <Show when={invitationError() && !isAccountMismatch()}>
        <p role="alert" class="text-center text-sm">
          {invitationError()?.message ?? "此邀请无效、已过期或已处理，无法继续。"}
        </p>
      </Show>

      <Show when={!invitationError() && invitation()}>
        {(data) => (
          <>
            <p class="text-center text-sm">
              邀请你加入 {data().organizationName}（{data().organizationSlug}）
            </p>
            <div class="flex justify-center gap-4">
              <Button
                variant="outline"
                onClick={() => void props.onReject()}
                disabled={props.loading()}
              >
                <XIcon />
                拒绝
              </Button>
              <Button onClick={() => void props.onAccept()} disabled={props.loading()}>
                <CheckIcon />
                {props.loading() ? "处理中…" : "接受邀请"}
              </Button>
            </div>
          </>
        )}
      </Show>
    </>
  );
}
