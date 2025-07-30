import { StockMovement } from "@shared/schema";
import { ProductRepository } from "server/src/repositories/products-repository";
import { StockMovementRepository } from "server/src/repositories/stock-movements-repository";

interface CreateStockMovementUseCaseProps {
  type: "in" | "out";
  productId: string;
  quantity: number;
}

export class CreateStockMovementUseCase {
  constructor(private stockMovementRepository: StockMovementRepository, private productRepository: ProductRepository) {}

  async execute(data: CreateStockMovementUseCaseProps): Promise<StockMovement> {
    const product = await this.productRepository.getProduct(data.productId);

    if (!product) {
      throw new Error("Product not found");
    }

    const previousStock = product.stock;
    const newStock = data.type === "in" ? previousStock + data.quantity : previousStock - data.quantity;

    if (newStock < 0) {
      throw new Error("Insufficient stock");
    }

    const result = await this.stockMovementRepository.createStockMovement({
      ...data,
      previousStock,
      newStock,
    });

    await this.productRepository.updateProductStock({
      id: result.productId,
      stock: result.newStock,
    });

    return result;
  }
}
