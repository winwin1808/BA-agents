import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

import { getAuthOptions } from "@/lib/auth/options";
import { getAdminUserByEmail } from "@/lib/db/queries";

export async function getAdminSession() {
  const session = await getServerSession(getAuthOptions());
  if (!session?.user?.email) {
    return null;
  }

  const adminUser = await getAdminUserByEmail(session.user.email);
  if (!adminUser || adminUser.status !== "active") {
    return null;
  }

  return {
    session,
    adminUser,
  };
}

export async function requireAdminPageSession(pathname = "/admin") {
  const adminSession = await getAdminSession();
  if (!adminSession) {
    redirect(`/api/auth/signin?callbackUrl=${encodeURIComponent(pathname)}`);
  }

  return adminSession;
}

export async function requireAdminApiSession(options?: { ownerOnly?: boolean }) {
  const adminSession = await getAdminSession();
  if (!adminSession) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  if (options?.ownerOnly && adminSession.adminUser.role !== "owner") {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return {
    ok: true as const,
    ...adminSession,
  };
}
