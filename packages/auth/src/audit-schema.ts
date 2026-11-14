/**
 * Registers the custom auditLog model with Better Auth.
 * Drizzle owns the physical table; without this plugin schema entry,
 * adapter.create({ model: "auditLog" }) fails with "Model not found".
 */
export const auditSchemaPlugin = {
  id: "audit-schema",
  schema: {
    auditLog: {
      fields: {
        scope: { type: "string" },
        organizationId: { type: "string", required: false },
        actorId: { type: "string" },
        actorName: { type: "string" },
        action: { type: "string" },
        targetType: { type: "string" },
        targetId: { type: "string", required: false },
        summary: { type: "json" },
        occurredAt: { type: "date", defaultValue: () => new Date() },
      },
    },
  },
} as const;
