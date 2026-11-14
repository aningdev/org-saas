import { createRPCClient } from "@org-saas/api/client";
import { createContext } from "@org-saas/api/context";
import { apiContract, type ApiContractClient } from "@org-saas/api/contracts/index";
import { standardLimiter } from "@org-saas/api/index";
import { appRouter } from "@org-saas/api/routers/index";
import { createRouterClient } from "@orpc/server";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import { createIsomorphicFn } from "@tanstack/solid-start";
import { getRequestHeaders } from "@tanstack/solid-start/server";

export { createQueryClient } from "./query-client";

const getORPCClient = createIsomorphicFn()
  .server((): ApiContractClient =>
    createRouterClient(appRouter, {
      context: async () => {
        try {
          const headers = getRequestHeaders();

          return {
            ...createContext({ headers }),
            ratelimiter: standardLimiter,
          };
        } catch {
          return {
            ...createContext({ headers: new Headers() }),
            ratelimiter: standardLimiter,
          };
        }
      },
    }),
  )
  .client((): ApiContractClient =>
    createRPCClient(apiContract, {
      origin: window.location.origin,
      url: "/api/rpc",
    }),
  );

export const client: ApiContractClient = getORPCClient();
export const orpc = createTanstackQueryUtils(client);
