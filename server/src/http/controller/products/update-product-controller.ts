import { FastifyReply, FastifyRequest } from "fastify";
import { insertProductSchema } from "@shared/schema";
import { DrizzleProductRepository } from "server/src/repositories/drizzle/drizzle-products-repository";
import { UpdateProductUseCase } from "server/src/useCases/product/update-product-use-case";

export const updateProduct = async (req: FastifyRequest, res: FastifyReply) => {
  try {
    const { id } = req.params as { id: string };
    const productData = insertProductSchema.parse(req.body);

    const updateProductUseCase = new UpdateProductUseCase(new DrizzleProductRepository());
    const product = await updateProductUseCase.execute({ id, product: productData });

    if (!product) {
      res.status(404).send({ message: "Product not found" });
      return;
    }

    res.send(product);
  } catch (error) {
    throw new Error();
  }
};
