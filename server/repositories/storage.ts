import {
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

export interface IStorageRespository {
  // Dashboard
  getDashboardMetrics(): Promise<DashboardMetrics>;
  getLowStockProducts(): Promise<ProductWithStock[]>;
  getRecentSales(limit?: number): Promise<SaleWithItems[]>;

  // Reports
  getSalesInDateRange(startDate: Date, endDate: Date): Promise<SaleWithItems[]>;
  getTopProducts(limit?: number): Promise<Array<Product & { totalSold: number; totalRevenue: number }>>;
}
