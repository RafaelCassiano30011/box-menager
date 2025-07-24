import { FastifyInstance } from "fastify";
import fastifyStatic from "@fastify/static";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger } from "vite";
import viteConfig from "../../vite.config";
import { nanoid } from "nanoid";
import middie from "@fastify/middie";

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: FastifyInstance) {
  // Register middie to use Express-style middlewares in Fastify
  await app.register(middie);

  const serverOptions = {
    middlewareMode: true,
    hmr: { server: app.server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);

        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  // Use middie to register Vite middlewares
  await app.use(vite.middlewares);

  // Handle all routes with Vite's HTML transformation
  app.get("*", async (request, reply) => {
    const url = request.url;

    try {
      const clientTemplate = path.resolve(import.meta.dirname, "..", "..", "client", "index.html");

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(`src="/src/main.tsx"`, `src="/src/main.tsx?v=${nanoid()}"`);
      const page = await vite.transformIndexHtml(url, template);

      reply.type("text/html");
      return reply.send(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);

      reply.code(500);
      return reply.send({ error: "Internal Server Error" });
    }
  });
}

export async function serveStatic(app: FastifyInstance) {
  const distPath = path.resolve(import.meta.dirname, "public");

  if (!fs.existsSync(distPath)) {
    throw new Error(`Could not find the build directory: ${distPath}, make sure to build the client first`);
  }

  // Register static file serving
  await app.register(fastifyStatic, {
    root: distPath,
    prefix: "/",
  });

  // Fallback to index.html for SPA routing
  app.setNotFoundHandler((request, reply) => {
    const indexPath = path.resolve(distPath, "index.html");
    reply.type("text/html");
    return reply.sendFile("index.html");
  });
}
