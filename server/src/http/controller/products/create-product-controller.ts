import { errorCodes, FastifyReply, FastifyRequest } from "fastify";
import { insertProductSchema } from "@shared/schema";
import { DrizzleProductRepository } from "server/src/repositories/drizzle/drizzle-products-repository";
import { CreateProductUseCase } from "server/src/useCases/product/create-product-use-case";

export const createProduct = async (req: FastifyRequest, res: FastifyReply) => {
  try {
    const productData = insertProductSchema.parse(req.body);

    const createProductUseCase = new CreateProductUseCase(new DrizzleProductRepository());

    const product = await createProductUseCase.execute(productData);

    res.status(201).send(product);
  } catch (error) {
    throw error;
  }
};
