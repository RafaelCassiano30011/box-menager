import { InsertSale, InsertSaleItem, SaleWithItems } from "@shared/schema";

export interface SalesRepository {
  getSales(): Promise<SaleWithItems[]>;

  getSale(id: string): Promise<SaleWithItems | undefined>;

  createSale(props: { sale: InsertSale; items: Omit<InsertSaleItem, "saleId">[] }): Promise<SaleWithItems>;
}
