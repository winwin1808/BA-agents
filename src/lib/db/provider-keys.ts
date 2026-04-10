import { and, desc, eq } from "drizzle-orm";

import { getDb, isDatabaseConfigured } from "@/lib/db";
import { providerApiKeys } from "@/lib/db/schema";
import {
  createProviderApiKeyInSupabase,
  disableActiveProviderApiKeysInSupabase,
  getActiveProviderApiKeyFromSupabase,
  getLatestProviderApiKeyFromSupabase,
  isSupabaseConfigured,
} from "@/lib/supabase/admin-store";

export type ProviderApiKeyProvider = "openai";

export async function getActiveProviderApiKey(provider: ProviderApiKeyProvider) {
  if (!isDatabaseConfigured()) {
    return null;
  }

  if (isSupabaseConfigured()) {
    return getActiveProviderApiKeyFromSupabase(provider);
  }

  const [row] = await getDb()
    .select()
    .from(providerApiKeys)
    .where(
      and(
        eq(providerApiKeys.provider, provider),
        eq(providerApiKeys.status, "active"),
        eq(providerApiKeys.validationStatus, "valid"),
      ),
    )
    .orderBy(desc(providerApiKeys.createdAt))
    .limit(1);

  return row ?? null;
}

export async function getLatestProviderApiKey(provider: ProviderApiKeyProvider) {
  if (!isDatabaseConfigured()) {
    return null;
  }

  if (isSupabaseConfigured()) {
    return getLatestProviderApiKeyFromSupabase(provider);
  }

  const [row] = await getDb()
    .select()
    .from(providerApiKeys)
    .where(eq(providerApiKeys.provider, provider))
    .orderBy(desc(providerApiKeys.createdAt))
    .limit(1);

  return row ?? null;
}

export async function createProviderApiKey(input: {
  provider: ProviderApiKeyProvider;
  label: string;
  modelName: string;
  encryptedSecret: string;
  maskedPreview: string;
  status: "active" | "disabled";
  validationStatus: "valid" | "invalid";
  validationError?: string | null;
  lastValidatedAt?: string | null;
  createdByAdminUserId?: string | null;
  updatedByAdminUserId?: string | null;
  deactivatedAt?: string | null;
}) {
  if (isSupabaseConfigured()) {
    return createProviderApiKeyInSupabase(input);
  }

  const [row] = await getDb()
    .insert(providerApiKeys)
    .values({
      provider: input.provider,
      label: input.label,
      modelName: input.modelName,
      encryptedSecret: input.encryptedSecret,
      maskedPreview: input.maskedPreview,
      status: input.status,
      validationStatus: input.validationStatus,
      validationError: input.validationError ?? null,
      lastValidatedAt: input.lastValidatedAt ? new Date(input.lastValidatedAt) : null,
      createdByAdminUserId: input.createdByAdminUserId ?? null,
      updatedByAdminUserId: input.updatedByAdminUserId ?? null,
      deactivatedAt: input.deactivatedAt ? new Date(input.deactivatedAt) : null,
    })
    .returning();

  return row;
}

export async function disableActiveProviderApiKeys(input: {
  provider: ProviderApiKeyProvider;
  updatedByAdminUserId?: string | null;
}) {
  if (!isDatabaseConfigured()) {
    return;
  }

  if (isSupabaseConfigured()) {
    await disableActiveProviderApiKeysInSupabase(input);
    return;
  }

  await getDb()
    .update(providerApiKeys)
    .set({
      status: "disabled",
      deactivatedAt: new Date(),
      updatedAt: new Date(),
      updatedByAdminUserId: input.updatedByAdminUserId ?? null,
    })
    .where(
      and(
        eq(providerApiKeys.provider, input.provider),
        eq(providerApiKeys.status, "active"),
      ),
    );
}
