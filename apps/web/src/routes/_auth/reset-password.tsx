import { createFileRoute } from "@tanstack/solid-router";

import ResetPasswordForm from "@/components/reset-password-form";

export const Route = createFileRoute("/_auth/reset-password")({
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search.token === "string" ? search.token : null,
    error: typeof search.error === "string" ? search.error : null,
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const search = Route.useSearch();
  return <ResetPasswordForm token={search().token} error={search().error} />;
}
