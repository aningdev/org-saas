import { RPCJsonSerializer } from "@orpc/client";

/** Shared RPC JSON serializer for Query keys and SSR hydration. */
export const rpcJsonSerializer = new RPCJsonSerializer();
