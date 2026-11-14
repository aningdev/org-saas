import { COMMON_ERROR_STATUS_MAP, ORPCError } from "@orpc/client";
import { QueryCache, QueryClient } from "@tanstack/solid-query";

import { toast } from "../ui/toast";

export function createQueryClient(): QueryClient {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        retry: false,
      },
    },
    queryCache: new QueryCache({
      onError: (error, query) => {
        if (query.state.data === undefined) return;
        const status =
          error instanceof ORPCError
            ? COMMON_ERROR_STATUS_MAP[error.code as keyof typeof COMMON_ERROR_STATUS_MAP]
            : undefined;
        const data: unknown = error instanceof ORPCError ? error.data : undefined;
        const requestId =
          typeof data === "object" && data !== null && "requestId" in data
            ? data.requestId
            : undefined;
        toast.add({
          title:
            status !== undefined && status >= 400 && status < 500 && error.message.trim()
              ? error.message
              : "暂时无法完成请求，请稍后重试",
          description:
            typeof requestId === "string" && /^[a-zA-Z0-9_-]{8,128}$/.test(requestId)
              ? `问题编号：${requestId}`
              : undefined,
          type: "error",
          actionProps: {
            children: "重试",
            onClick: () => {
              void queryClient.refetchQueries({ queryKey: query.queryKey, exact: true });
            },
          },
        });
      },
    }),
  });
  return queryClient;
}
