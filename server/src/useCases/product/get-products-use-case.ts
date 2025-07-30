import { Product } from "@shared/schema";
import { ProductRepository } from "../../repositories/products-repository";

export class GetProductsUseCase {
  constructor(private readonly productsRepository: ProductRepository) {}

  async execute(): Promise<Product[] | null> {
    const products = await this.productsRepository.getProducts();

    return products;
  }
}
