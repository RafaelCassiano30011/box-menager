import { StockMovementRepository } from "../stock-movements-repository";
import { drizzle } from "../../lib/drizzle";
import { eq, desc } from "drizzle-orm";
import { stockMovements, StockMovement, InsertStockMovement } from "@shared/schema";

export class DrizzleStockMovementsRepository implements StockMovementRepository {
  // Drizzle-specific methods can be added here

  async getStockMovements(): Promise<StockMovement[]> {
    return await drizzle.select().from(stockMovements).orderBy(desc(stockMovements.createdAt));
  }

  async createStockMovement(movement: InsertStockMovement): Promise<StockMovement> {
    const result = await drizzle.insert(stockMovements).values(movement).returning();

    return result[0];
  }

  async getProductStockHistory(productId: string): Promise<StockMovement[]> {
    return await drizzle
      .select()
      .from(stockMovements)
      .where(eq(stockMovements.productId, productId))
      .orderBy(desc(stockMovements.createdAt));
  }
}
