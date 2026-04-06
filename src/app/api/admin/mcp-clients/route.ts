import { z } from "zod";
import { NextResponse } from "next/server";

import { getRequestContext, logAuthEvent } from "@/lib/auth/audit";
import { requireAdminApiSession } from "@/lib/auth/admin";
import { isDatabaseConfigured } from "@/lib/db";
import { createMcpClient, listMcpClients, updateMcpClient } from "@/lib/db/queries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const createSchema = z.object({
  oidcClientId: z.string().min(1),
  displayName: z.string().min(1),
  allowedScope: z.string().min(1).default("mcp:read"),
  notes: z.string().optional().nullable(),
});

const updateSchema = z.object({
  id: z.string().uuid(),
  displayName: z.string().min(1).optional(),
  allowedScope: z.string().min(1).optional(),
  notes: z.string().optional().nullable(),
  status: z.enum(["active", "disabled"]).optional(),
});

function dbNotConfigured() {
  return NextResponse.json(
    {
      error:
        "Admin data store is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY, or POSTGRES_URL.",
    },
    { status: 500 },
  );
}

export async function GET() {
  const auth = await requireAdminApiSession();
  if (!auth.ok) {
    return auth.response;
  }

  if (!isDatabaseConfigured()) {
    return dbNotConfigured();
  }

  const clients = await listMcpClients();
  return NextResponse.json({ clients });
}

export async function POST(request: Request) {
  const auth = await requireAdminApiSession();
  if (!auth.ok) {
    return auth.response;
  }

  if (!isDatabaseConfigured()) {
    return dbNotConfigured();
  }

  const parsed = createSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const client = await createMcpClient(parsed.data);
  await logAuthEvent({
    eventType: "mcp_client_mutation",
    email: auth.adminUser.email,
    subject: `Created MCP client ${client.oidcClientId}`,
    outcome: "success",
    route: "/api/admin/mcp-clients",
    ...getRequestContext(request),
  });

  return NextResponse.json({ client }, { status: 201 });
}

export async function PATCH(request: Request) {
  const auth = await requireAdminApiSession();
  if (!auth.ok) {
    return auth.response;
  }

  if (!isDatabaseConfigured()) {
    return dbNotConfigured();
  }

  const parsed = updateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const client = await updateMcpClient(parsed.data);
  if (!client) {
    return NextResponse.json({ error: "MCP client not found." }, { status: 404 });
  }

  await logAuthEvent({
    eventType: "mcp_client_mutation",
    email: auth.adminUser.email,
    subject: `Updated MCP client ${client.oidcClientId}`,
    outcome: "success",
    route: "/api/admin/mcp-clients",
    ...getRequestContext(request),
  });

  return NextResponse.json({ client });
}
