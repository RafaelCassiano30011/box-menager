import { StockMovement, InsertStockMovement } from "@shared/schema";

export interface StockMovementRepository {
  getStockMovements(): Promise<StockMovement[]>;

  createStockMovement(movement: InsertStockMovement): Promise<StockMovement>;

  getProductStockHistory(productId: number): Promise<StockMovement[]>;
}
