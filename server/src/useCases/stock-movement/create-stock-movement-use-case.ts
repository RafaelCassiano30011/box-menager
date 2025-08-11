import { StockMovement, variations } from "@shared/schema";
import { ProductRepository } from "server/src/repositories/products-repository";
import { StockMovementRepository } from "server/src/repositories/stock-movements-repository";

interface CreateStockMovementUseCaseProps {
  type: "in" | "out";
  productId: string;
  variationId: string;
  quantity: number;
}

export class CreateStockMovementUseCase {
  constructor(private stockMovementRepository: StockMovementRepository, private productRepository: ProductRepository) {}

  async execute(props: CreateStockMovementUseCaseProps): Promise<StockMovement> {
    const product = await this.productRepository.getProduct(props.productId);

    console.log(props)

    if (!product) {
      throw new Error("Product not found");
    }

    const previousStock = product.variations.find((variation) => variation.id === props.variationId)?.stock ?? 0;
    const newStock = props.type === "in" ? previousStock + props.quantity : previousStock - props.quantity;

    console.log(previousStock, newStock);

    if (newStock < 0) {
      throw new Error("Insufficient stock");
    }

    const result = await this.stockMovementRepository.createStockMovement({
      ...props,
      previousStock,
      newStock,
    });

    await this.productRepository.updateProductStock({
      id: result.productId,
      stock: result.newStock,
      variationId: result.variationId,
    });

    return result;
  }
}
