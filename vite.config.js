import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { loadEnv } from "vite";

function netlifyFunctionDev() {
  return {
    name: "netlify-function-dev",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url !== "/.netlify/functions/openai-chat") {
          next();
          return;
        }

        try {
          const chunks = [];
          for await (const chunk of req) {
            chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
          }

          const { handler } = await import("./netlify/functions/openai-chat.js");
          const event = {
            httpMethod: req.method || "POST",
            body: Buffer.concat(chunks).toString("utf8"),
          };
          const result = await handler(event);

          res.statusCode = result.statusCode || 200;
          Object.entries(result.headers || {}).forEach(([key, value]) => {
            if (value != null) res.setHeader(key, String(value));
          });
          res.end(result.body || "");
        } catch (error) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({
            error: "Local dev function failed.",
            details: error instanceof Error ? error.message : String(error),
          }));
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  Object.assign(process.env, env);

  return {
    plugins: [react(), netlifyFunctionDev()],
  };
});
