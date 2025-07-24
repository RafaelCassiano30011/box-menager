import { InsertProduct, Product } from "@shared/schema";
import { ProductRepository } from "../repositories/products-repository";

export class CreateProductUseCase {
  constructor(private readonly productsRepository: ProductRepository) {}

  async execute(product: InsertProduct): Promise<Product | null> {
    const productCreated = await this.productsRepository.createProduct(product);

    return productCreated;
  }
}
