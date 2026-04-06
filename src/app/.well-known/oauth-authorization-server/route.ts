import { getExternalOidcMetadata } from "@/lib/auth/oidc";
import { getPublicEnv } from "@/lib/env";

export const runtime = "nodejs";

export async function GET() {
  try {
    const env = getPublicEnv();
    const oidc = await getExternalOidcMetadata();
    return Response.json({
      issuer: env.baseUrl,
      authorization_endpoint: oidc.authorization_endpoint,
      token_endpoint: oidc.token_endpoint,
      jwks_uri: oidc.jwks_uri,
      revocation_endpoint: oidc.revocation_endpoint,
      response_types_supported: oidc.response_types_supported ?? ["code"],
      grant_types_supported: oidc.grant_types_supported ?? [
        "authorization_code",
        "client_credentials",
        "refresh_token",
      ],
      token_endpoint_auth_methods_supported:
        oidc.token_endpoint_auth_methods_supported ?? ["client_secret_post", "client_secret_basic"],
      scopes_supported: Array.from(
        new Set([...(oidc.scopes_supported ?? []), "openid", "profile", "email", env.mcpScope, env.adminScope]),
      ),
    });
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Failed to load OIDC metadata",
      },
      { status: 500 },
    );
  }
}
