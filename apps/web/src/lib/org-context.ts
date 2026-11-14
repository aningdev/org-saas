import { createContext, useContext } from "solid-js";

import type { OrganizationAccess } from "@/lib/query-options";

export interface OrgContextValue {
  userId: string;
  org: {
    id: string;
    name: string;
    slug: string;
    logo: string | null;
    createdAt: Date;
  };
  role: string;
  isOwner: boolean;
  access: OrganizationAccess;
}

export const OrgContext = createContext<OrgContextValue>();

export function useOrgContext(): OrgContextValue {
  return useContext(OrgContext);
}
