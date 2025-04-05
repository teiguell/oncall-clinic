import express, { type Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      console.log(`API ${req.method} ${path} ${res.statusCode} in ${duration}ms`);
      if (capturedJsonResponse) {
        console.log('Response:', JSON.stringify(capturedJsonResponse));
      }
    }

    let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
    if (capturedJsonResponse) {
      logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
    }

    if (logLine.length > 80) {
      logLine = logLine.slice(0, 79) + "…";
    }

    log(logLine);
  });

  next();
});

// Global error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      details: err.message
    });
  }
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Unauthorized',
      details: 'Authentication required'
    });
  }
  
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'An error occurred' : err.message
  });
});

(async () => {
  const server = await registerRoutes(app);

  // Error handling middleware
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Server error:', err);
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    
    // Don't expose internal errors to client
    const clientMessage = status === 500 ? "Internal Server Error" : message;
    res.status(status).json({ message: clientMessage });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  import { fileURLToPath } from 'url';
  import { dirname } from 'path';
    
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  if (process.env.NODE_ENV !== "production") {
    await setupVite(app, server);
  } else {
    const distPath = path.join(__dirname, "../dist");
    
    // Verify dist directory exists
    if (!fs.existsSync(distPath)) {
      console.error('Build directory not found:', distPath);
      throw new Error('Build directory not found. Please run npm run build first.');
    }

    // Serve static files
    app.use(express.static(distPath));

    // API routes should be handled before the catch-all
    app.use('/api/*', (req, res) => {
      res.status(404).json({ message: 'API route not found' });
    });

    // Serve index.html for client-side routing
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen(5000, "0.0.0.0", () => {
    log(`Server running at http://0.0.0.0:5000`);
    log(`Local URL: http://localhost:5000`);
  });
})();
