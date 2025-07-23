import { Product } from "@shared/schema";
import { ProductRepository } from "../repositories/products-repository";

export class GetProductsUseCase {
  constructor(private readonly productsRepository: ProductRepository) {}

  async execute(): Promise<Product[] | null> {
    const products = await this.productsRepository.getProducts();

    if (!products) {
      throw new Error("Failed to fetch products");
    }

    return products;
  }
}
