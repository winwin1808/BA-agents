import {
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import type {
  WorkflowContextSnapshotEntry,
  WorkflowGraph,
  WorkflowJiraPack,
} from "@/lib/workflows/types";

export const adminRoleEnum = pgEnum("admin_role", ["owner", "admin"]);
export const recordStatusEnum = pgEnum("record_status", ["active", "disabled"]);
export const workflowContextScopeEnum = pgEnum("workflow_context_scope", [
  "lock",
  "quote",
  "solution",
  "cross_suite",
]);
export const workflowGenerationOutcomeEnum = pgEnum("workflow_generation_outcome", [
  "success",
  "error",
  "rate_limited",
  "unavailable",
  "invalid_input",
]);
export const providerApiKeyProviderEnum = pgEnum("provider_api_key_provider", ["openai"]);
export const providerApiKeyValidationStatusEnum = pgEnum(
  "provider_api_key_validation_status",
  ["valid", "invalid"],
);

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

export const personalAccessTokens = pgTable("personal_access_tokens", {
  id: uuid("id").defaultRandom().primaryKey(),
  label: varchar("label", { length: 255 }).notNull(),
  ownerEmail: varchar("owner_email", { length: 320 }).notNull(),
  tokenValue: text("token_value"),
  tokenPrefix: varchar("token_prefix", { length: 24 }).notNull(),
  tokenHash: varchar("token_hash", { length: 128 }).notNull().unique(),
  allowedScope: varchar("allowed_scope", { length: 255 }).notNull().default("mcp:read"),
  status: recordStatusEnum("status").notNull().default("active"),
  notes: text("notes"),
  lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const providerApiKeys = pgTable("provider_api_keys", {
  id: uuid("id").defaultRandom().primaryKey(),
  provider: providerApiKeyProviderEnum("provider").notNull().default("openai"),
  label: varchar("label", { length: 255 }).notNull(),
  modelName: varchar("model_name", { length: 120 }).notNull().default("gpt-5.2"),
  encryptedSecret: text("encrypted_secret").notNull(),
  maskedPreview: varchar("masked_preview", { length: 32 }).notNull(),
  status: recordStatusEnum("status").notNull().default("active"),
  validationStatus: providerApiKeyValidationStatusEnum("validation_status")
    .notNull()
    .default("valid"),
  validationError: text("validation_error"),
  lastValidatedAt: timestamp("last_validated_at", { withTimezone: true }),
  createdByAdminUserId: uuid("created_by_admin_user_id"),
  updatedByAdminUserId: uuid("updated_by_admin_user_id"),
  deactivatedAt: timestamp("deactivated_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const workflowArtifacts = pgTable("workflow_artifacts", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  summary: text("summary").notNull(),
  contextScope: workflowContextScopeEnum("context_scope").notNull(),
  prompt: text("prompt").notNull(),
  contextSnapshot: jsonb("context_snapshot")
    .$type<WorkflowContextSnapshotEntry[]>()
    .notNull(),
  flowGraphJson: jsonb("flow_graph_json").$type<WorkflowGraph>().notNull(),
  jiraPackJson: jsonb("jira_pack_json").$type<WorkflowJiraPack>().notNull(),
  bpmnXml: text("bpmn_xml").notNull(),
  modelName: varchar("model_name", { length: 120 }).notNull(),
  latencyMs: integer("latency_ms").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const workflowGenerationAttempts = pgTable("workflow_generation_attempts", {
  id: uuid("id").defaultRandom().primaryKey(),
  ipHash: varchar("ip_hash", { length: 128 }).notNull(),
  promptChars: integer("prompt_chars").notNull(),
  contextScope: workflowContextScopeEnum("context_scope").notNull(),
  outcome: workflowGenerationOutcomeEnum("outcome").notNull(),
  errorCode: varchar("error_code", { length: 64 }),
  artifactId: uuid("artifact_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type AdminUser = typeof adminUsers.$inferSelect;
export type McpClient = typeof mcpClients.$inferSelect;
export type AuthAuditLog = typeof authAuditLogs.$inferSelect;
export type PersonalAccessToken = typeof personalAccessTokens.$inferSelect;
export type ProviderApiKey = typeof providerApiKeys.$inferSelect;
export type WorkflowArtifact = typeof workflowArtifacts.$inferSelect;
export type WorkflowGenerationAttempt = typeof workflowGenerationAttempts.$inferSelect;
