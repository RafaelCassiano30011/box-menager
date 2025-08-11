import Fastify from "fastify";

import { env } from "./env";
import { serveStatic, setupVite } from "./vite";
import { appRoutes } from "./http/routes";
import { ZodError } from "zod";

const app = Fastify({ logger: false });

app.register(appRoutes);

app.setErrorHandler((error, _, reply) => {
  if (error instanceof ZodError) {
    const readable = error.errors.map((err) => `${err.path.join(".")}: ${err.message}`).join(",");

    return reply.status(400).send({
      message: readable,
      errors: error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      })),
    });
  }

  if (env.NODE_ENV !== "production") {
    console.error(error);
  } else {
  }

  return reply.status(500).send({ message: error.message });
});

async function start() {
  try {
    if (env.NODE_ENV === "development") {
      await setupVite(app);
    } else {
      await serveStatic(app);
    }

    await app.listen({
      host: "0.0.0.0",
      port: env.PORT || 3000,
    });

    console.log("🚀 HTTP Server Running on port", env.PORT || 3000);
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

start();
