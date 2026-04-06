import { z } from "zod";
import { NextResponse } from "next/server";

import { getRequestContext, logAuthEvent } from "@/lib/auth/audit";
import { requireAdminApiSession } from "@/lib/auth/admin";
import { isDatabaseConfigured } from "@/lib/db";
import { createAdminUser, listAdminUsers, updateAdminUser } from "@/lib/db/queries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const createSchema = z.object({
  email: z.string().email(),
  displayName: z.string().min(1),
  role: z.enum(["owner", "admin"]),
});

const updateSchema = z.object({
  id: z.string().uuid(),
  displayName: z.string().min(1).optional(),
  role: z.enum(["owner", "admin"]).optional(),
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

  const users = await listAdminUsers();
  return NextResponse.json({ users });
}

export async function POST(request: Request) {
  const auth = await requireAdminApiSession({ ownerOnly: true });
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

  const user = await createAdminUser(parsed.data);
  await logAuthEvent({
    eventType: "admin_user_mutation",
    email: auth.adminUser.email,
    subject: `Created admin ${user.email}`,
    outcome: "success",
    route: "/api/admin/admin-users",
    ...getRequestContext(request),
  });

  return NextResponse.json({ user }, { status: 201 });
}

export async function PATCH(request: Request) {
  const auth = await requireAdminApiSession({ ownerOnly: true });
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

  const user = await updateAdminUser(parsed.data);
  if (!user) {
    return NextResponse.json({ error: "Admin user not found." }, { status: 404 });
  }

  await logAuthEvent({
    eventType: "admin_user_mutation",
    email: auth.adminUser.email,
    subject: `Updated admin ${user.email}`,
    outcome: "success",
    route: "/api/admin/admin-users",
    ...getRequestContext(request),
  });

  return NextResponse.json({ user });
}
