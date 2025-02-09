CREATE TABLE IF NOT EXISTS "democheck_component" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"group_id" uuid NOT NULL,
	"org_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"url" varchar(255),
	"status" varchar(50) DEFAULT 'UNKNOWN' NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "democheck_group" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "democheck_incident" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"component_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"status" varchar(50),
	"occurred_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "democheck_organization" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "democheck_public_component" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"component_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "democheck_status_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"component_id" uuid NOT NULL,
	"status" varchar(50),
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "democheck_user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"fname" varchar(255),
	"lname" varchar(255),
	"email" varchar(255) NOT NULL,
	"clerk_id" varchar(255) NOT NULL,
	"role" varchar(50)
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "democheck_component" ADD CONSTRAINT "democheck_component_group_id_democheck_group_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."democheck_group"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "democheck_component" ADD CONSTRAINT "democheck_component_org_id_democheck_organization_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."democheck_organization"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "democheck_group" ADD CONSTRAINT "democheck_group_org_id_democheck_organization_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."democheck_organization"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "democheck_incident" ADD CONSTRAINT "democheck_incident_component_id_democheck_component_id_fk" FOREIGN KEY ("component_id") REFERENCES "public"."democheck_component"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "democheck_public_component" ADD CONSTRAINT "democheck_public_component_component_id_democheck_component_id_fk" FOREIGN KEY ("component_id") REFERENCES "public"."democheck_component"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "democheck_status_history" ADD CONSTRAINT "democheck_status_history_component_id_democheck_component_id_fk" FOREIGN KEY ("component_id") REFERENCES "public"."democheck_component"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "democheck_user" ADD CONSTRAINT "democheck_user_org_id_democheck_organization_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."democheck_organization"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
