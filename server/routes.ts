import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProductSchema, insertStockMovementSchema, insertSaleSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Products routes
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid product data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create product" });
      }
    }
  });

  app.put("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const productData = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(id, productData);
      
      if (!product) {
        res.status(404).json({ message: "Product not found" });
        return;
      }
      
      res.json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid product data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update product" });
      }
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteProduct(id);
      
      if (!deleted) {
        res.status(404).json({ message: "Product not found" });
        return;
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Stock movements routes
  app.get("/api/stock-movements", async (req, res) => {
    try {
      const movements = await storage.getStockMovements();
      res.json(movements);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stock movements" });
    }
  });

  app.post("/api/stock-movements", async (req, res) => {
    try {
      const { productId, type, quantity, reason } = req.body;
      
      const product = await storage.getProduct(productId);
      if (!product) {
        res.status(404).json({ message: "Product not found" });
        return;
      }

      const previousStock = product.stock;
      const newStock = type === 'in' ? previousStock + quantity : previousStock - quantity;

      if (newStock < 0) {
        res.status(400).json({ message: "Insufficient stock" });
        return;
      }

      const movementData = {
        productId,
        type,
        quantity,
        previousStock,
        newStock,
        reason
      };

      const movement = await storage.createStockMovement(movementData);
      res.status(201).json(movement);
    } catch (error) {
      res.status(500).json({ message: "Failed to create stock movement" });
    }
  });

  // Sales routes
  app.get("/api/sales", async (req, res) => {
    try {
      const sales = await storage.getSales();
      res.json(sales);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sales" });
    }
  });

  app.post("/api/sales", async (req, res) => {
    try {
      const { customerName, paymentMethod, items } = req.body;
      
      // Validate items
      for (const item of items) {
        const product = await storage.getProduct(item.productId);
        if (!product) {
          res.status(404).json({ message: `Product with ID ${item.productId} not found` });
          return;
        }
        if (product.stock < item.quantity) {
          res.status(400).json({ message: `Insufficient stock for product: ${product.name}` });
          return;
        }
      }

      // Calculate total
      const total = items.reduce((sum: number, item: any) => {
        const unitPrice = Number(item.unitPrice);
        const discount = Number(item.discount || 0);
        const subtotal = (unitPrice * item.quantity) * (1 - discount / 100);
        return sum + subtotal;
      }, 0);

      const saleData = {
        customerName,
        paymentMethod,
        total: total.toFixed(2)
      };

      const saleItems = items.map((item: any) => {
        const unitPrice = Number(item.unitPrice);
        const discount = Number(item.discount || 0);
        const subtotal = (unitPrice * item.quantity) * (1 - discount / 100);
        
        return {
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: unitPrice.toFixed(2),
          discount: discount.toFixed(2),
          subtotal: subtotal.toFixed(2)
        };
      });

      const sale = await storage.createSale(saleData, saleItems);
      res.status(201).json(sale);
    } catch (error) {
      res.status(500).json({ message: "Failed to create sale" });
    }
  });

  // Dashboard routes
  app.get("/api/dashboard/metrics", async (req, res) => {
    try {
      const metrics = await storage.getDashboardMetrics();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard metrics" });
    }
  });

  app.get("/api/dashboard/low-stock", async (req, res) => {
    try {
      const lowStockProducts = await storage.getLowStockProducts();
      res.json(lowStockProducts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch low stock products" });
    }
  });

  app.get("/api/dashboard/recent-sales", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const recentSales = await storage.getRecentSales(limit);
      res.json(recentSales);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recent sales" });
    }
  });

  // Reports routes
  app.get("/api/reports/sales", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        res.status(400).json({ message: "Start date and end date are required" });
        return;
      }

      const start = new Date(startDate as string);
      const end = new Date(endDate as string);
      
      const sales = await storage.getSalesInDateRange(start, end);
      res.json(sales);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sales report" });
    }
  });

  app.get("/api/reports/top-products", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const topProducts = await storage.getTopProducts(limit);
      res.json(topProducts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch top products" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
