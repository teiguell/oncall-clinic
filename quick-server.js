import express from 'express';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 5000;

// CORS headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

// Basic API route
app.get('/api/doctors/available', (req, res) => {
  res.json([{
    id: 1,
    userId: 2,
    specialtyId: 1,
    licenseNumber: "MD-ALPHA-TEST",
    education: "Universidad Complutense de Madrid - Medicina",
    experience: 15,
    bio: "Dr Test Alpha - Médico especialista disponible 24/7 en toda España. Amplia experiencia en medicina general y atención domiciliaria. Verificado y activo para consultas de emergencia y rutinarias.",
    basePrice: 60,
    isAvailable: true,
    isVerified: true,
    bankAccount: "ES21 1234 5678 9012 3456 7890",
    locationLat: 40.4168,
    locationLng: -3.7038,
    locationAddress: "España - Disponible en todas las comunidades autónomas",
    createdAt: new Date().toISOString()
  }]);
});

// Serve main page
app.get('/', (req, res) => {
  res.send(`
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
        .button:hover { background: #1d4ed8; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; }
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
            <button class="button" onclick="alert('Sistema de reservas disponible. Dr Test Alpha verificado y listo para consultas.')">Reservar Cita</button>
        </div>
        
        <div class="footer">
            <button class="button" onclick="window.location.href='/login'">Login Pacientes</button>
            <button class="button" onclick="window.location.href='/doctor-login'">Login Médicos</button>
            <button class="button" onclick="window.location.href='/legal/privacy-policy-es'">Política de Privacidad</button>
            <button class="button" onclick="window.location.href='/legal/terms-of-use-es'">Términos de Uso</button>
        </div>
    </div>
    
    <button class="admin-btn" onclick="adminAccess()">🛡️</button>
    
    <script>
        function adminAccess() {
            const password = prompt('Contraseña de administrador:');
            if (password === 'Pepillo2727#') {
                window.location.href = '/admin';
            } else if (password) {
                alert('Contraseña incorrecta');
            }
        }
    </script>
</body>
</html>
  `);
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`OnCall Clinic server started successfully`);
});