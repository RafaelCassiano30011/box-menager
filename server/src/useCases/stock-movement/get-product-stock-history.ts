import { StockMovement } from "@shared/schema";
import { StockMovementRepository } from "server/src/repositories/stock-movements-repository";

export class GetProductStockHistory {
  constructor(private stockMovementRepository: StockMovementRepository) {}

  async execute(productId: string): Promise<StockMovement[]> {
    const result = await this.stockMovementRepository.getProductStockHistory(productId);

    return result;
  }
}
