import { createHash } from "node:crypto";

import { createAuditLog } from "@/lib/db/queries";

function hashValue(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  return createHash("sha256").update(value).digest("hex");
}

export function getRequestContext(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const userAgent = request.headers.get("user-agent");

  return {
    ipHash: hashValue(forwardedFor?.split(",")[0]?.trim() ?? null),
    userAgent,
  };
}

export async function logAuthEvent(
  input: Parameters<typeof createAuditLog>[0],
): Promise<void> {
  try {
    await createAuditLog(input);
  } catch (error) {
    console.error("Failed to write audit log:", error);
  }
}
