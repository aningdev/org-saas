import { createFileRoute } from "@tanstack/solid-router";

import ForgotPasswordForm from "@/components/forgot-password-form";

export const Route = createFileRoute("/_auth/forgot-password")({
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
