import { FastifyReply, FastifyRequest } from "fastify";
import { DrizzleProductRepository } from "server/src/repositories/drizzle/drizzle-products-repository";
import { GetProductsUseCase } from "server/src/useCases/product/get-products-use-case";

export const getProducts = async (_req: FastifyRequest, res: FastifyReply) => {
  try {
    const getProductsUseCase = new GetProductsUseCase(new DrizzleProductRepository());

    const products = await getProductsUseCase.execute();

    res.status(200).send(products);
  } catch (error) {
    res.status(500).send({ message: "Failed to fetch products" });
  }
};
