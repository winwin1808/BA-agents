CREATE TABLE IF NOT EXISTS "personal_access_tokens" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "label" varchar(255) NOT NULL,
  "owner_email" varchar(320) NOT NULL,
  "token_value" text,
  "token_prefix" varchar(24) NOT NULL,
  "token_hash" varchar(128) NOT NULL,
  "allowed_scope" varchar(255) DEFAULT 'mcp:read' NOT NULL,
  "status" "record_status" DEFAULT 'active' NOT NULL,
  "notes" text,
  "last_used_at" timestamp with time zone,
  "expires_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "personal_access_tokens_token_hash_unique" UNIQUE("token_hash")
);
