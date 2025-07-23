import { ProductRepository } from "../products-repository";
import { drizzle } from "../../src/lib/drizzle";
import { eq, desc } from "drizzle-orm";
import { products, Product, InsertProduct } from "@shared/schema";

export class DrizzleProductRepository implements ProductRepository {
  async getProducts(): Promise<Product[]> {
    return await drizzle.select().from(products).orderBy(desc(products.createdAt));
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const result = await drizzle.select().from(products).where(eq(products.id, id));
    return result[0];
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const result = await drizzle.insert(products).values(product).returning();
    return result[0];
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const result = await drizzle.update(products).set(product).where(eq(products.id, id)).returning();
    return result[0];
  }

  async deleteProduct(id: number): Promise<boolean> {
    await drizzle.delete(products).where(eq(products.id, id));

    const product = await this.getProduct(id);

    return !product;
  }

  async updateProductStock(id: number, stock: number): Promise<Product | undefined> {
    const result = await drizzle.update(products).set({ stock: stock }).where(eq(products.id, id)).returning();
    return result[0];
  }
}
