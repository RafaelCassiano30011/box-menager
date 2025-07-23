import { SalesRepository } from "../sales-repository";
import { drizzle } from "../../lib/drizzle";
import { eq, desc } from "drizzle-orm";
import { sales, saleItems, SaleWithItems, SaleItem, InsertSale, InsertSaleItem } from "@shared/schema";

export class DrizzleSalesRepository implements SalesRepository {
  // Drizzle-specific methods can be added here

  async getSales(): Promise<SaleWithItems[]> {
    const salesData = await drizzle.select().from(sales).orderBy(desc(sales.createdAt));

    const salesWithItems: SaleWithItems[] = [];
    for (const sale of salesData) {
      const items = await drizzle.select().from(saleItems).where(eq(saleItems.saleId, sale.id));
      salesWithItems.push({
        ...sale,
        items,
      });
    }

    return salesWithItems;
  }

  async getSale(id: number): Promise<SaleWithItems | undefined> {
    const saleData = await drizzle.select().from(sales).where(eq(sales.id, id));
    if (!saleData[0]) return undefined;

    const items = await drizzle.select().from(saleItems).where(eq(saleItems.saleId, id));

    return {
      ...saleData[0],
      items,
    };
  }

  async createSale(sale: InsertSale, items: InsertSaleItem[]): Promise<SaleWithItems> {
    return await drizzle.transaction(async (tx) => {
      // Create sale
      const [saleResult] = await tx.insert(sales).values(sale).returning();

      // Create sale items and update stock
      const saleItemsResults: SaleItem[] = [];
      for (const item of items) {
        // Create sale item
        const [saleItemResult] = await tx
          .insert(saleItems)
          .values({ ...item, saleId: saleResult.id })
          .returning();
        saleItemsResults.push(saleItemResult);

        // Get current product stock
        // TODO USECASE
        //const [product] = await tx.select().from(products).where(eq(products.id, item.productId));

        //if (product) {
        //  const previousStock = product.stock;
        //  const newStock = previousStock - item.quantity;

        //  // Update product stock
        //  await tx.update(products).set({ stock: newStock }).where(eq(products.id, item.productId));

        //  // Create stock movement
        //  await tx.insert(stockMovements).values({
        //    productId: item.productId,
        //    type: "out",
        //    quantity: item.quantity,
        //    previousStock,
        //    newStock,
        //    reason: "Venda",
        //  });
        //}
      }

      return {
        ...saleResult,
        items: saleItemsResults,
      };
    });
  }
}
