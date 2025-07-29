import Fastify from "fastify";

import { env } from "./env";
import { serveStatic, setupVite } from "./vite";
import { appRoutes } from "./http/routes";
import { ZodError } from "zod";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const app = Fastify({ logger: false });

app.register(appRoutes);

app.setErrorHandler((error, _, reply) => {
  if (error instanceof ZodError) {
    return reply.status(400).send({ message: "Validation error.", issues: error.format() });
  }

  if (env.NODE_ENV !== "production") {
    console.error(error);
  } else {
    // TODO: Here we should log to a external tool like DataDog/NewRelic/Sentry
  }

  return reply.status(500).send({ message: "Internal server error." });
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!isReady) {
    if (env.NODE_ENV === "development") {
      await setupVite(app);
    } else {
      await serveStatic(app);
    }
    await app.ready();
    isReady = true;
  }

  app.server.emit("request", req, res);
}
