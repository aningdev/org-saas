import { useQuery } from "@tanstack/solid-query";

import { useOrgContext } from "@/lib/org-context";
import { organizationAccessQueryOptions } from "@/lib/query-options";

/**
 * UI helper over the access-context DTO.
 * Pass Better Auth permission maps (`{ member: ["update"] }`, `{ ac: ["read"] }`).
 * Product-only flags such as `organization.archive` / `restore` are also on that DTO.
 */
export function usePermission(permissions: Record<string, string[]>): boolean {
  const { org, userId } = useOrgContext();
  const query = useQuery(() => organizationAccessQueryOptions(userId, org.id));
  if (query.isPending) return false;

  const operations = query.data.operations as Record<string, Record<string, boolean>>;
  return Object.entries(permissions).every(([resource, actions]) =>
    actions.every((action) => operations[resource]?.[action] === true),
  );
}
