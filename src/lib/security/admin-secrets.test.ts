import test from "node:test";
import assert from "node:assert/strict";

import {
  decryptAdminSecret,
  encryptAdminSecret,
  maskSecret,
} from "@/lib/security/admin-secrets";

test("maskSecret keeps prefix and suffix", () => {
  assert.equal(maskSecret("sk-test-1234567890"), "sk-t••••7890");
  assert.equal(maskSecret("short"), "••••");
});

test("admin secret encryption round-trips", () => {
  process.env.ADMIN_SECRETS_ENCRYPTION_KEY = "unit-test-master-key";

  const encrypted = encryptAdminSecret("sk-test-secret-value");
  const decrypted = decryptAdminSecret(encrypted);

  assert.notEqual(encrypted, "sk-test-secret-value");
  assert.equal(decrypted, "sk-test-secret-value");
});

test("admin secret encryption requires master key", () => {
  delete process.env.ADMIN_SECRETS_ENCRYPTION_KEY;

  assert.throws(
    () => encryptAdminSecret("sk-test-secret-value"),
    /ADMIN_SECRETS_ENCRYPTION_KEY is not configured/,
  );
});
