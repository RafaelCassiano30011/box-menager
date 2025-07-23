ALTER TABLE "products" ALTER COLUMN "image" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "image" SET NOT NULL;