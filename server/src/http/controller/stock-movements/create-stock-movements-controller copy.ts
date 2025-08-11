import { insertStockMovementSchema } from "@shared/schema";
import { FastifyReply, FastifyRequest } from "fastify";
import { DrizzleProductRepository } from "server/src/repositories/drizzle/drizzle-products-repository";
import { DrizzleStockMovementsRepository } from "server/src/repositories/drizzle/drizzle-stock-movements-repository";
import { CreateStockMovementUseCase } from "server/src/useCases/stock-movement/create-stock-movement-use-case";
import z from "zod";

export const createStockMovement = async (req: FastifyRequest, res: FastifyReply) => {
  try {
    const insertStockMovement = z
      .object({
        type: z.enum(["in", "out"]),
        productId: z.string().min(1, "Product ID is required"),
        quantity: z.number().positive("Quantity must be a positive number"),
        variationId: z.string().min(1, "Variation ID is required"),
        reason: z.string().optional(),
      })
      .parse(req.body);

    const getStockMovementUseCase = new CreateStockMovementUseCase(
      new DrizzleStockMovementsRepository(),
      new DrizzleProductRepository()
    );

    const movements = await getStockMovementUseCase.execute(insertStockMovement);

    res.status(200).send(movements);
  } catch (error) {
    throw error;
  }
};
