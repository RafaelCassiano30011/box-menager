import { ProductRepository } from "../products-repository";
import { drizzle } from "../../lib/drizzle";
import { eq, desc } from "drizzle-orm";
import { products, Product, InsertProduct } from "@shared/schema";

export class DrizzleProductRepository implements ProductRepository {
  async getProducts(): Promise<Product[]> {
    return await drizzle.select().from(products).orderBy(desc(products.createdAt));
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const result = await drizzle.select().from(products).where(eq(products.id, id));
    return result[0];
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const result = await drizzle.insert(products).values(product).returning();
    return result[0];
  }

  async updateProduct(props: { id: string; product: Partial<InsertProduct> }): Promise<Product | undefined> {
    const result = await drizzle.update(products).set(props.product).where(eq(products.id, props.id)).returning();
    return result[0];
  }

  async deleteProduct(id: string): Promise<boolean> {
    await drizzle.delete(products).where(eq(products.id, id));

    const product = await this.getProduct(id);

    return !product;
  }

  async updateProductStock(props: { id: string; stock: number }): Promise<Product | undefined> {
    const result = await drizzle
      .update(products)
      .set({ stock: props.stock })
      .where(eq(products.id, props.id))
      .returning();
    return result[0];
  }
}
