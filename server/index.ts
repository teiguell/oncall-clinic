const express = require('express');
const path = require('path');
const fs = require('fs');
const { registerRoutes } = require('./routes');
const { setupVite, serveStatic, log } = require('./vite');
const session = require('express-session');
const MemoryStore = require('memorystore')(session);

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
  const server = await registerRoutes(app);

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
    log(`Server running at http://0.0.0.0:${port}`);
  });
}

main().catch(console.error);