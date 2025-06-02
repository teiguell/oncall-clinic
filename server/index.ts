import express from "express";
import type { Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import fs from "fs";
import path from "path";

const app = express();

// Configure for Replit proxy - must be first
app.set('trust proxy', true);

// CORS and headers
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.static("dist"));

// Global error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Server error:', err);
  if (!res.headersSent) {
    res.status(500).json({
      error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
    });
  }
});

async function main() {
  // Register API routes first
  const httpServer = registerRoutes(app);

  // Setup Vite development server for React app
  try {
    await setupVite(app, httpServer);
    log("Vite development server initialized successfully");
  } catch (error) {
    log("Vite setup failed, serving static fallback");
    // Fallback to static HTML only if Vite fails
    const htmlPath = path.join(process.cwd(), 'static-oncall.html');
    if (fs.existsSync(htmlPath)) {
      const functionalHtml = fs.readFileSync(htmlPath, 'utf8');
      app.get('/', (req: Request, res: Response) => {
        res.setHeader('Content-Type', 'text/html');
        res.send(functionalHtml);
      });
    }
  }

  // Start server - use port 5000 for development, allow PORT override for deployment
  const PORT = Number(process.env.PORT) || 5000;
  httpServer.listen(PORT, "0.0.0.0", () => {
    log(`Server running at http://0.0.0.0:${PORT}`);
    log(`Public URL: https://${process.env.REPLIT_DEV_DOMAIN}`);
  });
}

main().catch(console.error);