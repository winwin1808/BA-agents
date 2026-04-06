import { getAppMeta } from "@/lib/app-meta";
import { getPublicEnv } from "@/lib/env";

export const runtime = "nodejs";

export async function GET() {
  const meta = getAppMeta();
  const env = getPublicEnv();

  return Response.json({
    name: meta.name,
    title: meta.title,
    description: meta.description,
    version: meta.version,
    transport: {
      type: "streamable-http",
      url: `${env.baseUrl}/mcp`,
    },
    authentication: {
      type: "oauth2",
      authorization_server_metadata: `${env.baseUrl}/.well-known/oauth-authorization-server`,
      protected_resource_metadata: `${env.baseUrl}/.well-known/oauth-protected-resource`,
      scopes: [env.mcpScope],
    },
    documentation: `${env.baseUrl}/docs`,
  });
}
