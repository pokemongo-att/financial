CREATE TYPE "public"."asset_tx_type" AS ENUM('BUY', 'SELL', 'DIVIDEND', 'FEE', 'DEPOSIT', 'WITHDRAW', 'OPENING');--> statement-breakpoint
CREATE TYPE "public"."asset_type" AS ENUM('STOCK', 'FUND', 'CRYPTO', 'BANK');--> statement-breakpoint
CREATE TYPE "public"."category" AS ENUM('INCOME', 'EXPENSE', 'SAVING', 'GOAL', 'FAMILY');--> statement-breakpoint
CREATE TYPE "public"."family_member_type" AS ENUM('PARENT', 'CHILD');--> statement-breakpoint
CREATE TYPE "public"."goal_tx_type" AS ENUM('DEPOSIT', 'WITHDRAW');--> statement-breakpoint
CREATE TYPE "public"."item_status" AS ENUM('PLANNED', 'DONE', 'SKIPPED');--> statement-breakpoint
CREATE TABLE "asset_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" "asset_type" NOT NULL,
	"symbol" varchar(50) NOT NULL,
	"name" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "asset_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"asset_account_id" uuid NOT NULL,
	"type" "asset_tx_type" NOT NULL,
	"quantity" integer,
	"price_per_unit_cents" integer,
	"amount_cents" integer NOT NULL,
	"date" date NOT NULL,
	"note" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "family_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" "family_member_type" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "family_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"family_member_id" uuid NOT NULL,
	"amount_cents" integer NOT NULL,
	"date" date NOT NULL,
	"note" text,
	"monthly_plan_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "goal_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"opening_balance_cents" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "goal_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"goal_account_id" uuid NOT NULL,
	"type" "goal_tx_type" NOT NULL,
	"amount_cents" integer NOT NULL,
	"date" date NOT NULL,
	"note" text,
	"linked_monthly_item_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "monthly_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"plan_id" uuid NOT NULL,
	"category" "category" NOT NULL,
	"name" varchar(255) NOT NULL,
	"planned_amount_cents" integer DEFAULT 0 NOT NULL,
	"actual_amount_cents" integer,
	"status" "item_status" DEFAULT 'PLANNED' NOT NULL,
	"done_at" timestamp,
	"note" text,
	"payment_method" varchar(100),
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "monthly_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"month" varchar(7) NOT NULL,
	"template_id" uuid,
	"starting_balance_cents" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "template_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"template_id" uuid NOT NULL,
	"category" "category" NOT NULL,
	"name" varchar(255) NOT NULL,
	"default_amount_cents" integer DEFAULT 0 NOT NULL,
	"account_or_sub_type" varchar(255),
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "asset_accounts" ADD CONSTRAINT "asset_accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asset_transactions" ADD CONSTRAINT "asset_transactions_asset_account_id_asset_accounts_id_fk" FOREIGN KEY ("asset_account_id") REFERENCES "public"."asset_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "family_members" ADD CONSTRAINT "family_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "family_transactions" ADD CONSTRAINT "family_transactions_family_member_id_family_members_id_fk" FOREIGN KEY ("family_member_id") REFERENCES "public"."family_members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "family_transactions" ADD CONSTRAINT "family_transactions_monthly_plan_id_monthly_plans_id_fk" FOREIGN KEY ("monthly_plan_id") REFERENCES "public"."monthly_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goal_accounts" ADD CONSTRAINT "goal_accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goal_transactions" ADD CONSTRAINT "goal_transactions_goal_account_id_goal_accounts_id_fk" FOREIGN KEY ("goal_account_id") REFERENCES "public"."goal_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goal_transactions" ADD CONSTRAINT "goal_transactions_linked_monthly_item_id_monthly_items_id_fk" FOREIGN KEY ("linked_monthly_item_id") REFERENCES "public"."monthly_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "monthly_items" ADD CONSTRAINT "monthly_items_plan_id_monthly_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."monthly_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "monthly_plans" ADD CONSTRAINT "monthly_plans_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "monthly_plans" ADD CONSTRAINT "monthly_plans_template_id_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "template_items" ADD CONSTRAINT "template_items_template_id_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."templates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "templates" ADD CONSTRAINT "templates_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_asset_tx_account_date" ON "asset_transactions" USING btree ("asset_account_id","date");--> statement-breakpoint
CREATE INDEX "idx_goal_tx_account_date" ON "goal_transactions" USING btree ("goal_account_id","date");--> statement-breakpoint
CREATE INDEX "idx_monthly_items_plan_id" ON "monthly_items" USING btree ("plan_id");