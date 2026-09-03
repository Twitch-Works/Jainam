import Fastify, { type FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import sensible from "@fastify/sensible";
import { env } from "./env.js";
import authPlugin from "./plugins/auth.js";
import healthRoutes from "./routes/health.js";
import meRoutes from "./routes/me.js";
import sadhanaRoutes from "./routes/sadhana.js";
import wisdomRoutes from "./routes/wisdom.js";
import kundliRoutes from "./routes/kundli.js";
import calendarRoutes from "./routes/calendar.js";
import pratikramanRoutes from "./routes/pratikraman.js";
import askJainamRoutes from "./routes/ask-jainam.js";
import practiceRoutes from "./routes/practice.js";
import meditateRoutes from "./routes/meditate.js";
import bhajanRoutes from "./routes/bhajans.js";
import devRoutes from "./routes/dev.js";

export async function buildApp(): Promise<FastifyInstance> {
  const isProd = env.APP_ENV === "production";
  const app = Fastify({
    logger: {
      transport: isProd
        ? undefined
        : { target: "pino-pretty", options: { translateTime: "HH:MM:ss", ignore: "pid,hostname" } },
    },
  });

  await app.register(sensible);
  await app.register(cors, { origin: true });
  await app.register(authPlugin);

  await app.register(healthRoutes);
  await app.register(
    async (api) => {
      await api.register(meRoutes);
      await api.register(sadhanaRoutes);
      await api.register(wisdomRoutes);
      await api.register(kundliRoutes);
      await api.register(calendarRoutes);
      await api.register(pratikramanRoutes);
      await api.register(askJainamRoutes);
      await api.register(practiceRoutes);
      await api.register(meditateRoutes);
      await api.register(bhajanRoutes);
      if (!isProd) await api.register(devRoutes);
    },
    { prefix: "/api" },
  );

  return app;
}
