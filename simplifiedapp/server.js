const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// API de prueba para comprobar la salud del sistema
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: 'alpha-0.9.5',
    mode: 'SANDBOX',
    environment: {
      node: process.version,
      platform: process.platform
    },
    services: {
      database: 'simulated',
      authentication: 'active',
      maps: 'sandbox'
    },
    coverage: {
      area: 'Ibiza, Islas Baleares',
      coordinates: {
        lat: 38.9067,
        lng: 1.4206
      }
    }
  });
});

// Punto de entrada principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar el servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor simplificado ejecutándose en http://0.0.0.0:${PORT}`);
});