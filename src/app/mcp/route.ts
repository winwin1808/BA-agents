import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";

import { verifyMcpAuth } from "@/lib/auth/mcp";
import { createMcpServer } from "@/lib/mcp/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function methodNotAllowed() {
  return new Response(
    JSON.stringify({
      error: "method_not_allowed",
      error_description: "Use POST /mcp for Streamable HTTP requests.",
    }),
    {
      status: 405,
      headers: {
        "Content-Type": "application/json",
        Allow: "POST",
      },
    },
  );
}

export async function POST(request: Request) {
  const auth = await verifyMcpAuth(request);
  if (!auth.ok) {
    return auth.response;
  }

  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });
  const server = createMcpServer();

  try {
    await server.connect(transport);
    return await transport.handleRequest(request, { authInfo: auth.authInfo });
  } catch (error) {
    console.error("MCP request failed:", error);
    return Response.json(
      {
        jsonrpc: "2.0",
        error: {
          code: -32603,
          message: error instanceof Error ? error.message : "Internal server error",
        },
        id: null,
      },
      { status: 500 },
    );
  } finally {
    await transport.close().catch(() => undefined);
    await server.close().catch(() => undefined);
  }
}

export async function GET() {
  return methodNotAllowed();
}

export async function DELETE() {
  return methodNotAllowed();
}

export async function PUT() {
  return methodNotAllowed();
}
