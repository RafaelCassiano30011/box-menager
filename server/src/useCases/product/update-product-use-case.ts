import { InsertProduct, Product } from "@shared/schema";
import { ProductRepository } from "../../repositories/products-repository";

export class UpdateProductUseCase {
  constructor(private productsRepository: ProductRepository) {}

  async execute({ id, product }: { id: string; product: InsertProduct }): Promise<Product | undefined> {
    const productUpdated = await this.productsRepository.updateProduct({ id, product });
    await this.productsRepository.addProductVariations({
      variations: product.variations?.map((variation) => {
        return {
          name: variation.variation,
        };
      }),
    });

    if (!productUpdated) {
      throw new Error(`Product with id ${id} not found or could not be updated.`);
    }

    return productUpdated;
  }
}
