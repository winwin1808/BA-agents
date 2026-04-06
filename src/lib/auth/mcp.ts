import { createRemoteJWKSet, jwtVerify } from "jose";
import type { AuthInfo } from "@modelcontextprotocol/sdk/server/auth/types.js";

import { getRequestContext, logAuthEvent } from "@/lib/auth/audit";
import { getExternalOidcMetadata, normalizeIssuer } from "@/lib/auth/oidc";
import {
  hashPersonalAccessToken,
  isPersonalAccessToken,
} from "@/lib/auth/personal-access-token";
import { getMcpResourceAudience, getMcpScope, getPublicEnv } from "@/lib/env";
import {
  getMcpClientByClientId,
  getPersonalAccessTokenByHash,
  touchPersonalAccessToken,
} from "@/lib/db/queries";

let jwksCache: ReturnType<typeof createRemoteJWKSet> | null = null;

function parseBearerToken(request: Request): string | null {
  const header = request.headers.get("authorization");
  if (!header) {
    return null;
  }

  const [type, token] = header.split(" ");
  if (!type || type.toLowerCase() !== "bearer" || !token) {
    return null;
  }

  return token.trim();
}

function parseScopes(scopeClaim: unknown): string[] {
  if (typeof scopeClaim === "string") {
    return scopeClaim.split(/\s+/).filter(Boolean);
  }

  if (Array.isArray(scopeClaim)) {
    return scopeClaim.flatMap((part) =>
      typeof part === "string" ? part.split(/\s+/).filter(Boolean) : [],
    );
  }

  return [];
}

function buildAuthenticateHeader(error: string, description: string): string {
  const { baseUrl, mcpScope } = getPublicEnv();

  return [
    `Bearer realm="ba-agents-mcp"`,
    `resource_metadata="${baseUrl}/.well-known/oauth-protected-resource"`,
    `scope="${mcpScope}"`,
    `error="${error}"`,
    `error_description="${description.replace(/"/g, "'")}"`,
  ].join(", ");
}

function unauthorized(error: string, description: string) {
  return new Response(
    JSON.stringify({
      error,
      error_description: description,
    }),
    {
      status: 401,
      headers: {
        "Content-Type": "application/json",
        "WWW-Authenticate": buildAuthenticateHeader(error, description),
      },
    },
  );
}

export async function verifyMcpAuth(request: Request): Promise<
  | { ok: true; authInfo: AuthInfo }
  | { ok: false; response: Response }
> {
  const token = parseBearerToken(request);
  const requestContext = getRequestContext(request);
  if (!token) {
    await logAuthEvent({
      eventType: "mcp_access",
      route: "/mcp",
      outcome: "denied",
      reason: "Missing bearer token",
      ...requestContext,
    });
    return { ok: false, response: unauthorized("invalid_token", "Missing bearer token.") };
  }

  if (isPersonalAccessToken(token)) {
    const tokenHash = hashPersonalAccessToken(token);
    const pat = await getPersonalAccessTokenByHash(tokenHash);
    const requiredScope = getMcpScope();

    if (!pat || pat.status !== "active") {
      await logAuthEvent({
        eventType: "mcp_access",
        route: "/mcp",
        outcome: "denied",
        reason: pat ? "PAT disabled" : "PAT not found",
        email: pat?.ownerEmail ?? null,
        clientId: pat?.tokenPrefix ?? null,
        ...requestContext,
      });
      return {
        ok: false,
        response: unauthorized("invalid_token", "Personal access token is invalid or disabled."),
      };
    }

    if (pat.expiresAt && pat.expiresAt.getTime() <= Date.now()) {
      await logAuthEvent({
        eventType: "mcp_access",
        route: "/mcp",
        outcome: "denied",
        reason: "PAT expired",
        email: pat.ownerEmail,
        clientId: pat.tokenPrefix,
        ...requestContext,
      });
      return {
        ok: false,
        response: unauthorized("invalid_token", "Personal access token has expired."),
      };
    }

    const scopes = pat.allowedScope.split(/\s+/).filter(Boolean);
    if (!scopes.includes(requiredScope)) {
      await logAuthEvent({
        eventType: "mcp_access",
        route: "/mcp",
        outcome: "denied",
        reason: `PAT missing required scope ${requiredScope}`,
        email: pat.ownerEmail,
        clientId: pat.tokenPrefix,
        ...requestContext,
      });
      return {
        ok: false,
        response: unauthorized("insufficient_scope", `Token must include ${requiredScope}.`),
      };
    }

    await touchPersonalAccessToken(pat.id);
    await logAuthEvent({
      eventType: "mcp_access",
      route: "/mcp",
      outcome: "success",
      reason: "PAT auth",
      email: pat.ownerEmail,
      clientId: pat.tokenPrefix,
      ...requestContext,
    });

    return {
      ok: true,
      authInfo: {
        token,
        clientId: pat.tokenPrefix,
        scopes,
        resource: new URL(`${getPublicEnv().baseUrl}/mcp`),
        extra: {
          auth_type: "pat",
          owner_email: pat.ownerEmail,
          token_label: pat.label,
        },
      },
    };
  }

  try {
    const oidcMetadata = await getExternalOidcMetadata();
    const issuer = normalizeIssuer(oidcMetadata.issuer);
    const audience = getMcpResourceAudience();

    if (!audience) {
      return {
        ok: false,
        response: new Response(
          JSON.stringify({ error: "server_error", error_description: "MCP audience is not configured." }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          },
        ),
      };
    }

    if (!jwksCache) {
      jwksCache = createRemoteJWKSet(new URL(oidcMetadata.jwks_uri));
    }

    const { payload } = await jwtVerify(token, jwksCache, {
      issuer,
      audience,
    });
    const payloadRecord = payload as Record<string, unknown>;

    const scopes = parseScopes(payload.scope ?? payloadRecord.scp);
    const requiredScope = getMcpScope();
    if (!scopes.includes(requiredScope)) {
      await logAuthEvent({
        eventType: "mcp_access",
        route: "/mcp",
        outcome: "denied",
        reason: `Required scope ${requiredScope} missing`,
        clientId:
          (payloadRecord.azp as string | undefined) ??
          (payloadRecord.client_id as string | undefined) ??
          null,
        email: (payloadRecord.email as string | undefined) ?? null,
        subject: (payload.sub as string | undefined) ?? null,
        ...requestContext,
      });
      return {
        ok: false,
        response: unauthorized("insufficient_scope", `Token must include ${requiredScope}.`),
      };
    }

    const clientId =
      (payloadRecord.azp as string | undefined) ??
      (payloadRecord.client_id as string | undefined) ??
      null;

    if (!clientId) {
      return {
        ok: false,
        response: unauthorized("invalid_token", "Token is missing azp/client_id."),
      };
    }

    const client = await getMcpClientByClientId(clientId);
    if (!client || client.status !== "active") {
      await logAuthEvent({
        eventType: "mcp_access",
        route: "/mcp",
        outcome: "denied",
        reason: client ? "MCP client disabled" : "MCP client not allowlisted",
        clientId,
        email: (payloadRecord.email as string | undefined) ?? null,
        subject: (payload.sub as string | undefined) ?? null,
        ...requestContext,
      });
      return {
        ok: false,
        response: unauthorized("invalid_token", "Client is not allowlisted for MCP access."),
      };
    }

    await logAuthEvent({
      eventType: "mcp_access",
      route: "/mcp",
      outcome: "success",
      clientId,
      email: (payloadRecord.email as string | undefined) ?? null,
      subject: (payload.sub as string | undefined) ?? null,
      ...requestContext,
    });

    return {
      ok: true,
      authInfo: {
        token,
        clientId,
        scopes,
        resource: new URL(`${getPublicEnv().baseUrl}/mcp`),
        expiresAt:
          typeof payload.exp === "number" ? payload.exp * 1000 : undefined,
        extra: {
          sub: payload.sub,
          email: payloadRecord.email,
        },
      },
    };
  } catch (error) {
    const reason = error instanceof Error ? error.message : "Token verification failed";
    await logAuthEvent({
      eventType: "mcp_access",
      route: "/mcp",
      outcome: "denied",
      reason,
      ...requestContext,
    });
    return {
      ok: false,
      response: unauthorized("invalid_token", reason),
    };
  }
}
