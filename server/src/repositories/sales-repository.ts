import { InsertSale, InsertSaleItem, SaleWithItems } from "@shared/schema";

export interface SalesRepository {
  getSales(): Promise<SaleWithItems[]>;

  getSale(id: string): Promise<SaleWithItems | undefined>;

  createSale(sale: InsertSale, items: InsertSaleItem[]): Promise<SaleWithItems>;
}
