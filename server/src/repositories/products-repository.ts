import { Product, InsertProduct } from "@shared/schema";

export interface ProductRepository {
  getProducts(): Promise<Product[]>;

  getProduct(id: string): Promise<Product | undefined>;

  createProduct(product: InsertProduct): Promise<Product>;

  updateProduct(props: { id: string; product: Partial<InsertProduct> }): Promise<Product | undefined>;

  deleteProduct(id: string): Promise<boolean>;

  updateProductStock(props: { id: string; variationId: string; stock: number }): Promise<Product | undefined>;

  addProductVariations(props: { variations?: { name: string }[] }): Promise<void>;
}
