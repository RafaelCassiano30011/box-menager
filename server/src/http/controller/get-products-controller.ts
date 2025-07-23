import type { Request, Response } from "express";
import { DrizzleProductRepository } from "server/src/repositories/drizzle/drizzle-products-repository";
import { GetProductsUseCase } from "server/src/useCases/get-products-use-case";

export const getProducts = async (_req: Request, res: Response) => {
  try {
    const getProductsUseCase = new GetProductsUseCase(new DrizzleProductRepository());

    const products = await getProductsUseCase.execute();

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch products" });
  }
};
