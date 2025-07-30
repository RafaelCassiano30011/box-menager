import { SaleWithItems } from "@shared/schema";
import { SalesRepository } from "server/src/repositories/sales-repository";

export class GetSalesUseCase {
  constructor(private salesRepository: SalesRepository) {}

  async execute(): Promise<SaleWithItems[]> {
    const sales = await this.salesRepository.getSales();

    return sales;
  }
}
