ALTER TABLE "products" ADD COLUMN "variations" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "sale_items" ADD COLUMN "variation_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "stock_movements" ADD COLUMN "variation_id" uuid NOT NULL;