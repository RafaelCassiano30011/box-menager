import { ProductRepository } from "server/src/repositories/products-repository";
import { SalesRepository } from "server/src/repositories/sales-repository";
import { StockMovementRepository } from "server/src/repositories/stock-movements-repository";

interface CreateSaleUseCaseProps {
  customerName?: string | undefined;
  paymentMethod: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: string;
    discount?: string;
    subtotal: string;
    variationId: string;
    variationName: string;
  }>;
}

export class CreateSaleUseCase {
  constructor(
    private salesRepository: SalesRepository,
    private productRepository: ProductRepository,
    private stockMovementsRepository: StockMovementRepository
  ) {}

  async execute({ items, paymentMethod, customerName }: CreateSaleUseCaseProps) {
    try {
      const validatedItems = [];
      const variations = [];

      // Validate stock availability for all items
      for (const item of items) {
        const product = await this.productRepository.getProduct(item.productId);

        if (!product) {
          throw new Error(`Product with ID ${item.productId} not found`);
        }

        const variationItem = product.variations.find((variation) => variation.id === item.variationId);

        if ((variationItem?.stock || 0) < item.quantity) {
          throw new Error(
            `Insufficient stock for product ${product.name} ${variationItem?.variation}. Available: ${
              variationItem?.stock || 0
            }, Required: ${item.quantity}`
          );
        }

        validatedItems.push(item);
        variations.push(variationItem);
      }

      const total = validatedItems.reduce((sum: number, item: any) => {
        const unitPrice = Number(item.unitPrice);
        const discount = Number(item.discount || 0);
        const subtotal = unitPrice * item.quantity * (1 - discount / 100);
        return sum + subtotal;
      }, 0);

      // Create the sale with all items
      const saleResult = await this.salesRepository.createSale({
        sale: {
          paymentMethod,
          customerName,
          total: total.toFixed(2),
        },
        items: validatedItems,
      });

      // Update stock and create movements for each item
      for (const saleItem of saleResult.items) {
        const variation = variations.find((item) => item?.id === saleItem.variationId);

        if (!variation) continue;

        const newStock = variation.stock - saleItem.quantity;

        // Update product stock
        await this.productRepository.updateProductStock({
          id: saleItem.productId,
          stock: newStock,
          variationId: variation.id,
        });

        // Create stock movement record
        await this.stockMovementsRepository.createStockMovement({
          productId: saleItem.productId,
          type: "out",
          quantity: saleItem.quantity,
          previousStock: variation.stock,
          newStock,
          reason: "Venda",
          variationId: variation.id,

        });
      }

      return saleResult;
    } catch (error) {
      throw error;
    }
  }
}
