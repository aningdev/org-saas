import { createFileRoute, redirect } from "@tanstack/solid-router";

export const Route = createFileRoute("/_authenticated/dashboard/")({
  beforeLoad: ({ location }) => {
    throw redirect({
      to: "/me",
      search: (previous) => previous,
      hash: location.hash,
    });
  },
});
