import { getPostgresUrl, getSupabaseServiceRoleKey, getSupabaseUrl } from "@/lib/env";

type RecordStatus = "active" | "disabled";
type AdminRole = "owner" | "admin";

export interface AdminUserRecord {
  id: string;
  email: string;
  displayName: string;
  role: AdminRole;
  status: RecordStatus;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface McpClientRecord {
  id: string;
  oidcClientId: string;
  displayName: string;
  status: RecordStatus;
  allowedScope: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthAuditLogRecord {
  id: string;
  eventType: string;
  subject: string | null;
  email: string | null;
  clientId: string | null;
  route: string | null;
  outcome: string;
  reason: string | null;
  ipHash: string | null;
  userAgent: string | null;
  createdAt: Date;
}

export interface PersonalAccessTokenRecord {
  id: string;
  label: string;
  ownerEmail: string;
  tokenValue: string | null;
  tokenPrefix: string;
  tokenHash: string;
  allowedScope: string;
  status: RecordStatus;
  notes: string | null;
  lastUsedAt: Date | null;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

type AdminUserRow = {
  id: string;
  email: string;
  display_name: string;
  role: AdminRole;
  status: RecordStatus;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
};

type McpClientRow = {
  id: string;
  oidc_client_id: string;
  display_name: string;
  status: RecordStatus;
  allowed_scope: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

type AuthAuditLogRow = {
  id: string;
  event_type: string;
  subject: string | null;
  email: string | null;
  client_id: string | null;
  route: string | null;
  outcome: string;
  reason: string | null;
  ip_hash: string | null;
  user_agent: string | null;
  created_at: string;
};

type PersonalAccessTokenRow = {
  id: string;
  label: string;
  owner_email: string;
  token_value: string | null;
  token_prefix: string;
  token_hash: string;
  allowed_scope: string;
  status: RecordStatus;
  notes: string | null;
  last_used_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
};

function mapAdminUser(row: AdminUserRow): AdminUserRecord {
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    role: row.role,
    status: row.status,
    lastLoginAt: row.last_login_at ? new Date(row.last_login_at) : null,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

function mapMcpClient(row: McpClientRow): McpClientRecord {
  return {
    id: row.id,
    oidcClientId: row.oidc_client_id,
    displayName: row.display_name,
    status: row.status,
    allowedScope: row.allowed_scope,
    notes: row.notes,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

function mapAuditLog(row: AuthAuditLogRow): AuthAuditLogRecord {
  return {
    id: row.id,
    eventType: row.event_type,
    subject: row.subject,
    email: row.email,
    clientId: row.client_id,
    route: row.route,
    outcome: row.outcome,
    reason: row.reason,
    ipHash: row.ip_hash,
    userAgent: row.user_agent,
    createdAt: new Date(row.created_at),
  };
}

function mapPersonalAccessToken(row: PersonalAccessTokenRow): PersonalAccessTokenRecord {
  return {
    id: row.id,
    label: row.label,
    ownerEmail: row.owner_email,
    tokenValue: row.token_value,
    tokenPrefix: row.token_prefix,
    tokenHash: row.token_hash,
    allowedScope: row.allowed_scope,
    status: row.status,
    notes: row.notes,
    lastUsedAt: row.last_used_at ? new Date(row.last_used_at) : null,
    expiresAt: row.expires_at ? new Date(row.expires_at) : null,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

function getRestBaseUrl(): string {
  const url = getSupabaseUrl();
  if (!url) {
    throw new Error("SUPABASE_URL is not configured.");
  }

  return `${url.replace(/\/+$/, "")}/rest/v1`;
}

function getRestHeaders(extra?: HeadersInit): Headers {
  const serviceRoleKey = getSupabaseServiceRoleKey();
  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured.");
  }

  const headers = new Headers(extra);
  headers.set("apikey", serviceRoleKey);
  headers.set("Authorization", `Bearer ${serviceRoleKey}`);

  return headers;
}

function isJsonObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function supabaseRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(`${getRestBaseUrl()}${path}`, {
    ...init,
    headers: getRestHeaders(init?.headers),
    cache: "no-store",
  });

  if (!response.ok) {
    const raw = await response.text();
    let detail = raw;

    try {
      const parsed = JSON.parse(raw) as unknown;
      if (isJsonObject(parsed)) {
        detail =
          typeof parsed.message === "string"
            ? parsed.message
            : typeof parsed.error === "string"
              ? parsed.error
              : raw;
      }
    } catch {
      // Use raw text fallback.
    }

    throw new Error(`Supabase REST ${response.status}: ${detail}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(getSupabaseUrl() && getSupabaseServiceRoleKey());
}

export function isAnyAdminStoreConfigured(): boolean {
  return isSupabaseConfigured() || Boolean(getPostgresUrl());
}

export async function listAdminUsersFromSupabase(): Promise<AdminUserRecord[]> {
  const rows = await supabaseRequest<AdminUserRow[]>(
    "/admin_users?select=*&order=email.asc",
  );

  return rows.map(mapAdminUser);
}

export async function getAdminUserByEmailFromSupabase(
  email: string,
): Promise<AdminUserRecord | null> {
  const params = new URLSearchParams({
    select: "*",
    email: `eq.${email.toLowerCase()}`,
    limit: "1",
  });

  const rows = await supabaseRequest<AdminUserRow[]>(
    `/admin_users?${params.toString()}`,
  );

  return rows[0] ? mapAdminUser(rows[0]) : null;
}

export async function createAdminUserInSupabase(input: {
  email: string;
  displayName: string;
  role: AdminRole;
  status?: RecordStatus;
}): Promise<AdminUserRecord> {
  const rows = await supabaseRequest<AdminUserRow[]>("/admin_users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify([
      {
        email: input.email.toLowerCase(),
        display_name: input.displayName,
        role: input.role,
        status: input.status ?? "active",
      },
    ]),
  });

  return mapAdminUser(rows[0]);
}

export async function updateAdminUserInSupabase(input: {
  id: string;
  displayName?: string;
  role?: AdminRole;
  status?: RecordStatus;
}): Promise<AdminUserRecord | null> {
  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (input.displayName) {
    payload.display_name = input.displayName;
  }

  if (input.role) {
    payload.role = input.role;
  }

  if (input.status) {
    payload.status = input.status;
  }

  const rows = await supabaseRequest<AdminUserRow[]>(
    `/admin_users?id=eq.${input.id}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(payload),
    },
  );

  return rows[0] ? mapAdminUser(rows[0]) : null;
}

export async function touchAdminLastLoginInSupabase(
  email: string,
): Promise<AdminUserRecord | null> {
  const rows = await supabaseRequest<AdminUserRow[]>(
    `/admin_users?email=eq.${encodeURIComponent(email.toLowerCase())}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        last_login_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }),
    },
  );

  return rows[0] ? mapAdminUser(rows[0]) : null;
}

export async function listMcpClientsFromSupabase(): Promise<McpClientRecord[]> {
  const rows = await supabaseRequest<McpClientRow[]>(
    "/mcp_clients?select=*&order=display_name.asc",
  );

  return rows.map(mapMcpClient);
}

export async function getMcpClientByClientIdFromSupabase(
  oidcClientId: string,
): Promise<McpClientRecord | null> {
  const params = new URLSearchParams({
    select: "*",
    oidc_client_id: `eq.${oidcClientId}`,
    limit: "1",
  });

  const rows = await supabaseRequest<McpClientRow[]>(
    `/mcp_clients?${params.toString()}`,
  );

  return rows[0] ? mapMcpClient(rows[0]) : null;
}

export async function createMcpClientInSupabase(input: {
  oidcClientId: string;
  displayName: string;
  allowedScope?: string;
  notes?: string | null;
  status?: RecordStatus;
}): Promise<McpClientRecord> {
  const rows = await supabaseRequest<McpClientRow[]>("/mcp_clients", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify([
      {
        oidc_client_id: input.oidcClientId,
        display_name: input.displayName,
        allowed_scope: input.allowedScope ?? "mcp:read",
        notes: input.notes ?? null,
        status: input.status ?? "active",
      },
    ]),
  });

  return mapMcpClient(rows[0]);
}

export async function updateMcpClientInSupabase(input: {
  id: string;
  displayName?: string;
  allowedScope?: string;
  notes?: string | null;
  status?: RecordStatus;
}): Promise<McpClientRecord | null> {
  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (input.displayName) {
    payload.display_name = input.displayName;
  }

  if (input.allowedScope) {
    payload.allowed_scope = input.allowedScope;
  }

  if (input.notes !== undefined) {
    payload.notes = input.notes;
  }

  if (input.status) {
    payload.status = input.status;
  }

  const rows = await supabaseRequest<McpClientRow[]>(
    `/mcp_clients?id=eq.${input.id}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(payload),
    },
  );

  return rows[0] ? mapMcpClient(rows[0]) : null;
}

export async function listAuditLogsFromSupabase(filters?: {
  eventType?: string;
  outcome?: string;
  limit?: number;
}): Promise<AuthAuditLogRecord[]> {
  const params = new URLSearchParams({
    select: "*",
    order: "created_at.desc",
    limit: String(Math.min(Math.max(filters?.limit ?? 50, 1), 200)),
  });

  if (filters?.eventType) {
    params.set("event_type", `eq.${filters.eventType}`);
  }

  if (filters?.outcome) {
    params.set("outcome", `eq.${filters.outcome}`);
  }

  const rows = await supabaseRequest<AuthAuditLogRow[]>(
    `/auth_audit_logs?${params.toString()}`,
  );

  return rows.map(mapAuditLog);
}

export async function createAuditLogInSupabase(input: {
  eventType: string;
  subject?: string | null;
  email?: string | null;
  clientId?: string | null;
  route?: string | null;
  outcome: string;
  reason?: string | null;
  ipHash?: string | null;
  userAgent?: string | null;
}): Promise<AuthAuditLogRecord | null> {
  const rows = await supabaseRequest<AuthAuditLogRow[]>("/auth_audit_logs", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify([
      {
        event_type: input.eventType,
        subject: input.subject ?? null,
        email: input.email ?? null,
        client_id: input.clientId ?? null,
        route: input.route ?? null,
        outcome: input.outcome,
        reason: input.reason ?? null,
        ip_hash: input.ipHash ?? null,
        user_agent: input.userAgent ?? null,
      },
    ]),
  });

  return rows[0] ? mapAuditLog(rows[0]) : null;
}

export async function listPersonalAccessTokensFromSupabase(): Promise<PersonalAccessTokenRecord[]> {
  const rows = await supabaseRequest<PersonalAccessTokenRow[]>(
    "/personal_access_tokens?select=*&order=created_at.desc",
  );

  return rows.map(mapPersonalAccessToken);
}

export async function getPersonalAccessTokenByHashFromSupabase(
  tokenHash: string,
): Promise<PersonalAccessTokenRecord | null> {
  const params = new URLSearchParams({
    select: "*",
    token_hash: `eq.${tokenHash}`,
    limit: "1",
  });

  const rows = await supabaseRequest<PersonalAccessTokenRow[]>(
    `/personal_access_tokens?${params.toString()}`,
  );

  return rows[0] ? mapPersonalAccessToken(rows[0]) : null;
}

export async function createPersonalAccessTokenInSupabase(input: {
  label: string;
  ownerEmail: string;
  tokenValue: string;
  tokenPrefix: string;
  tokenHash: string;
  allowedScope?: string;
  notes?: string | null;
  expiresAt?: string | null;
}): Promise<PersonalAccessTokenRecord> {
  const rows = await supabaseRequest<PersonalAccessTokenRow[]>(
    "/personal_access_tokens",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify([
        {
          label: input.label,
          owner_email: input.ownerEmail.toLowerCase(),
          token_value: input.tokenValue,
          token_prefix: input.tokenPrefix,
          token_hash: input.tokenHash,
          allowed_scope: input.allowedScope ?? "mcp:read",
          notes: input.notes ?? null,
          expires_at: input.expiresAt ?? null,
        },
      ]),
    },
  );

  return mapPersonalAccessToken(rows[0]);
}

export async function updatePersonalAccessTokenInSupabase(input: {
  id: string;
  label?: string;
  ownerEmail?: string;
  allowedScope?: string;
  notes?: string | null;
  status?: RecordStatus;
  expiresAt?: string | null;
}): Promise<PersonalAccessTokenRecord | null> {
  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (input.label) {
    payload.label = input.label;
  }

  if (input.ownerEmail) {
    payload.owner_email = input.ownerEmail.toLowerCase();
  }

  if (input.allowedScope) {
    payload.allowed_scope = input.allowedScope;
  }

  if (input.notes !== undefined) {
    payload.notes = input.notes;
  }

  if (input.status) {
    payload.status = input.status;
  }

  if (input.expiresAt !== undefined) {
    payload.expires_at = input.expiresAt;
  }

  const rows = await supabaseRequest<PersonalAccessTokenRow[]>(
    `/personal_access_tokens?id=eq.${input.id}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(payload),
    },
  );

  return rows[0] ? mapPersonalAccessToken(rows[0]) : null;
}

export async function deletePersonalAccessTokenInSupabase(
  id: string,
): Promise<PersonalAccessTokenRecord | null> {
  const rows = await supabaseRequest<PersonalAccessTokenRow[]>(
    `/personal_access_tokens?id=eq.${id}`,
    {
      method: "DELETE",
      headers: {
        Prefer: "return=representation",
      },
    },
  );

  return rows[0] ? mapPersonalAccessToken(rows[0]) : null;
}

export async function touchPersonalAccessTokenInSupabase(
  id: string,
): Promise<PersonalAccessTokenRecord | null> {
  const rows = await supabaseRequest<PersonalAccessTokenRow[]>(
    `/personal_access_tokens?id=eq.${id}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        last_used_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }),
    },
  );

  return rows[0] ? mapPersonalAccessToken(rows[0]) : null;
}
