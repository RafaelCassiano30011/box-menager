import { Product, InsertProduct } from "@shared/schema";

export interface ProductRepository {
  getProducts(): Promise<Product[]>;

  getProduct(id: string): Promise<Product | undefined>;

  createProduct(product: InsertProduct): Promise<Product>;

  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined>;

  deleteProduct(id: string): Promise<boolean>;

  updateProductStock(id: string, stock: number): Promise<Product | undefined>;
}
