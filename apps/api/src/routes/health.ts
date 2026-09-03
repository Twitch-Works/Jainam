import type { FastifyPluginAsync } from "fastify";
import { env } from "../env.js";

const healthRoutes: FastifyPluginAsync = async (app) => {
  app.get("/health", async () => ({
    status: "ok",
    env: env.APP_ENV,
    time: new Date().toISOString(),
  }));
};

export default healthRoutes;
