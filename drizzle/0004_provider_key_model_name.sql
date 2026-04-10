ALTER TABLE "provider_api_keys"
ADD COLUMN IF NOT EXISTS "model_name" varchar(120) DEFAULT 'gpt-5.2' NOT NULL;