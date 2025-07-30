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

    console.log(salesWithItems[0].items);

    return salesWithItems;
  }

  async getSale(id: string): Promise<SaleWithItems | undefined> {
    const saleData = await drizzle.select().from(sales).where(eq(sales.id, id));
    if (!saleData[0]) return undefined;

    const items = await drizzle.select().from(saleItems).where(eq(saleItems.saleId, id));

    return {
      ...saleData[0],
      items,
    };
  }

  async createSale({
    sale,
    items,
  }: {
    sale: InsertSale;
    items: Omit<InsertSaleItem, "saleId">[];
  }): Promise<SaleWithItems> {
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
      }

      return {
        ...saleResult,
        items: saleItemsResults,
      };
    });
  }
}
