import { FastifyInstance } from "fastify";
import { getSales } from "./get-sales-controller";
import { createSale } from "./create-sale-controller";

export async function saleRoutes(app: FastifyInstance) {
  // Sales routes
  app.get("/api/sales", getSales);

  app.post("/api/sales", createSale);
}
