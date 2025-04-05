
import express from 'express';
import path from 'path';
import fs from 'fs';
import { registerRoutes } from './routes';
import { setupVite, log } from './vite';
import session from 'express-session';
import MemoryStore from 'memorystore';

const memoryStoreSession = MemoryStore(session);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse;

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
    log(`${req.method} ${path} ${res.statusCode} in ${duration}ms`);
  });

  next();
});

// Global error handling middleware
app.use((err, req, res, next) => {
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

async function main() {
  // Añadir ruta estática para diagnóstico principal
  app.get('/static', (req, res) => {
    res.sendFile(path.resolve(process.cwd(), 'client/public/index.html'));
  });
  
  // Añadir ruta para el archivo HTML en la raíz
  app.get('/rootpage', (req, res) => {
    res.sendFile(path.resolve(process.cwd(), 'index.html'));
  });

  const server = await registerRoutes(app);

  // Servir archivos estáticos desde client/public para diagnóstico
  app.use('/static-assets', express.static(path.resolve(process.cwd(), 'client/public')));

  if (process.env.NODE_ENV === "production") {
    const distPath = path.join(__dirname, "../dist/public");

    if (!fs.existsSync(distPath)) {
      console.error('Build directory not found:', distPath);
      throw new Error('Build directory not found. Please run npm run build first.');
    }

    // Serve static files
    app.use(express.static(distPath));

    // Serve index.html for all non-API routes
    app.get('*', (req, res) => {
      if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(distPath, 'index.html'));
      }
    });
  } else {
    await setupVite(app, server);
  }

  const port = process.env.PORT || 5000;
  server.listen(port, "0.0.0.0", () => {
    log(`Server running at http://0.0.0.0:${port} in ${process.env.NODE_ENV || "development"} mode`);
  });
}

main().catch(console.error);
