CREATE TABLE "home_loans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"principal_balance_cents" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "insurances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"coverage_amount_cents" integer NOT NULL,
	"start_date" date NOT NULL,
	"maturity_date" date NOT NULL,
	"premium_amount_cents" integer NOT NULL,
	"premium_until_year" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "monthly_items" ADD COLUMN "slug" varchar(100);--> statement-breakpoint
ALTER TABLE "monthly_items" ADD COLUMN "interest_rate" varchar(10);--> statement-breakpoint
ALTER TABLE "template_items" ADD COLUMN "slug" varchar(100);--> statement-breakpoint
ALTER TABLE "template_items" ADD COLUMN "interest_rate" varchar(10);--> statement-breakpoint
ALTER TABLE "home_loans" ADD CONSTRAINT "home_loans_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "insurances" ADD CONSTRAINT "insurances_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;