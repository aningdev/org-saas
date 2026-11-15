import { sql } from "drizzle-orm";
import { check, index, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { organization, user } from "./auth";

export const organizationTask = pgTable(
  "organization_task",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    status: text("status").notNull().default("open"),
    createdByUserId: text("created_by_user_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    completedAt: timestamp("completed_at"),
  },
  (table) => [
    index("organization_task_org_id_idx").on(table.organizationId),
    check("organization_task_status_check", sql`${table.status} in ('open', 'completed')`),
  ],
);
