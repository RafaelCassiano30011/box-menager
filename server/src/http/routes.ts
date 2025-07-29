import { storage } from "../postgres-storage";
import { getProducts } from "./controller/get-products-controller";
import { createProduct } from "./controller/create-product-controller";
import { FastifyInstance } from "fastify";
import { updateProduct } from "./controller/update-product-controller";
import { deleteProduct } from "./controller/delete-product-controller";

export async function appRoutes(app: FastifyInstance) {
  // Products routes
  app.get("/api/products", getProducts);

  app.post("/api/products", createProduct);

  app.put("/api/products/:id", updateProduct);

  app.delete("/api/products/:id", deleteProduct);

  // Stock movements routes
  app.get("/api/stock-movements", async (req, res) => {
    try {
      const movements = await storage.getStockMovements();
      res.send(movements);
    } catch (error) {
      res.status(500).send({ message: `Failed to fetch stock movements ${error.message}` });
    }
  });

  app.post("/api/stock-movements", async (req, res) => {
    try {
      const { productId, type, quantity, reason } = req.body;

      const product = await storage.getProduct(productId);
      if (!product) {
        res.status(404).send({ message: "Product not found" });
        return;
      }

      const previousStock = product.stock;
      const newStock = type === "in" ? previousStock + quantity : previousStock - quantity;

      if (newStock < 0) {
        res.status(400).send({ message: "Insufficient stock" });
        return;
      }

      const movementData = {
        productId,
        type,
        quantity,
        previousStock,
        newStock,
        reason,
      };

      const movement = await storage.createStockMovement(movementData);
      res.status(201).send(movement);
    } catch (error) {
      res.status(500).send({ message: "Failed to create stock movement" });
    }
  });

  // Sales routes
  app.get("/api/sales", async (req, res) => {
    try {
      const sales = await storage.getSales();
      res.send(sales);
    } catch (error) {
      res.status(500).send({ message: "Failed to fetch sales" });
    }
  });

  app.post("/api/sales", async (req, res) => {
    try {
      const { customerName, paymentMethod, items } = req.body;

      // Validate items
      for (const item of items) {
        const product = await storage.getProduct(item.productId);
        if (!product) {
          res.status(404).send({ message: `Product with ID ${item.productId} not found` });
          return;
        }
        if (product.stock < item.quantity) {
          res.status(400).send({ message: `Insufficient stock for product: ${product.name}` });
          return;
        }
      }

      // Calculate total
      const total = items.reduce((sum: number, item: any) => {
        const unitPrice = Number(item.unitPrice);
        const discount = Number(item.discount || 0);
        const subtotal = unitPrice * item.quantity * (1 - discount / 100);
        return sum + subtotal;
      }, 0);

      const saleData = {
        customerName,
        paymentMethod,
        total: total.toFixed(2),
      };

      const saleItems = items.map((item: any) => {
        const unitPrice = Number(item.unitPrice);
        const discount = Number(item.discount || 0);
        const subtotal = unitPrice * item.quantity * (1 - discount / 100);

        return {
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: unitPrice.toFixed(2),
          discount: discount.toFixed(2),
          subtotal: subtotal.toFixed(2),
        };
      });

      const sale = await storage.createSale(saleData, saleItems);
      res.status(201).send(sale);
    } catch (error) {
         res.status(500).send({ message: `Failed to fetch stock movements ${error.message}` });
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
