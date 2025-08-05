import { FastifyInstance } from "fastify";
import { getSales } from "./get-sales-controller";
import { createSale } from "./create-sale-controller";
import { storage } from "../../../postgres-storage";

export async function saleRoutes(app: FastifyInstance) {
  // Sales routes
  app.get("/api/sales", getSales);

  app.post("/api/sales", createSale);

  app.get("/api/sale/:id", async (req, res) => {
    const { id } = req.params as { id: string };
    try {
      const sale = await storage.getSale(id);

      console.log(sale)

      if (!sale) {
        return res.status(404).send({ message: "Sale not found" });
      }
      return res.status(200).send(sale);
    } catch (error) {
      return res.status(500).send({ message: "Failed to fetch sale" });
    }
  });
}
