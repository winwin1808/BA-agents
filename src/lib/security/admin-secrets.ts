import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

import { getAdminSecretsEncryptionKey } from "@/lib/env";

const ALGORITHM = "aes-256-gcm";
const IV_BYTES = 12;
const VERSION = "v1";

function getDerivedKey() {
  const secret = getAdminSecretsEncryptionKey();
  if (!secret) {
    throw new Error("ADMIN_SECRETS_ENCRYPTION_KEY is not configured.");
  }

  return createHash("sha256").update(secret, "utf8").digest();
}

export function maskSecret(secret: string) {
  const trimmed = secret.trim();
  if (trimmed.length <= 8) {
    return "••••";
  }

  return `${trimmed.slice(0, 4)}••••${trimmed.slice(-4)}`;
}

export function encryptAdminSecret(secret: string) {
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGORITHM, getDerivedKey(), iv);
  const encrypted = Buffer.concat([cipher.update(secret, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return [
    VERSION,
    iv.toString("base64url"),
    authTag.toString("base64url"),
    encrypted.toString("base64url"),
  ].join(".");
}

export function decryptAdminSecret(payload: string) {
  const [version, iv, authTag, encrypted] = payload.split(".");
  if (version !== VERSION || !iv || !authTag || !encrypted) {
    throw new Error("Encrypted secret payload is invalid.");
  }

  const decipher = createDecipheriv(
    ALGORITHM,
    getDerivedKey(),
    Buffer.from(iv, "base64url"),
  );
  decipher.setAuthTag(Buffer.from(authTag, "base64url"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encrypted, "base64url")),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}
