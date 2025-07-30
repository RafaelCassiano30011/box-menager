import { FastifyInstance } from "fastify";
import { getProducts } from "./get-products-controller";
import { createProduct } from "./create-product-controller";
import { updateProduct } from "./update-product-controller";
import { deleteProduct } from "./delete-product-controller";

export async function productRoutes(app: FastifyInstance) {
  // Products routes
  app.get("/api/products", getProducts);

  app.post("/api/products", createProduct);

  app.put("/api/products/:id", updateProduct);

  app.delete("/api/products/:id", deleteProduct);
}
