CREATE TABLE "variations" (
	"name" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sale_items" ALTER COLUMN "variation_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "sale_items" ADD COLUMN "variation_name" text;