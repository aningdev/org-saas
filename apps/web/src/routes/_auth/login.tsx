import { createFileRoute } from "@tanstack/solid-router";
import { createSignal, Show } from "solid-js";

import SignInForm from "@/components/sign-in-form";
import SignUpForm from "@/components/sign-up-form";
import { getSignInDestination, getSafeReturnTarget } from "@/utils/return-target";

export const Route = createFileRoute("/_auth/login")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: getSafeReturnTarget(search.redirect),
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const [showSignIn, setShowSignIn] = createSignal(false);
  const search = Route.useSearch();
  const redirectTo = () => getSignInDestination(search().redirect);

  return (
    <Show
      when={showSignIn()}
      fallback={
        <SignUpForm redirectTo={redirectTo()} onSwitchToSignIn={() => setShowSignIn(true)} />
      }
    >
      <SignInForm redirectTo={redirectTo()} onSwitchToSignUp={() => setShowSignIn(false)} />
    </Show>
  );
}
