import type { RouterContractClient } from "@orpc/contract";

import { auditContract } from "./audit";
import { betterAuthOpenAPIDocsContract } from "./better-auth-openapi-docs";
import { dashboardContract } from "./dashboard";
import { organizationContract } from "./organization";
import { platformContract } from "./platform";
import { systemContract } from "./system";
import { taskContract } from "./task";
import { userContract } from "./user";

export const apiContract = {
  ...systemContract,
  betterAuthOpenAPIDocs: betterAuthOpenAPIDocsContract,
  user: userContract,
  dashboard: dashboardContract,
  organization: organizationContract,
  platform: platformContract,
  audit: auditContract,
  task: taskContract,
};

export type ApiContractClient = RouterContractClient<typeof apiContract>;
