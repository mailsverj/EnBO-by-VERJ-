import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./users.js";

export const broadcastsTable = pgTable("broadcasts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  targetRoles: text("target_roles").notNull().default("all"), // 'BDO', 'Engineer', 'all', or comma-list
  sentBy: integer("sent_by").references(() => usersTable.id),
  sentByName: text("sent_by_name"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const broadcastReadsTable = pgTable("broadcast_reads", {
  id: serial("id").primaryKey(),
  broadcastId: integer("broadcast_id").references(() => broadcastsTable.id),
  userId: integer("user_id").references(() => usersTable.id),
  readAt: timestamp("read_at", { withTimezone: true }).defaultNow(),
});
