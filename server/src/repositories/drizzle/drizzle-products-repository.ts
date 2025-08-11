import { ProductRepository } from "../products-repository";
import { drizzle } from "../../lib/drizzle";
import { eq, sql } from "drizzle-orm";
import { products, Product, InsertProduct, variations } from "@shared/schema";

export class DrizzleProductRepository implements ProductRepository {
  async getProducts(): Promise<Product[]> {
    return await drizzle
      .select()
      .from(products)
      .orderBy(sql`LOWER(${products.name}) ASC`);
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

  async updateProductStock(props: { id: string; variationId: string; stock: number }): Promise<Product | undefined> {
    const product = await drizzle.select().from(products).where(eq(products.id, props.id));

    console.log(product);

    const result = await drizzle
      .update(products)
      .set({
        variations: product[0]?.variations?.map((item) => ({
          ...item,
          stock: item.id === props.variationId ? props.stock : item.stock,
        })),
      })
      .where(eq(products.id, props.id))
      .returning();
    return result[0];
  }

  async addProductVariations(props: { variations?: { name: string }[] }): Promise<void> {
    if (!props.variations || props.variations.length === 0) return;

    await drizzle
      .insert(variations)
      .values(props.variations)
      .onConflictDoNothing({ target: variations.name }) // evita duplicata pelo campo name
      .returning();
  }
}
