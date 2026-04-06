const DEFAULT_MCP_SCOPE = "mcp:read";
const DEFAULT_ADMIN_SCOPE = "admin:manage";
const DEFAULT_BASE_URL = "http://localhost:3000";

function readEnv(name: string): string | undefined {
  const value = process.env[name];
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function getBaseUrl(): string {
  return readEnv("APP_BASE_URL") ?? readEnv("NEXTAUTH_URL") ?? DEFAULT_BASE_URL;
}

export function getAuthSecret(): string | undefined {
  return readEnv("AUTH_SECRET") ?? readEnv("NEXTAUTH_SECRET");
}

export function getAuthIssuer(): string | undefined {
  return readEnv("AUTH_OIDC_ISSUER");
}

export function getAuthClientId(): string | undefined {
  return readEnv("AUTH_OIDC_CLIENT_ID");
}

export function getAuthClientSecret(): string | undefined {
  return readEnv("AUTH_OIDC_CLIENT_SECRET");
}

export function getAuthAudience(): string | undefined {
  return readEnv("AUTH_OIDC_AUDIENCE");
}

export function getMcpResourceAudience(): string | undefined {
  return readEnv("MCP_RESOURCE_AUDIENCE") ?? getAuthAudience();
}

export function getMcpScope(): string {
  return readEnv("MCP_SCOPE") ?? DEFAULT_MCP_SCOPE;
}

export function getAdminScope(): string {
  return readEnv("ADMIN_SCOPE") ?? DEFAULT_ADMIN_SCOPE;
}

export function getPostgresUrl(): string | undefined {
  return readEnv("POSTGRES_URL");
}

export function getBootstrapEmails(): string[] {
  return (readEnv("ADMIN_BOOTSTRAP_EMAILS") ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function getServerIdentity() {
  return {
    name: readEnv("MCP_SERVER_NAME") ?? "io.bsscommerce/ba-agents",
    title: readEnv("MCP_SERVER_TITLE") ?? "BA Agents MCP",
    description:
      readEnv("MCP_SERVER_DESCRIPTION") ??
      "Remote read-only MCP server for BSS BA and PM context.",
  };
}

export function getPublicEnv() {
  return {
    baseUrl: getBaseUrl(),
    mcpScope: getMcpScope(),
    adminScope: getAdminScope(),
    authIssuer: getAuthIssuer(),
    mcpAudience: getMcpResourceAudience(),
    server: getServerIdentity(),
  };
}
