import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements } from "better-auth/plugins/organization/access";

const statements = {
  ...defaultStatements,
  audit: ["read"],
  task: ["create", "read", "update", "delete"],
} as const;
const ac = createAccessControl(statements);

const member = ac.newRole({
  task: ["create", "read", "update"],
});

const admin = ac.newRole({
  organization: ["update"],
  invitation: ["create", "cancel"],
  member: ["create", "update", "delete"],
  team: ["create", "update", "delete"],
  audit: ["read"],
  task: ["create", "read", "update", "delete"],
});

const owner = ac.newRole({
  organization: ["update"],
  invitation: ["create", "cancel"],
  member: ["create", "update", "delete"],
  team: ["create", "update", "delete"],
  ac: ["create", "read", "update", "delete"],
  audit: ["read"],
  task: ["create", "read", "update", "delete"],
});

export { ac };
export const roles = { owner, admin, member };
