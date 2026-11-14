import { createFileRoute, redirect } from "@tanstack/solid-router";

export const Route = createFileRoute("/_authenticated/dashboard/profile/")({
  beforeLoad: ({ location }) => {
    throw redirect({
      to: "/me/settings/profile",
      search: (previous) => previous,
      hash: location.hash,
    });
  },
});
