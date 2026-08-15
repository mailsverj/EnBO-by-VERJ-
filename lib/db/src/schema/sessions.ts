import { pgTable, text, timestamp, jsonb } from "drizzle-orm/pg-core";

// connect-pg-simple expects this exact schema
export const sessionsTable = pgTable("session", {
  sid: text("sid").primaryKey(),
  sess: jsonb("sess").notNull(),
  expire: timestamp("expire", { precision: 6 }).notNull(),
});
