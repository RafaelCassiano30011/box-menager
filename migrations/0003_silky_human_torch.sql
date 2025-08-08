-- Primeiro, vamos adicionar a coluna variation_name que é opcional
ALTER TABLE "sale_items" ADD COLUMN "variation_name" text;
--> statement-breakpoint

-- Depois, vamos garantir que variation_id seja opcional (nullable)
ALTER TABLE "sale_items" ALTER COLUMN "variation_id" DROP NOT NULL;
--> statement-breakpoint

-- Criar tabela de variações para referência futura
CREATE TABLE IF NOT EXISTS "variations" (
	"name" text NOT NULL
);