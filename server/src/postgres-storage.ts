import { eq, desc, and, gte, lte, sql } from "drizzle-orm";
import { drizzle } from "./lib/drizzle";
import {
  products,
  stockMovements,
  sales,
  saleItems,
  Product,
  InsertProduct,
  StockMovement,
  InsertStockMovement,
  Sale,
  InsertSale,
  SaleItem,
  InsertSaleItem,
  DashboardMetrics,
  SaleWithItems,
  ProductWithStock,
} from "@shared/schema";
import { IStorageRespository } from "./repositories/storage";

export class PostgresStorage implements IStorageRespository {
  async getProducts(): Promise<Product[]> {
    return await drizzle.select().from(products).orderBy(desc(products.createdAt));
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const result = await drizzle.select().from(products).where(eq(products.id, id));
    return result[0];
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const result = await drizzle.insert(products).values(product).returning();
    return result[0];
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const result = await drizzle.update(products).set(product).where(eq(products.id, id)).returning();
    return result[0];
  }

  async deleteProduct(id: number): Promise<boolean> {
    await drizzle.delete(products).where(eq(products.id, id));

    const product = await this.getProduct(id);

    return !product;
  }

  async getStockMovements(): Promise<StockMovement[]> {
    return await drizzle.select().from(stockMovements).orderBy(desc(stockMovements.createdAt));
  }

  async createStockMovement(movement: InsertStockMovement): Promise<StockMovement> {
    const result = await drizzle.insert(stockMovements).values(movement).returning();

    // Update product stock
    await drizzle.update(products).set({ stock: movement.newStock }).where(eq(products.id, movement.productId));

    return result[0];
  }

  async getProductStockHistory(productId: number): Promise<StockMovement[]> {
    return await drizzle
      .select()
      .from(stockMovements)
      .where(eq(stockMovements.productId, productId))
      .orderBy(desc(stockMovements.createdAt));
  }

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
        const [product] = await tx.select().from(products).where(eq(products.id, item.productId));

        if (product) {
          const previousStock = product.stock;
          const newStock = previousStock - item.quantity;

          // Update product stock
          await tx.update(products).set({ stock: newStock }).where(eq(products.id, item.productId));

          // Create stock movement
          await tx.insert(stockMovements).values({
            productId: item.productId,
            type: "out",
            quantity: item.quantity,
            previousStock,
            newStock,
            reason: "Venda",
          });
        }
      }

      return {
        ...saleResult,
        items: saleItemsResults,
      };
    });
  }

  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Today's sales
    const todaySalesData = await drizzle
      .select({
        total: sales.total,
      })
      .from(sales)
      .where(and(gte(sales.createdAt, today), lte(sales.createdAt, tomorrow)));

    const todaySalesTotal = todaySalesData.reduce((sum, sale) => sum + Number(sale.total), 0);

    // Today's products sold
    const todayProductsSoldData = await drizzle
      .select({
        quantity: saleItems.quantity,
      })
      .from(saleItems)
      .innerJoin(sales, eq(saleItems.saleId, sales.id))
      .where(and(gte(sales.createdAt, today), lte(sales.createdAt, tomorrow)));

    const todayProductsSold = todayProductsSoldData.reduce((sum, item) => sum + item.quantity, 0);

    // Total stock
    const totalStockData = await drizzle
      .select({
        totalStock: sql<number>`sum(${products.stock})`,
      })
      .from(products);

    const totalStock = Number(totalStockData[0]?.totalStock || 0);

    // Total products
    const totalProductsData = await drizzle
      .select({
        count: sql<number>`count(*)`,
      })
      .from(products);

    const totalProducts = Number(totalProductsData[0]?.count || 0);

    return {
      todaySales: todaySalesTotal,
      todayProductsSold,
      totalStock,
      totalProducts,
      salesGrowth: 12, // TODO: Calculate real growth
      stockGrowth: -3, // TODO: Calculate real growth
    };
  }

  async getLowStockProducts(): Promise<ProductWithStock[]> {
    const lowStockProducts = await drizzle
      .select()
      .from(products)
      .where(sql`${products.stock} <= ${products.minStock}`);

    return lowStockProducts.map((product) => ({
      ...product,
      isLowStock: true,
    }));
  }

  async getRecentSales(limit = 10): Promise<SaleWithItems[]> {
    const salesData = await drizzle.select().from(sales).orderBy(desc(sales.createdAt)).limit(limit);

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

  async getSalesInDateRange(startDate: Date, endDate: Date): Promise<SaleWithItems[]> {
    const salesData = await drizzle
      .select()
      .from(sales)
      .where(and(gte(sales.createdAt, startDate), lte(sales.createdAt, endDate)))
      .orderBy(desc(sales.createdAt));

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

  async getTopProducts(limit = 10): Promise<Array<Product & { totalSold: number; totalRevenue: number }>> {
    const topProductsData = await drizzle
      .select({
        id: products.id,
        name: products.name,
        image: products.image,
        description: products.description,
        price: products.price,
        stock: products.stock,
        minStock: products.minStock,
        category: products.category,
        createdAt: products.createdAt,
        totalSold: sql<number>`sum(${saleItems.quantity})`,
        totalRevenue: sql<number>`sum(${saleItems.subtotal})`,
      })
      .from(products)
      .leftJoin(saleItems, eq(products.id, saleItems.productId))
      .groupBy(products.id)
      .orderBy(desc(sql<number>`sum(${saleItems.quantity})`))
      .limit(limit);

    return topProductsData.map((product) => ({
      ...product,
      totalSold: Number(product.totalSold || 0),
      totalRevenue: Number(product.totalRevenue || 0),
    }));
  }
}

export const storage = new PostgresStorage();