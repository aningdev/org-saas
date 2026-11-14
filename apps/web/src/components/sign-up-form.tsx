import { useQueryClient } from "@tanstack/solid-query";
import { useNavigate } from "@tanstack/solid-router";
import { createSignal, Show } from "solid-js";
import { z } from "zod";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { toast } from "@/ui/toast";

const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type SignUpField = "name" | "email" | "password";

export default function SignUpForm(props: { redirectTo: string; onSwitchToSignIn: () => void }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate({ from: "/" });

  const [name, setName] = createSignal("");
  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [errors, setErrors] = createSignal<Partial<Record<SignUpField, string>>>({});
  const [isSubmitting, setIsSubmitting] = createSignal(false);

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const parsed = signUpSchema.safeParse({
      name: name(),
      email: email(),
      password: password(),
    });
    if (!parsed.success) {
      const fieldErrors: Partial<Record<SignUpField, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (key === "name" || key === "email" || key === "password") {
          fieldErrors[key] ??= issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    try {
      await authClient.signUp.email(
        {
          email: parsed.data.email,
          password: parsed.data.password,
          name: parsed.data.name,
        },
        {
          onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["session"] });
            await navigate({
              to: props.redirectTo as string,
            });
            toast.add({ title: "注册成功！", type: "success" });
          },
          onError: (error) => {
            toast.add({ title: error.error.message || error.error.statusText, type: "error" });
          },
        },
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div class="mx-auto mt-10 w-full max-w-md p-6">
      <h1 class="mb-6 text-center text-3xl font-bold">Create Account</h1>

      <form onSubmit={handleSubmit} class="space-y-4">
        <div class="space-y-2">
          <Label for="name">Name</Label>
          <Input
            id="name"
            name="name"
            value={name()}
            onInput={(e) => setName(e.currentTarget.value)}
          />
          <Show when={errors().name}>{(message) => <p class="text-red-500">{message()}</p>}</Show>
        </div>

        <div class="space-y-2">
          <Label for="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={email()}
            onInput={(e) => setEmail(e.currentTarget.value)}
          />
          <Show when={errors().email}>{(message) => <p class="text-red-500">{message()}</p>}</Show>
        </div>

        <div class="space-y-2">
          <Label for="password">Password</Label>
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

        <Button type="submit" class="w-full" disabled={isSubmitting()}>
          {isSubmitting() ? "Submitting..." : "Sign Up"}
        </Button>
      </form>

      <div class="mt-4 text-center">
        <Button
          variant="link"
          onClick={props.onSwitchToSignIn}
          class="text-indigo-600 hover:text-indigo-800"
        >
          Already have an account? Sign In
        </Button>
      </div>
    </div>
  );
}
