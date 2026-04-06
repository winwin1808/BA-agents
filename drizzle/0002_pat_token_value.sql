ALTER TABLE "personal_access_tokens"
ADD COLUMN IF NOT EXISTS "token_value" text;
