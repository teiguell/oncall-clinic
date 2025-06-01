import express from "express";
import type { Request, Response } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.static("dist"));

// Global error handler
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error(err.stack);
  res.status(500).json({
    message: process.env.NODE_ENV === 'production' ? 'An error occurred' : err.message
  });
});

async function main() {
  // Register API routes first
  const httpServer = registerRoutes(app);

  // Setup Vite development server for React app
  await setupVite(app, httpServer);

  // Start server
  const PORT = Number(process.env.PORT) || 5000;
  httpServer.listen(PORT, "0.0.0.0", () => {
    log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

main().catch(console.error);