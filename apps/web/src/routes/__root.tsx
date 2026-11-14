import type { JSX } from "@solidjs/web";
import type { QueryClient } from "@tanstack/solid-query";
import { createRootRouteWithContext, HeadContent, Scripts } from "@tanstack/solid-router";
import { TanStackRouterDevtools } from "@tanstack/solid-router-devtools";
import { Loading } from "solid-js";

import { ForbiddenPage } from "@/components/fallback/forbidden";
import { NotFoundPage } from "@/components/fallback/not-found";
import { UnauthorizedPage } from "@/components/fallback/unauthorized";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/ui/toast";
import { TooltipProvider } from "@/ui/tooltip";
import { ForbiddenError, NotFoundError, UnauthorizedError } from "@/utils/errors";
import type { orpc } from "@/utils/orpc";

import appCss from "../index.css?url";

export interface RouterAppContext {
  orpc: typeof orpc;
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Org SaaS",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  errorComponent: (props) => {
    if (props.error instanceof NotFoundError) {
      return <NotFoundPage />;
    }
    if (props.error instanceof ForbiddenError) {
      return <ForbiddenPage error={props.error} />;
    }
    if (props.error instanceof UnauthorizedError) {
      return <UnauthorizedPage error={props.error} />;
    }
    throw props.error;
  },
  shellComponent: RootDocument,
});

function RootDocument(props: { children?: JSX.Element }) {
  return (
    <html lang="zh">
      <head>
        <HeadContent />
      </head>
      <body>
        <ThemeProvider defaultTheme="system" storageKey="theme">
          <div class="min-h-screen">
            <TooltipProvider>
              <Loading>{props.children}</Loading>
              <Toaster />
            </TooltipProvider>
          </div>
          {import.meta.env.DEV ? <TanStackRouterDevtools /> : null}
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  );
}
