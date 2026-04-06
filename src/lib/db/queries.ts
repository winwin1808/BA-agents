import { and, desc, eq, ilike, or } from "drizzle-orm";

import { getDb, isDatabaseConfigured } from "@/lib/db";
import {
  adminUsers,
  authAuditLogs,
  mcpClients,
  personalAccessTokens,
} from "@/lib/db/schema";
import {
  createAdminUserInSupabase,
  createAuditLogInSupabase,
  createMcpClientInSupabase,
  createPersonalAccessTokenInSupabase,
  deletePersonalAccessTokenInSupabase,
  getAdminUserByEmailFromSupabase,
  getMcpClientByClientIdFromSupabase,
  getPersonalAccessTokenByHashFromSupabase,
  isSupabaseConfigured,
  listAdminUsersFromSupabase,
  listAuditLogsFromSupabase,
  listMcpClientsFromSupabase,
  listPersonalAccessTokensFromSupabase,
  touchPersonalAccessTokenInSupabase,
  touchAdminLastLoginInSupabase,
  updateAdminUserInSupabase,
  updateMcpClientInSupabase,
  updatePersonalAccessTokenInSupabase,
} from "@/lib/supabase/admin-store";

export async function getAdminUserByEmail(email: string) {
  if (!isDatabaseConfigured()) {
    return null;
  }

  if (isSupabaseConfigured()) {
    return getAdminUserByEmailFromSupabase(email);
  }

  const [user] = await getDb()
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.email, email.toLowerCase()))
    .limit(1);

  return user ?? null;
}

export async function listAdminUsers() {
  if (!isDatabaseConfigured()) {
    return [];
  }

  if (isSupabaseConfigured()) {
    return listAdminUsersFromSupabase();
  }

  return getDb().select().from(adminUsers).orderBy(adminUsers.email);
}

export async function createAdminUser(input: {
  email: string;
  displayName: string;
  role: "owner" | "admin";
  status?: "active" | "disabled";
}) {
  if (isSupabaseConfigured()) {
    return createAdminUserInSupabase(input);
  }

  const [row] = await getDb()
    .insert(adminUsers)
    .values({
      email: input.email.toLowerCase(),
      displayName: input.displayName,
      role: input.role,
      status: input.status ?? "active",
    })
    .returning();

  return row;
}

export async function updateAdminUser(input: {
  id: string;
  displayName?: string;
  role?: "owner" | "admin";
  status?: "active" | "disabled";
}) {
  if (isSupabaseConfigured()) {
    return updateAdminUserInSupabase(input);
  }

  const payload: Partial<typeof adminUsers.$inferInsert> = {
    updatedAt: new Date(),
  };

  if (input.displayName) {
    payload.displayName = input.displayName;
  }

  if (input.role) {
    payload.role = input.role;
  }

  if (input.status) {
    payload.status = input.status;
  }

  const [row] = await getDb()
    .update(adminUsers)
    .set(payload)
    .where(eq(adminUsers.id, input.id))
    .returning();

  return row ?? null;
}

export async function touchAdminLastLogin(email: string) {
  if (!isDatabaseConfigured()) {
    return null;
  }

  if (isSupabaseConfigured()) {
    return touchAdminLastLoginInSupabase(email);
  }

  const [row] = await getDb()
    .update(adminUsers)
    .set({
      lastLoginAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(adminUsers.email, email.toLowerCase()))
    .returning();

  return row ?? null;
}

export async function upsertBootstrapAdmin(input: {
  email: string;
  displayName: string;
  role: "owner" | "admin";
}) {
  if (!isDatabaseConfigured()) {
    return null;
  }

  const existing = await getAdminUserByEmail(input.email);
  if (existing) {
    return existing;
  }

  return createAdminUser({
    email: input.email,
    displayName: input.displayName,
    role: input.role,
    status: "active",
  });
}

export async function listMcpClients() {
  if (!isDatabaseConfigured()) {
    return [];
  }

  if (isSupabaseConfigured()) {
    return listMcpClientsFromSupabase();
  }

  return getDb().select().from(mcpClients).orderBy(mcpClients.displayName);
}

export async function getMcpClientByClientId(oidcClientId: string) {
  if (!isDatabaseConfigured()) {
    return null;
  }

  if (isSupabaseConfigured()) {
    return getMcpClientByClientIdFromSupabase(oidcClientId);
  }

  const [client] = await getDb()
    .select()
    .from(mcpClients)
    .where(eq(mcpClients.oidcClientId, oidcClientId))
    .limit(1);

  return client ?? null;
}

export async function createMcpClient(input: {
  oidcClientId: string;
  displayName: string;
  allowedScope?: string;
  notes?: string | null;
  status?: "active" | "disabled";
}) {
  if (isSupabaseConfigured()) {
    return createMcpClientInSupabase(input);
  }

  const [row] = await getDb()
    .insert(mcpClients)
    .values({
      oidcClientId: input.oidcClientId,
      displayName: input.displayName,
      allowedScope: input.allowedScope ?? "mcp:read",
      notes: input.notes ?? null,
      status: input.status ?? "active",
    })
    .returning();

  return row;
}

export async function updateMcpClient(input: {
  id: string;
  displayName?: string;
  allowedScope?: string;
  notes?: string | null;
  status?: "active" | "disabled";
}) {
  if (isSupabaseConfigured()) {
    return updateMcpClientInSupabase(input);
  }

  const payload: Partial<typeof mcpClients.$inferInsert> = {
    updatedAt: new Date(),
  };

  if (input.displayName) {
    payload.displayName = input.displayName;
  }

  if (input.allowedScope) {
    payload.allowedScope = input.allowedScope;
  }

  if (input.notes !== undefined) {
    payload.notes = input.notes;
  }

  if (input.status) {
    payload.status = input.status;
  }

  const [row] = await getDb()
    .update(mcpClients)
    .set(payload)
    .where(eq(mcpClients.id, input.id))
    .returning();

  return row ?? null;
}

export async function listAuditLogs(filters?: {
  eventType?: string;
  outcome?: string;
  limit?: number;
}) {
  if (!isDatabaseConfigured()) {
    return [];
  }

  if (isSupabaseConfigured()) {
    return listAuditLogsFromSupabase(filters);
  }

  const predicates = [];
  if (filters?.eventType) {
    predicates.push(eq(authAuditLogs.eventType, filters.eventType));
  }

  if (filters?.outcome) {
    predicates.push(eq(authAuditLogs.outcome, filters.outcome));
  }

  const query = getDb().select().from(authAuditLogs);
  const constrained = predicates.length > 0 ? query.where(and(...predicates)) : query;

  return constrained
    .orderBy(desc(authAuditLogs.createdAt))
    .limit(Math.min(Math.max(filters?.limit ?? 50, 1), 200));
}

export async function createAuditLog(input: {
  eventType: string;
  subject?: string | null;
  email?: string | null;
  clientId?: string | null;
  route?: string | null;
  outcome: string;
  reason?: string | null;
  ipHash?: string | null;
  userAgent?: string | null;
}) {
  if (!isDatabaseConfigured()) {
    return null;
  }

  if (isSupabaseConfigured()) {
    return createAuditLogInSupabase(input);
  }

  const [row] = await getDb()
    .insert(authAuditLogs)
    .values({
      eventType: input.eventType,
      subject: input.subject ?? null,
      email: input.email ?? null,
      clientId: input.clientId ?? null,
      route: input.route ?? null,
      outcome: input.outcome,
      reason: input.reason ?? null,
      ipHash: input.ipHash ?? null,
      userAgent: input.userAgent ?? null,
    })
    .returning();

  return row;
}

export async function searchAdminUsers(query: string) {
  if (!isDatabaseConfigured()) {
    return [];
  }

  return getDb()
    .select()
    .from(adminUsers)
    .where(
      or(
        ilike(adminUsers.email, `%${query}%`),
        ilike(adminUsers.displayName, `%${query}%`),
      ),
    )
    .orderBy(adminUsers.email);
}

export async function listPersonalAccessTokens() {
  if (!isDatabaseConfigured()) {
    return [];
  }

  if (isSupabaseConfigured()) {
    return listPersonalAccessTokensFromSupabase();
  }

  return getDb()
    .select()
    .from(personalAccessTokens)
    .orderBy(desc(personalAccessTokens.createdAt));
}

export async function getPersonalAccessTokenByHash(tokenHash: string) {
  if (!isDatabaseConfigured()) {
    return null;
  }

  if (isSupabaseConfigured()) {
    return getPersonalAccessTokenByHashFromSupabase(tokenHash);
  }

  const [token] = await getDb()
    .select()
    .from(personalAccessTokens)
    .where(eq(personalAccessTokens.tokenHash, tokenHash))
    .limit(1);

  return token ?? null;
}

export async function createPersonalAccessToken(input: {
  label: string;
  ownerEmail: string;
  tokenValue: string;
  tokenPrefix: string;
  tokenHash: string;
  allowedScope?: string;
  notes?: string | null;
  expiresAt?: string | null;
}) {
  if (isSupabaseConfigured()) {
    return createPersonalAccessTokenInSupabase(input);
  }

  const [row] = await getDb()
    .insert(personalAccessTokens)
    .values({
      label: input.label,
      ownerEmail: input.ownerEmail.toLowerCase(),
      tokenValue: input.tokenValue,
      tokenPrefix: input.tokenPrefix,
      tokenHash: input.tokenHash,
      allowedScope: input.allowedScope ?? "mcp:read",
      notes: input.notes ?? null,
      expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
    })
    .returning();

  return row;
}

export async function updatePersonalAccessToken(input: {
  id: string;
  label?: string;
  ownerEmail?: string;
  allowedScope?: string;
  notes?: string | null;
  status?: "active" | "disabled";
  expiresAt?: string | null;
}) {
  if (isSupabaseConfigured()) {
    return updatePersonalAccessTokenInSupabase(input);
  }

  const payload: Partial<typeof personalAccessTokens.$inferInsert> = {
    updatedAt: new Date(),
  };

  if (input.label) {
    payload.label = input.label;
  }
  if (input.ownerEmail) {
    payload.ownerEmail = input.ownerEmail.toLowerCase();
  }
  if (input.allowedScope) {
    payload.allowedScope = input.allowedScope;
  }
  if (input.notes !== undefined) {
    payload.notes = input.notes;
  }
  if (input.status) {
    payload.status = input.status;
  }
  if (input.expiresAt !== undefined) {
    payload.expiresAt = input.expiresAt ? new Date(input.expiresAt) : null;
  }

  const [row] = await getDb()
    .update(personalAccessTokens)
    .set(payload)
    .where(eq(personalAccessTokens.id, input.id))
    .returning();

  return row ?? null;
}

export async function touchPersonalAccessToken(id: string) {
  if (!isDatabaseConfigured()) {
    return null;
  }

  if (isSupabaseConfigured()) {
    return touchPersonalAccessTokenInSupabase(id);
  }

  const [row] = await getDb()
    .update(personalAccessTokens)
    .set({
      lastUsedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(personalAccessTokens.id, id))
    .returning();

  return row ?? null;
}

export async function deletePersonalAccessToken(id: string) {
  if (!isDatabaseConfigured()) {
    return null;
  }

  if (isSupabaseConfigured()) {
    return deletePersonalAccessTokenInSupabase(id);
  }

  const [row] = await getDb()
    .delete(personalAccessTokens)
    .where(eq(personalAccessTokens.id, id))
    .returning();

  return row ?? null;
}
