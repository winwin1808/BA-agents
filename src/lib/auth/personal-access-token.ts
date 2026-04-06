import { createHash, randomBytes } from "node:crypto";

const TOKEN_PREFIX = "bss_pat_";

export function hashPersonalAccessToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function generatePersonalAccessToken() {
  const secret = randomBytes(24).toString("base64url");
  const token = `${TOKEN_PREFIX}${secret}`;

  return {
    token,
    tokenPrefix: token.slice(0, 16),
    tokenHash: hashPersonalAccessToken(token),
  };
}

export function isPersonalAccessToken(token: string): boolean {
  return token.startsWith(TOKEN_PREFIX);
}
