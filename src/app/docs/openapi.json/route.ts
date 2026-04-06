import { getPublicEnv } from "@/lib/env";

export const runtime = "nodejs";

export async function GET() {
  const env = getPublicEnv();

  return Response.json({
    openapi: "3.1.0",
    info: {
      title: "BA Agents HTTP API",
      version: "0.1.0",
      description: "Public HTTP metadata and protected admin APIs for the BA Agents MCP service.",
    },
    servers: [
      {
        url: env.baseUrl,
      },
    ],
    paths: {
      "/.well-known/oauth-protected-resource": {
        get: {
          summary: "Protected resource metadata",
          responses: {
            "200": { description: "OAuth protected resource metadata" },
          },
        },
      },
      "/.well-known/oauth-authorization-server": {
        get: {
          summary: "Authorization server metadata",
          responses: {
            "200": { description: "OAuth authorization server metadata" },
          },
        },
      },
      "/server.json": {
        get: {
          summary: "MCP registry metadata",
          responses: {
            "200": { description: "MCP server metadata" },
          },
        },
      },
      "/api/auth/signin": {
        get: {
          summary: "Start OIDC sign-in",
          responses: {
            "302": { description: "Redirect to external OIDC provider" },
          },
        },
      },
      "/api/auth/callback/oidc": {
        get: {
          summary: "OIDC callback",
          responses: {
            "302": { description: "Redirect back to app after sign-in" },
          },
        },
      },
      "/api/auth/session": {
        get: {
          summary: "Current admin session",
          responses: {
            "200": { description: "Session payload" },
          },
        },
      },
      "/api/admin/admin-users": {
        get: {
          summary: "List admin users",
          responses: {
            "200": { description: "Admin users list" },
            "401": { description: "Unauthorized" },
          },
        },
        post: {
          summary: "Create admin user",
          responses: {
            "201": { description: "Admin user created" },
            "403": { description: "Owner role required" },
          },
        },
        patch: {
          summary: "Update admin user",
          responses: {
            "200": { description: "Admin user updated" },
            "403": { description: "Owner role required" },
          },
        },
      },
      "/api/admin/mcp-clients": {
        get: {
          summary: "List MCP clients",
          responses: {
            "200": { description: "MCP client list" },
          },
        },
        post: {
          summary: "Create MCP client",
          responses: {
            "201": { description: "MCP client created" },
          },
        },
        patch: {
          summary: "Update MCP client",
          responses: {
            "200": { description: "MCP client updated" },
          },
        },
      },
      "/api/admin/personal-access-tokens": {
        get: {
          summary: "List personal access tokens",
          responses: {
            "200": { description: "PAT list" },
          },
        },
        post: {
          summary: "Create personal access token",
          responses: {
            "201": { description: "PAT created" },
          },
        },
        patch: {
          summary: "Update or revoke personal access token",
          responses: {
            "200": { description: "PAT updated" },
          },
        },
      },
      "/api/admin/audit-logs": {
        get: {
          summary: "List auth audit logs",
          parameters: [
            {
              name: "eventType",
              in: "query",
              schema: { type: "string" },
            },
            {
              name: "outcome",
              in: "query",
              schema: { type: "string" },
            },
            {
              name: "limit",
              in: "query",
              schema: { type: "integer", minimum: 1, maximum: 200 },
            },
          ],
          responses: {
            "200": { description: "Audit log list" },
          },
        },
      },
    },
  });
}
