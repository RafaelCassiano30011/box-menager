import { ProductRepository } from "../repositories/products-repository";

export class DeleteProductsUseCase {
  constructor(private readonly productsRepository: ProductRepository) {}

  async execute(id: string): Promise<boolean> {
    await this.productsRepository.deleteProduct(id);

    const product = await this.productsRepository.getProduct(id);

    return !product;
  }
}
