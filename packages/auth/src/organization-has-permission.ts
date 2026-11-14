import { auth } from "./index";

/**
 * Thin wrapper around Better Auth's official `auth.api.hasPermission`.
 * Prefer this (or `authClient.organization.hasPermission`) over re-implementing RBAC.
 */
export async function organizationHasPermission(input: {
  headers: Headers;
  organizationId: string;
  permissions: Record<string, string[]>;
}): Promise<boolean> {
  const result = await auth.api.hasPermission({
    headers: input.headers,
    body: {
      organizationId: input.organizationId,
      permissions: input.permissions,
    },
  });
  return result.success === true;
}
