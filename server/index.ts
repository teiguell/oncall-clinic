
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
  // OnCall Clinic clean page - served before Vite setup
  app.get('/clinic', (req, res) => {
    const html = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OnCall Clinic - Atención Médica a Domicilio</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 1rem; }
        .nav { background: white; border-bottom: 1px solid #e5e7eb; padding: 1rem 0; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .nav-content { display: flex; justify-content: space-between; align-items: center; }
        .logo { display: flex; align-items: center; }
        .logo-icon { width: 32px; height: 32px; background: #2563eb; border-radius: 50%; margin-right: 12px; }
        .logo-text { font-size: 24px; font-weight: bold; color: #111827; }
        .nav-buttons { display: flex; gap: 1rem; }
        .btn { padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; font-weight: 500; text-decoration: none; display: inline-block; }
        .btn-primary { background: #2563eb; color: white; }
        .btn-ghost { background: transparent; color: #374151; }
        .hero { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 5rem 0; text-align: center; }
        .hero h1 { font-size: 3.5rem; font-weight: bold; margin-bottom: 1.5rem; line-height: 1.1; }
        .hero p { font-size: 1.25rem; margin-bottom: 2rem; opacity: 0.9; max-width: 600px; margin-left: auto; margin-right: auto; }
        .btn-hero { background: white; color: #2563eb; padding: 12px 32px; font-size: 18px; font-weight: 600; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .benefits { padding: 4rem 0; background: white; }
        .section-title { font-size: 2.5rem; font-weight: bold; text-align: center; margin-bottom: 3rem; color: #111827; }
        .benefits-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem; }
        .benefit-item { text-align: center; }
        .benefit-icon { width: 64px; height: 64px; background: #dbeafe; border-radius: 50%; margin: 0 auto 1rem; display: flex; align-items: center; justify-content: center; }
        .benefit-icon-inner { width: 32px; height: 32px; background: #2563eb; border-radius: 4px; }
        .benefit-title { font-size: 1.25rem; font-weight: 600; margin-bottom: 0.5rem; }
        .benefit-text { color: #6b7280; }
        .doctors { padding: 4rem 0; background: #f9fafb; }
        .doctor-card { background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); padding: 2rem; border: 1px solid #e5e7eb; max-width: 800px; margin: 0 auto; }
        .doctor-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; }
        .doctor-avatar { width: 64px; height: 64px; background: #dbeafe; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
        .doctor-info { flex: 1; }
        .doctor-name { font-size: 1.5rem; font-weight: 600; margin-bottom: 0.25rem; }
        .doctor-specialty { color: #6b7280; margin-bottom: 0.5rem; }
        .doctor-education { font-size: 0.875rem; color: #9ca3af; }
        .doctor-rating { display: flex; align-items: center; margin-top: 0.5rem; }
        .stars { color: #fbbf24; }
        .rating-text { margin-left: 0.5rem; font-size: 0.875rem; color: #6b7280; }
        .doctor-price { text-align: right; }
        .price { font-size: 2rem; font-weight: bold; color: #111827; }
        .price-text { font-size: 0.875rem; color: #6b7280; }
        .status-badge { display: inline-block; background: #dcfce7; color: #166534; font-size: 0.75rem; padding: 0.25rem 0.5rem; border-radius: 9999px; margin-top: 0.5rem; }
        .doctor-footer { padding-top: 1rem; border-top: 1px solid #e5e7eb; }
        .doctor-description { color: #374151; margin-bottom: 1rem; }
        .footer { background: #111827; color: white; padding: 2rem 0; text-align: center; }
        .footer-logo { display: flex; align-items: center; justify-content: center; margin-bottom: 1rem; }
        .footer-logo-icon { width: 32px; height: 32px; background: #2563eb; border-radius: 50%; margin-right: 12px; }
        .footer-logo-text { font-size: 20px; font-weight: bold; }
        .footer-text { color: #9ca3af; }
        @media (max-width: 768px) {
            .hero h1 { font-size: 2.5rem; }
            .doctor-header { flex-direction: column; text-align: center; }
            .doctor-price { text-align: center; }
        }
    </style>
</head>
<body>
    <nav class="nav">
        <div class="container">
            <div class="nav-content">
                <div class="logo">
                    <div class="logo-icon"></div>
                    <span class="logo-text">OnCall Clinic</span>
                </div>
                <div class="nav-buttons">
                    <a href="#doctors" class="btn btn-primary">Encontrar Doctor</a>
                    <a href="#login" class="btn btn-ghost">Iniciar Sesión</a>
                </div>
            </div>
        </div>
    </nav>
    <section class="hero">
        <div class="container">
            <h1>Atención médica a domicilio</h1>
            <p>Atención médica profesional cuando la necesites, en la comodidad de tu hogar</p>
            <a href="#doctors" class="btn btn-hero">Buscar Doctor Ahora</a>
        </div>
    </section>
    <section class="benefits">
        <div class="container">
            <h2 class="section-title">¿Por qué elegir OnCall Clinic?</h2>
            <div class="benefits-grid">
                <div class="benefit-item">
                    <div class="benefit-icon"><div class="benefit-icon-inner"></div></div>
                    <h3 class="benefit-title">Respuesta Rápida</h3>
                    <p class="benefit-text">Atención médica en casa en menos de 1 hora</p>
                </div>
                <div class="benefit-item">
                    <div class="benefit-icon"><div class="benefit-icon-inner"></div></div>
                    <h3 class="benefit-title">Pago Seguro</h3>
                    <p class="benefit-text">Sistema de pago en línea seguro y confiable</p>
                </div>
                <div class="benefit-item">
                    <div class="benefit-icon"><div class="benefit-icon-inner"></div></div>
                    <h3 class="benefit-title">Seguimiento en Tiempo Real</h3>
                    <p class="benefit-text">Rastrea la ubicación de tu doctor en tiempo real</p>
                </div>
                <div class="benefit-item">
                    <div class="benefit-icon"><div class="benefit-icon-inner"></div></div>
                    <h3 class="benefit-title">Doctores Verificados</h3>
                    <p class="benefit-text">Todos los doctores están verificados y licenciados</p>
                </div>
            </div>
        </div>
    </section>
    <section id="doctors" class="doctors">
        <div class="container">
            <h2 class="section-title">Doctores Disponibles</h2>
            <div class="doctor-card">
                <div class="doctor-header">
                    <div class="doctor-avatar"><div class="benefit-icon-inner"></div></div>
                    <div class="doctor-info">
                        <h3 class="doctor-name">Dr. María González</h3>
                        <p class="doctor-specialty">Medicina General</p>
                        <p class="doctor-education">Título Médico, Universidad Nacional</p>
                        <div class="doctor-rating">
                            <span class="stars">★★★★★</span>
                            <span class="rating-text">4.8 calificación</span>
                        </div>
                    </div>
                    <div class="doctor-price">
                        <p class="price">$80</p>
                        <p class="price-text">por visita</p>
                        <span class="status-badge">Disponible Ahora</span>
                    </div>
                </div>
                <div class="doctor-footer">
                    <p class="doctor-description">Médico general con amplia experiencia en atención médica domiciliaria</p>
                    <a href="#booking" class="btn btn-primary">Reservar Cita</a>
                </div>
            </div>
        </div>
    </section>
    <footer class="footer">
        <div class="container">
            <div class="footer-logo">
                <div class="footer-logo-icon"></div>
                <span class="footer-logo-text">OnCall Clinic</span>
            </div>
            <p class="footer-text">Atención médica profesional a domicilio. Disponible las 24 horas.</p>
        </div>
    </footer>
</body>
</html>`;
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
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
    
    // await setupVite(app, server); // Disabled to show static content
  }

  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(port, "0.0.0.0", () => {
    log(`Server running at http://0.0.0.0:${port} in ${process.env.NODE_ENV || "development"} mode`);
  });
}

main().catch(console.error);
