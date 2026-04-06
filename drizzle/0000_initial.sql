DO $$ BEGIN
 CREATE TYPE "public"."admin_role" AS ENUM('owner', 'admin');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."record_status" AS ENUM('active', 'disabled');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "admin_users" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "email" varchar(320) NOT NULL,
  "display_name" varchar(255) NOT NULL,
  "role" "admin_role" DEFAULT 'admin' NOT NULL,
  "status" "record_status" DEFAULT 'active' NOT NULL,
  "last_login_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "admin_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "mcp_clients" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "oidc_client_id" varchar(255) NOT NULL,
  "display_name" varchar(255) NOT NULL,
  "status" "record_status" DEFAULT 'active' NOT NULL,
  "allowed_scope" varchar(255) DEFAULT 'mcp:read' NOT NULL,
  "notes" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "mcp_clients_oidc_client_id_unique" UNIQUE("oidc_client_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "auth_audit_logs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "event_type" varchar(100) NOT NULL,
  "subject" text,
  "email" varchar(320),
  "client_id" varchar(255),
  "route" varchar(255),
  "outcome" varchar(50) NOT NULL,
  "reason" text,
  "ip_hash" varchar(128),
  "user_agent" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
