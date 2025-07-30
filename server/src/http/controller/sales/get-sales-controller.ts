import { FastifyRequest, FastifyReply } from "fastify";
import { DrizzleSalesRepository } from "server/src/repositories/drizzle/drizzle-sales-repository";
import { GetSalesUseCase } from "server/src/useCases/sales/get-sales-use-case";

// Define the request type

export const getSales = async (_req: FastifyRequest, res: FastifyReply) => {
  try {
    // Validate the entire request body with items included

    const getSalesUseCase = new GetSalesUseCase(new DrizzleSalesRepository());

    const sales = await getSalesUseCase.execute();

    return res.status(200).send(sales);
  } catch (error) {
    throw error;
  }
};
