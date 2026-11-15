import { Link } from "@tanstack/solid-router";
import { createSignal, Show } from "solid-js";
import { z } from "zod";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { toast } from "@/ui/toast";

const schema = z.object({
  email: z.email("Invalid email address"),
});

export default function ForgotPasswordForm() {
  const [email, setEmail] = createSignal("");
  const [errors, setErrors] = createSignal<Partial<Record<"email", string>>>({});
  const [isSubmitting, setIsSubmitting] = createSignal(false);
  const [sent, setSent] = createSignal(false);

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const parsed = schema.safeParse({ email: email() });
    if (!parsed.success) {
      const fieldErrors: Partial<Record<"email", string>> = {};
      for (const issue of parsed.error.issues) {
        if (issue.path[0] === "email") fieldErrors.email ??= issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    try {
      const redirectTo = new URL("/reset-password", window.location.origin).toString();
      // Always show the same outcome: BA already hides missing accounts;
      // never surface provider/config errors that would enumerate emails.
      await authClient.requestPasswordReset({
        email: parsed.data.email,
        redirectTo,
      });
      setSent(true);
      toast.add({
        title: "If that email is registered, a reset link has been sent.",
        type: "success",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div class="mx-auto mt-10 w-full max-w-md p-6">
      <h1 class="mb-2 text-center text-3xl font-bold">Reset password</h1>
      <p class="text-muted-foreground mb-6 text-center text-sm">
        Enter your account email. If it is registered and mail is configured, a reset link will be
        sent.
      </p>

      <Show
        when={!sent()}
        fallback={
          <div class="space-y-4 text-center">
            <p>Check your inbox for the reset link.</p>
            <Button
              variant="link"
              render={(p) => <Link {...p} to="/login" search={{ redirect: undefined }} />}
            >
              Back to sign in
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit} class="space-y-4">
          <div class="space-y-2">
            <Label for="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={email()}
              onInput={(e) => setEmail(e.currentTarget.value)}
            />
            <Show when={errors().email}>
              {(message) => <p class="text-red-500">{message()}</p>}
            </Show>
          </div>
          <Button type="submit" class="w-full" disabled={isSubmitting()}>
            {isSubmitting() ? "Sending..." : "Send reset link"}
          </Button>
        </form>
        <div class="mt-4 text-center">
          <Button
            variant="link"
            render={(p) => <Link {...p} to="/login" search={{ redirect: undefined }} />}
          >
            Back to sign in
          </Button>
        </div>
      </Show>
    </div>
  );
}
