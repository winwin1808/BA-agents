import { z } from "zod";
import { NextResponse } from "next/server";

import { getRequestContext, logAuthEvent } from "@/lib/auth/audit";
import { generatePersonalAccessToken } from "@/lib/auth/personal-access-token";
import { requireAdminApiSession } from "@/lib/auth/admin";
import { isDatabaseConfigured } from "@/lib/db";
import {
  createPersonalAccessToken,
  deletePersonalAccessToken,
  listPersonalAccessTokens,
  updatePersonalAccessToken,
} from "@/lib/db/queries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const createSchema = z.object({
  label: z.string().min(1),
  ownerEmail: z.string().email(),
  allowedScope: z.string().min(1).default("mcp:read"),
  notes: z.string().optional().nullable(),
  expiresAt: z.string().datetime().optional().nullable(),
});

const updateSchema = z.object({
  id: z.string().uuid(),
  label: z.string().min(1).optional(),
  ownerEmail: z.string().email().optional(),
  allowedScope: z.string().min(1).optional(),
  notes: z.string().optional().nullable(),
  status: z.enum(["active", "disabled"]).optional(),
  expiresAt: z.string().datetime().optional().nullable(),
});

const deleteSchema = z.object({
  id: z.string().uuid(),
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

  const tokens = await listPersonalAccessTokens();
  return NextResponse.json({ tokens });
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

  const generated = generatePersonalAccessToken();
  const tokenRecord = await createPersonalAccessToken({
    ...parsed.data,
    tokenValue: generated.token,
    tokenPrefix: generated.tokenPrefix,
    tokenHash: generated.tokenHash,
  });

  await logAuthEvent({
    eventType: "pat_mutation",
    email: auth.adminUser.email,
    subject: `Created PAT ${tokenRecord.label} for ${tokenRecord.ownerEmail}`,
    outcome: "success",
    route: "/api/admin/personal-access-tokens",
    ...getRequestContext(request),
  });

  return NextResponse.json(
    {
      token: generated.token,
      record: tokenRecord,
    },
    { status: 201 },
  );
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

  const token = await updatePersonalAccessToken(parsed.data);
  if (!token) {
    return NextResponse.json({ error: "PAT not found." }, { status: 404 });
  }

  await logAuthEvent({
    eventType: "pat_mutation",
    email: auth.adminUser.email,
    subject: `Updated PAT ${token.label} for ${token.ownerEmail}`,
    outcome: "success",
    route: "/api/admin/personal-access-tokens",
    ...getRequestContext(request),
  });

  return NextResponse.json({ record: token });
}

export async function DELETE(request: Request) {
  const auth = await requireAdminApiSession();
  if (!auth.ok) {
    return auth.response;
  }

  if (!isDatabaseConfigured()) {
    return dbNotConfigured();
  }

  const parsed = deleteSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const token = await deletePersonalAccessToken(parsed.data.id);
  if (!token) {
    return NextResponse.json({ error: "PAT not found." }, { status: 404 });
  }

  await logAuthEvent({
    eventType: "pat_mutation",
    email: auth.adminUser.email,
    subject: `Removed PAT ${token.label} for ${token.ownerEmail}`,
    outcome: "success",
    route: "/api/admin/personal-access-tokens",
    ...getRequestContext(request),
  });

  return NextResponse.json({ record: token });
}
