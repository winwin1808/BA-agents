import { getPublicEnv } from "@/lib/env";

export const runtime = "nodejs";

export async function GET() {
  const env = getPublicEnv();

  return Response.json({
    resource: `${env.baseUrl}/mcp`,
    authorization_servers: [env.baseUrl],
    bearer_methods_supported: ["header"],
    scopes_supported: [env.mcpScope],
    resource_documentation: `${env.baseUrl}/docs`,
  });
}
