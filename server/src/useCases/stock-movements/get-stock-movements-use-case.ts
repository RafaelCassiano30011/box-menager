import { StockMovement } from "@shared/schema";
import { StockMovementRepository } from "server/src/repositories/stock-movements-repository";

export class GetStockMovementsUseCase {
  constructor(private stockMovementRepository: StockMovementRepository) {}

  async execute(): Promise<StockMovement[]> {
    return this.stockMovementRepository.getStockMovements();
  }
}
