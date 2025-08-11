import Fastify from "fastify";

import { env } from "./env";
import { serveStatic, setupVite } from "./vite";
import { appRoutes } from "./http/routes";
import { ZodError } from "zod";

const app = Fastify({ logger: false });

app.register(appRoutes);

app.setErrorHandler((error, _, reply) => {
  if (error instanceof ZodError) {
    return reply.status(400).send(error.format()._errors.map((err) => `${err}`).join(" "));
  }

  if (env.NODE_ENV !== "production") {
    console.error(error);
  } else {
    // TODO: Here we should log to a external tool like DataDog/NewRelic/Sentry
  }

  return reply.status(500).send({ message: "Internal server error." });
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
