import { Link, useNavigate } from "@tanstack/solid-router";
import { createSignal, Show } from "solid-js";
import { z } from "zod";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { toast } from "@/ui/toast";

const schema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirm: z.string().min(8, "Password must be at least 8 characters"),
  })
  .refine((value) => value.password === value.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });

export default function ResetPasswordForm(props: { token: string | null; error: string | null }) {
  const navigate = useNavigate({ from: "/" });
  const [password, setPassword] = createSignal("");
  const [confirm, setConfirm] = createSignal("");
  const [errors, setErrors] = createSignal<Partial<Record<"password" | "confirm", string>>>({});
  const [isSubmitting, setIsSubmitting] = createSignal(false);

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!props.token) {
      toast.add({ title: "Reset link is missing or invalid", type: "error" });
      return;
    }

    const parsed = schema.safeParse({ password: password(), confirm: confirm() });
    if (!parsed.success) {
      const fieldErrors: Partial<Record<"password" | "confirm", string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (key === "password" || key === "confirm") fieldErrors[key] ??= issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    try {
      const result = await authClient.resetPassword({
        newPassword: parsed.data.password,
        token: props.token,
      });
      if (result.error) {
        toast.add({ title: result.error.message || "Reset failed", type: "error" });
        return;
      }
      toast.add({ title: "Password updated. You can sign in now.", type: "success" });
      await navigate({ to: "/login", search: { redirect: undefined } });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div class="mx-auto mt-10 w-full max-w-md p-6">
      <h1 class="mb-6 text-center text-3xl font-bold">Choose a new password</h1>

      <Show when={props.error || !props.token}>
        <p class="text-destructive mb-4 text-center text-sm">
          This reset link is invalid or has expired. Request a new one from the forgot-password
          page.
        </p>
        <div class="text-center">
          <Button variant="link" render={(p) => <Link {...p} to="/forgot-password" />}>
            Request a new link
          </Button>
        </div>
      </Show>

      <Show when={props.token && !props.error}>
        <form onSubmit={handleSubmit} class="space-y-4">
          <div class="space-y-2">
            <Label for="password">New password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={password()}
              onInput={(e) => setPassword(e.currentTarget.value)}
            />
            <Show when={errors().password}>
              {(message) => <p class="text-red-500">{message()}</p>}
            </Show>
          </div>
          <div class="space-y-2">
            <Label for="confirm">Confirm password</Label>
            <Input
              id="confirm"
              name="confirm"
              type="password"
              value={confirm()}
              onInput={(e) => setConfirm(e.currentTarget.value)}
            />
            <Show when={errors().confirm}>
              {(message) => <p class="text-red-500">{message()}</p>}
            </Show>
          </div>
          <Button type="submit" class="w-full" disabled={isSubmitting()}>
            {isSubmitting() ? "Saving..." : "Update password"}
          </Button>
        </form>
      </Show>
    </div>
  );
}
