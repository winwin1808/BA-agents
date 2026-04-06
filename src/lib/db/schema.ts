import {
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const adminRoleEnum = pgEnum("admin_role", ["owner", "admin"]);
export const recordStatusEnum = pgEnum("record_status", ["active", "disabled"]);

export const adminUsers = pgTable("admin_users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  displayName: varchar("display_name", { length: 255 }).notNull(),
  role: adminRoleEnum("role").notNull().default("admin"),
  status: recordStatusEnum("status").notNull().default("active"),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const mcpClients = pgTable("mcp_clients", {
  id: uuid("id").defaultRandom().primaryKey(),
  oidcClientId: varchar("oidc_client_id", { length: 255 }).notNull().unique(),
  displayName: varchar("display_name", { length: 255 }).notNull(),
  status: recordStatusEnum("status").notNull().default("active"),
  allowedScope: varchar("allowed_scope", { length: 255 }).notNull().default("mcp:read"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const authAuditLogs = pgTable("auth_audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  eventType: varchar("event_type", { length: 100 }).notNull(),
  subject: text("subject"),
  email: varchar("email", { length: 320 }),
  clientId: varchar("client_id", { length: 255 }),
  route: varchar("route", { length: 255 }),
  outcome: varchar("outcome", { length: 50 }).notNull(),
  reason: text("reason"),
  ipHash: varchar("ip_hash", { length: 128 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type AdminUser = typeof adminUsers.$inferSelect;
export type McpClient = typeof mcpClients.$inferSelect;
export type AuthAuditLog = typeof authAuditLogs.$inferSelect;
