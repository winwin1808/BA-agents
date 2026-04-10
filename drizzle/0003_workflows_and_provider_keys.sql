DO $$ BEGIN
 CREATE TYPE "public"."workflow_context_scope" AS ENUM('lock', 'quote', 'solution', 'cross_suite');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."workflow_generation_outcome" AS ENUM('success', 'error', 'rate_limited', 'unavailable', 'invalid_input');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."provider_api_key_provider" AS ENUM('openai');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."provider_api_key_validation_status" AS ENUM('valid', 'invalid');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "provider_api_keys" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "provider" "provider_api_key_provider" DEFAULT 'openai' NOT NULL,
  "label" varchar(255) NOT NULL,
  "encrypted_secret" text NOT NULL,
  "masked_preview" varchar(32) NOT NULL,
  "status" "record_status" DEFAULT 'active' NOT NULL,
  "validation_status" "provider_api_key_validation_status" DEFAULT 'valid' NOT NULL,
  "validation_error" text,
  "last_validated_at" timestamp with time zone,
  "created_by_admin_user_id" uuid,
  "updated_by_admin_user_id" uuid,
  "deactivated_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "workflow_artifacts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "slug" varchar(255) NOT NULL,
  "title" varchar(255) NOT NULL,
  "summary" text NOT NULL,
  "context_scope" "workflow_context_scope" NOT NULL,
  "prompt" text NOT NULL,
  "context_snapshot" jsonb NOT NULL,
  "flow_graph_json" jsonb NOT NULL,
  "jira_pack_json" jsonb NOT NULL,
  "bpmn_xml" text NOT NULL,
  "model_name" varchar(120) NOT NULL,
  "latency_ms" integer NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "workflow_artifacts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "workflow_generation_attempts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "ip_hash" varchar(128) NOT NULL,
  "prompt_chars" integer NOT NULL,
  "context_scope" "workflow_context_scope" NOT NULL,
  "outcome" "workflow_generation_outcome" NOT NULL,
  "error_code" varchar(64),
  "artifact_id" uuid,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "workflow_generation_attempts_ip_hash_created_at_idx"
ON "workflow_generation_attempts" ("ip_hash", "created_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "provider_api_keys_provider_created_at_idx"
ON "provider_api_keys" ("provider", "created_at");
