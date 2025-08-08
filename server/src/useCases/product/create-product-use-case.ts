import { InsertProduct, Product } from "@shared/schema";
import { ProductRepository } from "../../repositories/products-repository";
import { randomUUID } from "node:crypto";

export class CreateProductUseCase {
  constructor(private productsRepository: ProductRepository) {}

  async execute(product: InsertProduct): Promise<Product | null> {
    const variationsWithID = product.variations?.map((variation) => ({
      ...variation,
      id: randomUUID(),
    }));

    const productCreated = await this.productsRepository.createProduct({ ...product, variations: variationsWithID });

    return productCreated;
  }
}
