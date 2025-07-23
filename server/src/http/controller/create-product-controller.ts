import { insertProductSchema } from "@shared/schema";
import type { Request, Response } from "express";
import { DrizzleProductRepository } from "server/src/repositories/drizzle/drizzle-products-repository";
import { CreateProductUseCase } from "server/src/useCases/create-product-use-case";

export const createProduct = async (req: Request, res: Response) => {
  try {
    const productData = insertProductSchema.parse(req.body);

    const createProductUseCase = new CreateProductUseCase(new DrizzleProductRepository());

    const product = await createProductUseCase.execute(productData);

    res.json(product);
  } catch (error: Error | any) {
    res.status(500).json({ message: error.message || "Failed to create product" });
  }
};
