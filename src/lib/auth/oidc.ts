import { getAuthIssuer } from "@/lib/env";

interface OidcMetadata {
  issuer: string;
  authorization_endpoint: string;
  token_endpoint: string;
  jwks_uri: string;
  revocation_endpoint?: string;
  scopes_supported?: string[];
  response_types_supported?: string[];
  grant_types_supported?: string[];
  token_endpoint_auth_methods_supported?: string[];
}

let oidcMetadataPromise: Promise<OidcMetadata> | null = null;

export function normalizeIssuer(issuer: string): string {
  return issuer.replace(/\/+$/, "");
}

export async function getExternalOidcMetadata(): Promise<OidcMetadata> {
  const issuer = getAuthIssuer();
  if (!issuer) {
    throw new Error("AUTH_OIDC_ISSUER is not configured.");
  }

  if (!oidcMetadataPromise) {
    const normalized = normalizeIssuer(issuer);
    oidcMetadataPromise = fetch(`${normalized}/.well-known/openid-configuration`, {
      cache: "force-cache",
    }).then(async (response) => {
      if (!response.ok) {
        throw new Error(
          `Failed to load OIDC metadata: ${response.status} ${response.statusText}`,
        );
      }

      return (await response.json()) as OidcMetadata;
    });
  }

  return oidcMetadataPromise;
}
