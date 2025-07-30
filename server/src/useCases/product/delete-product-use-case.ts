import { ProductRepository } from "../../repositories/products-repository";

export class DeleteProductUseCase {
  constructor(private readonly productsRepository: ProductRepository) {}

  async execute(id: string): Promise<boolean> {
    await this.productsRepository.deleteProduct(id);

    const product = await this.productsRepository.getProduct(id);

    return !product;
  }
}
