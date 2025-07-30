import { FastifyInstance } from "fastify";

import { getStockMovement } from "./get-stock-movements-controller";
import { createStockMovement } from "./create-stock-movements-controller copy";

export async function stockMovements(app: FastifyInstance) {
  // Stock movements routes
  app.get("/api/stock-movements", getStockMovement);

  app.post("/api/stock-movements", createStockMovement);
}
