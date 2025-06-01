import express from "express";
import type { Request, Response } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import fs from "fs";
import path from "path";

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

  // Serve functional HTML temporarily
  const htmlPath = path.join(process.cwd(), 'static-oncall.html');
  const functionalHtml = fs.readFileSync(htmlPath, 'utf8');
  
  app.get('/', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/html');
    res.send(functionalHtml);
  });

  // Setup Vite development server for React app
  try {
    await setupVite(app, httpServer);
  } catch (error) {
    log("Vite setup failed, continuing with static HTML");
  }

  // Start server - use Replit's expected port
  const PORT = Number(process.env.PORT) || 5000;
  httpServer.listen(PORT, "0.0.0.0", () => {
    log(`Server running at http://0.0.0.0:${PORT}`);
    log(`Public URL: https://${process.env.REPLIT_DEV_DOMAIN}`);
  });
}

main().catch(console.error);