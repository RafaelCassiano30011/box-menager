import { storage } from "../postgres-storage";
import { FastifyInstance } from "fastify";
import { productRoutes } from "./controller/products/route";
import { stockMovements } from "./controller/stock-movements/route";
import { saleRoutes } from "./controller/sales/route";

export async function appRoutes(app: FastifyInstance) {
  app.register(productRoutes);
  app.register(stockMovements);
  app.register(saleRoutes);

  // Sales routes

  app.get("/api/variations", async (req, res) => {
    try {
      const variations = await storage.getVariations();

      console.log(variations);

      res.send(variations);
    } catch (error) {
      res.status(500).send({ message: "Failed to fetch product variations" });
    }
  });

  // Dashboard routes
  app.get("/api/dashboard/metrics", async (req, res) => {
    try {
      const metrics = await storage.getDashboardMetrics();
      res.send(metrics);
    } catch (error) {
      res.status(500).send({ message: "Failed to fetch dashboard metrics" });
    }
  });

  app.get("/api/dashboard/low-stock", async (req, res) => {
    try {
      const lowStockProducts = await storage.getLowStockProducts();
      res.send(lowStockProducts);
    } catch (error) {
      res.status(500).send({ message: "Failed to fetch low stock products" });
    }
  });

  app.get("/api/dashboard/recent-sales", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const recentSales = await storage.getRecentSales(limit);
      res.send(recentSales);
    } catch (error) {
      res.status(500).send({ message: "Failed to fetch recent sales" });
    }
  });

  // Reports routes
  app.get("/api/reports/sales", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        res.status(400).send({ message: "Start date and end date are required" });
        return;
      }

      const start = new Date(startDate as string);
      const end = new Date(endDate as string);

      const sales = await storage.getSalesInDateRange(start, end);
      res.send(sales);
    } catch (error) {
      res.status(500).send({ message: "Failed to fetch sales report" });
    }
  });

  app.get("/api/reports/top-products", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const topProducts = await storage.getTopProducts(limit);
      res.send(topProducts);
    } catch (error) {
      res.status(500).send({ message: "Failed to fetch top products" });
    }
  });
}
