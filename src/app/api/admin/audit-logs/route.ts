import { NextRequest, NextResponse } from "next/server";

import { requireAdminApiSession } from "@/lib/auth/admin";
import { isDatabaseConfigured } from "@/lib/db";
import { listAuditLogs } from "@/lib/db/queries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await requireAdminApiSession();
  if (!auth.ok) {
    return auth.response;
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      {
        error:
          "Admin data store is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY, or POSTGRES_URL.",
      },
      { status: 500 },
    );
  }

  const logs = await listAuditLogs({
    eventType: request.nextUrl.searchParams.get("eventType") ?? undefined,
    outcome: request.nextUrl.searchParams.get("outcome") ?? undefined,
    limit: request.nextUrl.searchParams.get("limit")
      ? Number(request.nextUrl.searchParams.get("limit"))
      : undefined,
  });

  return NextResponse.json({ logs });
}
