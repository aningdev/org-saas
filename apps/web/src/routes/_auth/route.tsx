import { createFileRoute, Outlet } from "@tanstack/solid-router";

export const Route = createFileRoute("/_auth")({
  component: () => <Outlet />,
});
