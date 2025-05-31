
import express from 'express';
import path from 'path';
import fs from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import { registerRoutes } from './routes';
import { setupVite, log } from './vite';
import session from 'express-session';
import MemoryStore from 'memorystore';

const memoryStoreSession = MemoryStore(session);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Agregar soporte CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  
  next();
});

// Request logging middleware
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: unknown;

  const originalResJson = res.json;
  res.json = function (bodyJson: unknown) {
    capturedJsonResponse = bodyJson;
    return originalResJson.call(res, bodyJson);
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
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
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

  // Crear un endpoint de diagnóstico directo antes de todo
  app.get('/api/server-info', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    
    const serverInfo = {
      status: 'running',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      headers: req.headers,
      ip: req.ip,
      requestUrl: `${req.protocol}://${req.get('host')}${req.originalUrl}`,
      hostname: req.hostname
    };
    
    res.send(JSON.stringify(serverInfo, null, 2));
  });
  
  if (process.env.NODE_ENV === "production") {
    const distPath = path.join(__dirname, "public");

    if (!fs.existsSync(distPath)) {
      console.error('Build directory not found:', distPath);
      console.log('Available files:', fs.readdirSync(__dirname));
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
    // Make sure these routes work in dev mode by having them after API routes but before Vite middleware
    app.get('/api/*', (req, res, next) => {
      if (!res.headersSent) {
        next();
      }
    });
    
    await setupVite(app, server);
  }

  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(port, "0.0.0.0", () => {
    log(`Server running at http://0.0.0.0:${port} in ${process.env.NODE_ENV || "development"} mode`);
  });
}

main().catch(console.error);
