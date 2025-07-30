import { FastifyReply, FastifyRequest } from "fastify";
import { DrizzleStockMovementsRepository } from "server/src/repositories/drizzle/drizzle-stock-movements-repository";
import { GetStockMovementsUseCase } from "server/src/useCases/stock-movement/get-stock-movements-use-case";

export const getStockMovement = async (_req: FastifyRequest, res: FastifyReply) => {
  try {
    const getStockMovementUseCase = new GetStockMovementsUseCase(new DrizzleStockMovementsRepository());

    const movements = await getStockMovementUseCase.execute();

    res.status(200).send(movements);
  } catch (error) {
    res.status(500).send({ message: "Failed to fetch stock movements" });
  }
};
