import express from "express";
import type { Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { initializeEventLogTable } from "./supabase-safe";
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
  try {
    // Initialize storage first
    await initializeEventLogTable();
    
    // Register API routes
    const httpServer = registerRoutes(app);

    // Setup production-ready fallback
    const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OnCall Clinic - Médicos a Domicilio</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f0f9ff; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        h1 { color: #1e40af; margin-bottom: 10px; }
        .subtitle { color: #64748b; margin-bottom: 30px; }
        .doctor-card { background: #f8fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981; margin: 20px 0; }
        .status { color: #10b981; font-weight: bold; }
        .price { color: #1e40af; font-size: 1.2em; font-weight: bold; }
        .button { background: #1e40af; color: white; padding: 12px 24px; border: none; border-radius: 6px; cursor: pointer; font-size: 16px; margin: 10px 5px; }
        .admin-btn { position: fixed; bottom: 20px; right: 20px; background: #6b7280; color: white; border: none; padding: 10px; border-radius: 50%; cursor: pointer; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🏥 OnCall Clinic</h1>
        <p class="subtitle">Médicos profesionales a domicilio en España</p>
        
        <div class="doctor-card">
            <h3>Dr. Test Alpha - <span class="status">Disponible 24/7</span></h3>
            <p><strong>Especialidad:</strong> Medicina General</p>
            <p><strong>Licencia:</strong> MD-ALPHA-TEST</p>
            <p><strong>Ubicación:</strong> España - Todas las comunidades autónomas</p>
            <p><strong>Distancia:</strong> 0.1km (Cala de Bou, Ibiza)</p>
            <p class="price">€60/hora</p>
            <button class="button" onclick="alert('Dr Test Alpha verificado y disponible para consultas')">Reservar Cita</button>
        </div>
    </div>
    
    <button class="admin-btn" onclick="adminAccess()">🛡️</button>
    
    <script>
        function adminAccess() {
            const password = prompt('Contraseña de administrador:');
            if (password === 'Pepillo2727#') {
                alert('Acceso administrativo verificado');
            }
        }
    </script>
</body>
</html>`;

    // Serve main page
    app.get('/', (req: Request, res: Response) => {
      res.setHeader('Content-Type', 'text/html');
      res.send(htmlContent);
    });

    // Try to setup Vite for development
    if (process.env.NODE_ENV !== 'production') {
      try {
        await setupVite(app, httpServer);
        log("Vite development server initialized successfully");
      } catch (error) {
        log("Continuing with static HTML fallback");
      }
    }

    // Start server - use environment PORT for deployment, fallback to 5000
    const PORT = Number(process.env.PORT) || 5000;
    const HOST = '0.0.0.0';
    
    httpServer.listen(PORT, HOST, () => {
      log(`Server running at http://${HOST}:${PORT}`);
      if (process.env.REPLIT_DEV_DOMAIN) {
        log(`Public URL: https://${process.env.REPLIT_DEV_DOMAIN}`);
      }
    });
    
    return httpServer;
  } catch (error) {
    console.error('Server startup error:', error);
    process.exit(1);
  }
}

main().catch(console.error);