import { FastifyReply, FastifyRequest } from "fastify";
import { DrizzleProductRepository } from "server/src/repositories/drizzle/drizzle-products-repository";
import { DeleteProductUseCase } from "server/src/useCases/product/delete-product-use-case";

export const deleteProduct = async (req: FastifyRequest, res: FastifyReply) => {
  try {
    const { id } = req.params as { id: string };

    const deleteProductUseCase = new DeleteProductUseCase(new DrizzleProductRepository());
    const deleted = await deleteProductUseCase.execute(id);

    if (!deleted) {
      res.status(404).send({ message: "Product not found" });
      return;
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).send({ message: "Failed to delete product" });
  }
};
