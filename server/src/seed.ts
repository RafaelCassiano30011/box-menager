import { drizzle } from "./src/lib/drizzle";
import { products } from "@shared/schema";

const sampleProducts = [
  {
    name: "Smartphone XYZ Pro",
    description: "Smartphone Android com 128GB de armazenamento e câmera tripla de alta resolução.",
    price: "899.00",
    stock: 24,
    minStock: 10,
    category: "Eletrônicos",
  },
  {
    name: "Fone Bluetooth Elite",
    description: "Fone de ouvido wireless com cancelamento de ruído ativo e bateria de longa duração.",
    price: "199.00",
    stock: 3,
    minStock: 10,
    category: "Acessórios",
  },
  {
    name: "Notebook Pro Max",
    description: "Laptop profissional com processador i7, 16GB RAM e SSD 512GB para máxima performance.",
    price: "3299.00",
    stock: 12,
    minStock: 5,
    category: "Informática",
  },
  {
    name: "Mouse Gamer RGB",
    description: "Mouse óptico para jogos com iluminação RGB personalizável e 7 botões programáveis.",
    price: "89.90",
    stock: 15,
    minStock: 8,
    category: "Acessórios",
  },
  {
    name: "Teclado Mecânico Pro",
    description: "Teclado mecânico com switches Blue, layout ABNT2 e iluminação LED ajustável.",
    price: "299.00",
    stock: 8,
    minStock: 5,
    category: "Acessórios",
  },
];

async function seedDatabase() {
  try {
    console.log("🌱 Iniciando seed do banco de dados...");
    
    // Check if products already exist
    const existingProducts = await drizzle.select().from(products);
    
    if (existingProducts.length > 0) {
      console.log("ℹ️ Produtos já existem no banco. Pulando seed...");
      return;
    }
    
    // Insert sample products
    await drizzle.insert(products).values(sampleProducts);
    
    console.log(`✅ Seed concluído! ${sampleProducts.length} produtos inseridos.`);
  } catch (error) {
    console.error("❌ Erro durante o seed:", error);
    process.exit(1);
  }
}

// Run seed if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase();
}

export { seedDatabase };
