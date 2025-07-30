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
  }>;
}

export class CreateSaleUseCase {
  constructor(
    private salesRepository: SalesRepository,
    private productRepository: ProductRepository,
    private stockMovementsRepository: StockMovementRepository
  ) {}

  async execute({ items, paymentMethod, customerName }: CreateSaleUseCaseProps) {
    const validatedItems = [];
    const products = [];

    // Validate stock availability for all items
    for (const item of items) {
      const product = await this.productRepository.getProduct(item.productId);

      if (!product) {
        throw new Error(`Product with ID ${item.productId} not found`);
      }

      if (product.stock < item.quantity) {
        throw new Error(
          `Insufficient stock for product ${product.name}. Available: ${product.stock}, Required: ${item.quantity}`
        );
      }

      validatedItems.push(item);
      products.push(product);
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
      const product = products.find((p) => p.id === saleItem.productId);

      if (!product) continue;

      const newStock = product.stock - saleItem.quantity;

      // Update product stock
      await this.productRepository.updateProductStock({
        id: product.id,
        stock: newStock,
      });

      // Create stock movement record
      await this.stockMovementsRepository.createStockMovement({
        productId: saleItem.productId,
        type: "out",
        quantity: saleItem.quantity,
        previousStock: product.stock,
        newStock,
        reason: "Venda",
      });
    }

    return saleResult;
  }
}
