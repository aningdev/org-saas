import { QueryClientProvider } from "@tanstack/solid-query";
import { createRouter as createTanStackRouter } from "@tanstack/solid-router";

import "@ui-sdk/core/web.css";
import "./index.css";
import { ErrorBoundary, Loader, NotFoundPage } from "@/components/fallback";

import { routeTree } from "./routeTree.gen";
import { createQueryClient, orpc } from "./utils/orpc";

export const getRouter = () => {
  const queryClient = createQueryClient();
  const router = createTanStackRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
    context: { orpc, queryClient },
    defaultPendingComponent: () => <Loader />,
    defaultNotFoundComponent: () => <NotFoundPage />,
    defaultErrorComponent: (props) => <ErrorBoundary error={props.error} />,
    Wrap: (props) => (
      <QueryClientProvider client={queryClient}>{props.children}</QueryClientProvider>
    ),
  });
  return router;
};

declare module "@tanstack/solid-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
