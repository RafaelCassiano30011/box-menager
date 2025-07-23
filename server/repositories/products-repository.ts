import { Product, InsertProduct } from "@shared/schema";

export interface ProductRepository {
  getProducts(): Promise<Product[]>;

  getProduct(id: number): Promise<Product | undefined>;

  createProduct(product: InsertProduct): Promise<Product>;

  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;

  deleteProduct(id: number): Promise<boolean>;

  updateProductStock(id: number, stock: number): Promise<Product | undefined>;
}
