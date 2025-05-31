import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import path from 'path';
import { 
  insertUserSchema, 
  insertPatientProfileSchema, 
  insertDoctorProfileSchema,
  insertLocationSchema,
  insertAppointmentSchema,
  insertReviewSchema,
  insertPaymentSchema,
  insertVerificationCodeSchema,
  weeklyAvailabilitySchema,
  doctorRegistrationSchema,
  doctorVerificationSchema,
  patientRegistrationSchema,
  verifyCodeSchema,
  loginSchema,
  guestPatientSchema
} from "@shared/schema";
import { z } from "zod";
import crypto from "crypto";
import { WebSocketServer, WebSocket } from "ws";
import path from "path";
import session from "express-session";
import MemoryStore from "memorystore";
import { IS_SANDBOX, TEST_DOCTOR, TEST_DOCTOR_AVAILABILITY, isWithinAllowedArea } from "./sandbox/config";

// Import Twilio for SMS
import twilio from 'twilio';
// Import SendGrid for email
import sgMail from '@sendgrid/mail';

// Initialize Twilio
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

// Define doctor search schema
const doctorSearchSchema = z.object({
  lat: z.number().optional(),
  lng: z.number().optional(),
  distance: z.number().optional().default(10),
  specialtyId: z.number().optional(),
  available: z.boolean().optional(),
  verified: z.boolean().optional().default(true),
});

// Almacenamiento de verificación temporal para código de registro
const verificationCodes = new Map<string, {code: string, email: string}>();

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function generateSessionId(): string {
  return crypto.randomBytes(32).toString('hex');
}

async function isAuthenticated(req: Request, res: Response): Promise<{userId: number, userType: string} | null> {
  // Check session authentication
  if (!req.session || !req.session.user) {
    res.status(401).json({ message: "No session or unauthenticated session" });
    return null;
  }
  
  return {
    userId: req.session.user.id,
    userType: req.session.user.userType
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Doctor Login Page
  app.get('/doctor', (req, res) => {
    res.sendFile(path.resolve(process.cwd(), 'doctor-dashboard.html'));
  });

  // Clean OnCall Clinic page without Vite interference
  app.get('/app', (req, res) => {
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
        .logo-svg { height: 35px; width: auto; margin-right: 12px; }
        .logo-text { font-size: 24px; font-weight: bold; color: #111827; }
        .nav-buttons { display: flex; gap: 1rem; }
        .btn { padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; font-weight: 500; text-decoration: none; display: inline-block; }
        .btn-primary { background: #2563eb; color: white; }
        .btn-ghost { background: transparent; color: #374151; }
        .hero { 
            background: linear-gradient(135deg, rgba(37, 99, 235, 0.95) 0%, rgba(29, 78, 216, 0.95) 50%, rgba(30, 64, 175, 0.95) 100%),
                        url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800"><defs><radialGradient id="pulse1" cx="50%" cy="50%" r="50%"><stop offset="0%" style="stop-color:rgba(255,255,255,0.1);stop-opacity:1" /><stop offset="100%" style="stop-color:rgba(255,255,255,0);stop-opacity:0" /></radialGradient><radialGradient id="pulse2" cx="20%" cy="30%" r="30%"><stop offset="0%" style="stop-color:rgba(99,179,237,0.2);stop-opacity:1" /><stop offset="100%" style="stop-color:rgba(99,179,237,0);stop-opacity:0" /></radialGradient></defs><rect width="1200" height="800" fill="url(%23pulse1)"/><circle cx="240" cy="240" r="120" fill="url(%23pulse2)" opacity="0.6"><animate attributeName="r" values="120;140;120" dur="4s" repeatCount="indefinite"/></circle><circle cx="960" cy="160" r="80" fill="url(%23pulse2)" opacity="0.4"><animate attributeName="r" values="80;100;80" dur="3s" repeatCount="indefinite"/></circle><circle cx="600" cy="400" r="100" fill="url(%23pulse1)" opacity="0.3"><animate attributeName="r" values="100;120;100" dur="5s" repeatCount="indefinite"/></circle><path d="M0,400 Q300,300 600,400 T1200,400 L1200,800 L0,800 Z" fill="rgba(255,255,255,0.03)"><animateTransform attributeName="transform" type="translate" values="0,0;-100,10;0,0" dur="8s" repeatCount="indefinite"/></path></svg>');
            background-size: cover;
            background-position: center;
            color: white; 
            padding: 8rem 0; 
            text-align: center; 
            position: relative;
            overflow: hidden;
            min-height: 100vh;
            display: flex;
            align-items: center;
        }
        .hero::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: 
                radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.15) 0%, transparent 50%),
                radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.1) 0%, transparent 50%);
            animation: pulse 6s ease-in-out infinite alternate;
        }
        @keyframes pulse {
            0% { opacity: 0.5; }
            100% { opacity: 1; }
        }
        .hero-content { position: relative; z-index: 1; }
        .hero h1 { 
            font-size: 4.5rem; 
            font-weight: 900; 
            margin-bottom: 1rem; 
            line-height: 1.1; 
            background: linear-gradient(45deg, #ffffff, #fbbf24, #ffffff);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            animation: textGlow 3s ease-in-out infinite alternate;
            text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        }
        @keyframes textGlow {
            0% { filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.5)); }
            100% { filter: drop-shadow(0 0 25px rgba(251, 191, 36, 0.8)); }
        }
        .hero-subtitle {
            font-size: 1.3rem;
            font-weight: 600;
            color: #fbbf24;
            margin-bottom: 1.5rem;
            text-transform: uppercase;
            letter-spacing: 2px;
        }
        .hero p { 
            font-size: 1.5rem; 
            margin-bottom: 2rem; 
            opacity: 0.95; 
            max-width: 750px; 
            margin-left: auto; 
            margin-right: auto; 
            line-height: 1.7;
            font-weight: 300;
        }
        .hero-stats {
            display: flex;
            justify-content: center;
            gap: 4rem;
            margin: 3rem 0;
            flex-wrap: wrap;
        }
        .hero-stat {
            text-align: center;
            color: white;
        }
        .hero-stat-number {
            font-size: 3rem;
            font-weight: 900;
            color: #fbbf24;
            display: block;
            line-height: 1;
        }
        .hero-stat-label {
            font-size: 0.9rem;
            opacity: 0.9;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-top: 0.5rem;
        }
        .hero-buttons { 
            display: flex; 
            gap: 1.5rem; 
            justify-content: center; 
            flex-wrap: wrap;
            margin-top: 3rem;
        }
        .btn-hero { 
            padding: 1.2rem 3rem; 
            font-size: 1.2rem; 
            border-radius: 50px; 
            font-weight: 700; 
            text-decoration: none; 
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            transition: all 0.4s ease;
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
            position: relative;
            overflow: hidden;
        }
        .btn-hero::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
            transition: left 0.6s;
        }
        .btn-hero:hover::before {
            left: 100%;
        }
        .btn-hero-primary { 
            background: linear-gradient(45deg, #fbbf24, #f59e0b);
            color: #1e40af; 
            border: none;
        }
        .btn-hero-primary:hover { 
            transform: translateY(-3px) scale(1.05); 
            box-shadow: 0 15px 40px rgba(251, 191, 36, 0.4);
        }
        .btn-hero-secondary { 
            background: linear-gradient(45deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05)); 
            color: white; 
            border: 2px solid rgba(255, 255, 255, 0.3);
            backdrop-filter: blur(10px);
        }
        .btn-hero-secondary:hover { 
            background: linear-gradient(45deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1)); 
            border-color: white;
            transform: translateY(-3px) scale(1.05);
        }
        .benefits { 
            padding: 6rem 0; 
            background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%); 
        }
        .section-title { 
            font-size: 3rem; 
            font-weight: 800; 
            text-align: center; 
            margin-bottom: 4rem; 
            color: #111827;
            background: linear-gradient(135deg, #111827, #374151);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        .benefits-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); 
            gap: 3rem; 
        }
        .benefit-item { 
            text-align: center; 
            padding: 2.5rem 2rem;
            background: white;
            border-radius: 20px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.08);
            transition: all 0.3s ease;
            border: 1px solid #f1f5f9;
        }
        .benefit-item:hover {
            transform: translateY(-10px);
            box-shadow: 0 20px 60px rgba(0,0,0,0.12);
        }
        .benefit-icon { 
            width: 80px; 
            height: 80px; 
            background: linear-gradient(135deg, #2563eb, #1d4ed8); 
            border-radius: 20px; 
            margin: 0 auto 1.5rem; 
            display: flex; 
            align-items: center; 
            justify-content: center;
            box-shadow: 0 8px 25px rgba(37, 99, 235, 0.3);
        }
        .benefit-icon svg {
            width: 40px;
            height: 40px;
            fill: white;
        }
        .benefit-title { 
            font-size: 1.5rem; 
            font-weight: 700; 
            margin-bottom: 1rem; 
            color: #111827;
        }
        .benefit-text { 
            color: #6b7280; 
            font-size: 1.1rem;
            line-height: 1.6;
        }
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
        .footer { 
            background: linear-gradient(135deg, #1f2937 0%, #111827 100%); 
            color: white; 
            padding: 4rem 0 2rem; 
        }
        .footer-content {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 3rem;
            margin-bottom: 3rem;
            max-width: 1200px;
            margin-left: auto;
            margin-right: auto;
        }
        .footer-section h4 {
            font-size: 1.2rem;
            font-weight: 600;
            margin-bottom: 1.5rem;
            color: #f9fafb;
        }
        .footer-links {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        .footer-links li {
            margin-bottom: 0.8rem;
        }
        .footer-links a {
            color: #d1d5db;
            text-decoration: none;
            transition: color 0.3s ease;
            font-size: 0.95rem;
        }
        .footer-links a:hover {
            color: #60a5fa;
        }
        .footer-logo { 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            gap: 0.5rem; 
            margin-bottom: 2rem; 
            padding-top: 2rem;
            border-top: 1px solid #374151;
        }
        .footer-logo-icon { 
            width: 32px; 
            height: 32px; 
            background: #2563eb; 
            border-radius: 50%; 
        }
        .footer-logo-text { 
            font-size: 1.25rem; 
            font-weight: 600; 
        }
        .footer-text { 
            color: #9ca3af; 
            text-align: center;
            margin-bottom: 1rem;
        }
        .footer-bottom {
            text-align: center;
            color: #6b7280;
            font-size: 0.9rem;
        }
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
                    <svg class="logo-svg" viewBox="0 0 200 40" xmlns="http://www.w3.org/2000/svg">
                        <!-- Medical pin icon -->
                        <g transform="translate(5,5)">
                            <path d="M15 3C10.03 3 6 7.03 6 12c0 7.5 9 17 9 17s9-9.5 9-17c0-4.97-4.03-9-9-9zm0 12.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z" fill="#2563eb"/>
                            <!-- Medical cross inside pin -->
                            <rect x="13.5" y="9" width="3" height="6" fill="white"/>
                            <rect x="11" y="11.5" width="8" height="1.5" fill="white"/>
                        </g>
                        <!-- Text -->
                        <text x="45" y="16" font-family="system-ui, sans-serif" font-size="14" font-weight="600" fill="#111827">OnCall</text>
                        <text x="45" y="30" font-family="system-ui, sans-serif" font-size="14" font-weight="600" fill="#111827">Clinic</text>
                    </svg>
                </div>
                <div class="nav-buttons">
                    <a href="/doctors" class="btn btn-primary">Encontrar Doctor</a>
                    <a href="/login" class="btn btn-ghost">Iniciar Sesión</a>
                </div>
            </div>
        </div>
    </nav>
    <section class="hero">
        <div class="container">
            <div class="hero-content">
                <h1>Tu Médico a Domicilio</h1>
                <p>Conectamos pacientes con médicos verificados para consultas médicas profesionales en la comodidad de tu hogar</p>
                
                <div class="hero-buttons">
                    <a href="/patient-register" class="btn-hero btn-hero-primary">Soy Paciente</a>
                    <a href="/doctor-register" class="btn-hero btn-hero-secondary">Soy Médico</a>
                </div>
            </div>
        </div>
    </section>
    <section class="benefits">
        <div class="container">
            <h2 class="section-title">¿Por qué elegir OnCall Clinic?</h2>
            <div class="benefits-grid">
                <div class="benefit-item">
                    <div class="benefit-icon">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </div>
                    <h3 class="benefit-title">Respuesta Rápida</h3>
                    <p class="benefit-text">Atención médica profesional en tu hogar en menos de 1 hora</p>
                </div>
                <div class="benefit-item">
                    <div class="benefit-icon">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" stroke-width="2"/>
                            <line x1="3" y1="9" x2="21" y2="9" stroke="currentColor" stroke-width="2"/>
                            <path d="M9 13H15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                    </div>
                    <h3 class="benefit-title">Pago Seguro</h3>
                    <p class="benefit-text">Sistema de pago en línea seguro y confiable con encriptación avanzada</p>
                </div>
                <div class="benefit-item">
                    <div class="benefit-icon">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                            <path d="M12 2A10 10 0 0 0 12 22" stroke="currentColor" stroke-width="2"/>
                            <path d="M2 12H22" stroke="currentColor" stroke-width="2"/>
                        </svg>
                    </div>
                    <h3 class="benefit-title">Seguimiento en Tiempo Real</h3>
                    <p class="benefit-text">Rastrea la ubicación de tu doctor en tiempo real hasta llegar a tu hogar</p>
                </div>
                <div class="benefit-item">
                    <div class="benefit-icon">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="currentColor" stroke-width="2"/>
                            <path d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z" stroke="currentColor" stroke-width="2"/>
                            <path d="M9 7L11 9L15 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </div>
                    <h3 class="benefit-title">Doctores Verificados</h3>
                    <p class="benefit-text">Todos los doctores están verificados, licenciados y certificados profesionalmente</p>
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
            <div class="footer-content">
                <div class="footer-section">
                    <h4>Servicios</h4>
                    <ul class="footer-links">
                        <li><a href="#doctors">Buscar Doctor</a></li>
                        <li><a href="#booking">Reservar Cita</a></li>
                        <li><a href="#emergency">Emergencias</a></li>
                        <li><a href="#specialties">Especialidades</a></li>
                    </ul>
                </div>
                <div class="footer-section">
                    <h4>Soporte</h4>
                    <ul class="footer-links">
                        <li><a href="#help">Centro de Ayuda</a></li>
                        <li><a href="#contact">Contacto</a></li>
                        <li><a href="#faq">Preguntas Frecuentes</a></li>
                        <li><a href="/clinic/doctors">Portal Médicos</a></li>
                    </ul>
                </div>
                <div class="footer-section">
                    <h4>Legal</h4>
                    <ul class="footer-links">
                        <li><a href="/legal/terms">Términos de Uso</a></li>
                        <li><a href="/legal/privacy">Política de Privacidad</a></li>
                        <li><a href="/legal/cookies">Política de Cookies</a></li>
                        <li><a href="/legal/refunds">Cancelaciones y Reembolsos</a></li>
                    </ul>
                </div>
            </div>
            <div class="footer-logo">
                <div class="footer-logo-icon"></div>
                <span class="footer-logo-text">OnCall Clinic</span>
            </div>
            <p class="footer-text">Plataforma de conexión para atención médica profesional a domicilio. Disponible las 24 horas.</p>
            <div class="footer-bottom">
                <p>&copy; 2025 OnCall Clinic. Todos los derechos reservados. | Registro Sanitario: ES-TEMP-2025</p>
            </div>
        </div>
    </footer>
</body>
</html>`;
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  });
  // Endpoint de diagnóstico general
  app.get('/api/diagnostics', (req, res) => {
    res.json({
      status: 'active',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      client: {
        ip: req.ip || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown',
        forwardedFor: req.headers['x-forwarded-for'] || 'none',
        host: req.headers.host || 'unknown'
      },
      corsHeaders: {
        origin: req.headers.origin || 'none',
        referer: req.headers.referer || 'none'
      }
    });
  });
  // Add a test route to check if the server is accessible
  app.get('/api/test', (req, res) => {
    res.json({ message: 'API is working properly!' });
  });

  // Google Maps API key endpoint
  app.get('/api/config/maps-key', (req, res) => {
    res.json({ apiKey: process.env.GOOGLE_MAPS_API_KEY });
  });

  // Doctor login endpoint
  app.post('/api/doctor/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ 
          success: false, 
          message: 'Email and password are required' 
        });
      }

      // Find user by email
      const user = await storage.getUserByEmail(email);
      if (!user || user.userType !== 'doctor') {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid credentials or not a doctor account' 
        });
      }

      // Verify password (simple comparison for testing)
      if (user.password !== password) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid credentials' 
        });
      }

      // Get doctor profile
      const doctorProfile = await storage.getDoctorProfileByUserId(user.id);
      if (!doctorProfile) {
        return res.status(404).json({ 
          success: false, 
          message: 'Doctor profile not found' 
        });
      }

      // Create session
      (req.session as any).userId = user.id;
      (req.session as any).userType = user.userType;

      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          userType: user.userType
        },
        profile: doctorProfile
      });

    } catch (error) {
      console.error('Doctor login error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error during login'
      });
    }
  });

  // Doctor dashboard data endpoint
  app.get('/api/doctor/dashboard', async (req, res) => {
    try {
      // Check if doctor is authenticated
      if (!(req.session as any).userId || (req.session as any).userType !== 'doctor') {
        return res.status(401).json({ 
          success: false, 
          message: 'Authentication required' 
        });
      }

      const doctorProfile = await storage.getDoctorProfileByUserId((req.session as any).userId);
      if (!doctorProfile) {
        return res.status(404).json({ 
          success: false, 
          message: 'Doctor profile not found' 
        });
      }

      // Get doctor appointments
      const appointments = await storage.getAppointmentsByDoctorId((req.session as any).userId);
      
      // Get earnings data
      const earnings = await storage.getDoctorEarnings((req.session as any).userId);

      // Calculate stats
      const totalAppointments = appointments.length;
      const todayAppointments = appointments.filter(apt => {
        const today = new Date();
        const aptDate = new Date(apt.appointmentDate);
        return aptDate.toDateString() === today.toDateString();
      }).length;

      const thisWeekAppointments = appointments.filter(apt => {
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const aptDate = new Date(apt.appointmentDate);
        return aptDate >= oneWeekAgo && aptDate <= now;
      }).length;

      res.json({
        success: true,
        profile: doctorProfile,
        stats: {
          totalAppointments,
          todayAppointments,
          thisWeekAppointments,
          averageRating: doctorProfile.averageRating || 0,
          totalEarnings: earnings?.totalEarnings || 0,
          pendingEarnings: earnings?.pendingEarnings || 0
        },
        recentAppointments: appointments.slice(0, 5) // Last 5 appointments
      });

    } catch (error) {
      console.error('Dashboard error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error loading dashboard'
      });
    }
  });

  // SMS verification endpoint
  app.post('/api/verify-phone', async (req, res) => {
    try {
      const { phone, name, email } = req.body;
      
      if (!phone || !name || !email) {
        return res.status(400).json({ 
          success: false, 
          message: 'Phone, name and email are required' 
        });
      }

      // Generate verification code and tracking code
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      const trackingCode = 'OC' + Date.now().toString().slice(-6);
      
      // Send SMS via Twilio
      try {
        await twilioClient.messages.create({
          body: `OnCall Clinic verification code: ${verificationCode}. Your tracking code: ${trackingCode}`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: phone
        });

        // Send confirmation email via SendGrid
        try {
          const msg = {
            to: email,
            from: 'noreply@oncallclinic.com',
            subject: 'OnCall Clinic - Appointment Confirmation',
            html: `
              <h2>Appointment Confirmation</h2>
              <p>Dear ${name},</p>
              <p>Your appointment request has been received.</p>
              <p><strong>Verification Code:</strong> ${verificationCode}</p>
              <p><strong>Tracking Code:</strong> ${trackingCode}</p>
              <p>A doctor will contact you shortly to confirm the appointment details.</p>
              <p>Thank you for choosing OnCall Clinic.</p>
            `
          };
          
          await sgMail.send(msg);
        } catch (emailError) {
          console.error('Email sending failed:', emailError);
          // Continue even if email fails
        }

        res.json({
          success: true,
          code: verificationCode,
          trackingCode: trackingCode,
          message: 'SMS sent successfully'
        });

      } catch (smsError) {
        console.error('SMS sending failed:', smsError);
        res.status(500).json({
          success: false,
          message: 'Failed to send SMS verification'
        });
      }

    } catch (error) {
      console.error('Verification error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error during verification'
      });
    }
  });
  
  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok',
      serverTime: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: 'alpha-0.9.5',
      mode: 'SANDBOX',
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

  // Extended server info endpoint
  app.get('/api/server-info', (req, res) => {
    res.json({
      status: 'active',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: 'alpha-0.9.5',
      nodeVersion: process.version,
      platform: process.platform,
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime(),
      client: {
        ip: req.ip || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown',
        forwardedFor: req.headers['x-forwarded-for'] || 'none',
        host: req.headers.host || 'unknown',
        language: req.headers['accept-language'] || 'unknown'
      },
      application: {
        mode: 'SANDBOX',
        features: {
          auth: true,
          websockets: true,
          maps: true,
          payments: false,
          adminPanel: false
        }
      }
    });
  });

  // Add a route to check sandbox status
  app.get('/api/sandbox/status', (req, res) => {
    res.json({
      isSandbox: IS_SANDBOX,
      allowedArea: IS_SANDBOX ? {
        name: "Islas Baleares",
        bounds: {
          northeast: { lat: 40.1395, lng: 4.3275 },
          southwest: { lat: 38.6424, lng: 1.1558 }
        }
      } : null
    });
  });

  // Add a test html page to check if the server can serve static content
  app.get('/test', (req, res) => {
    res.sendFile(path.resolve(process.cwd(), 'client/public/test.html'));
  });
  
  // Add a new basic test page (no React)
  app.get('/test-basic', (req, res) => {
    res.sendFile(path.resolve(process.cwd(), 'client/public/test-basic.html'));
  });
  
  // Easy to remember diagnostic route
  app.get('/diagnostico', (req, res) => {
    res.sendFile(path.resolve(process.cwd(), 'client/public/diagnostico.html'));
  });
  
  // Emergency access route (bypasses React completely)
  app.get('/emergency', (req, res) => {
    res.sendFile(path.resolve(process.cwd(), 'index.html'));
  });
  
  // Add a WebSocket test page
  app.get('/ws-test', (req, res) => {
    res.sendFile(path.resolve(process.cwd(), 'client/public/websocket-test.html'));
  });
  
  // Simple React App route (SimpleApp.tsx)
  app.get('/SimpleApp', (req, res) => {
    res.sendFile(path.resolve(process.cwd(), 'index.html'));
  });

  const httpServer = createServer(app);
  
  // Setup express-session with memorystore
  const MemoryStoreSession = MemoryStore(session);
  const sessionStore = new MemoryStoreSession({
    checkPeriod: 86400000 // prune expired entries every 24h
  });

  app.use(session({
    store: sessionStore,
    secret: 'medical-app-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // set to true if using https
      maxAge: 1000 * 60 * 60 * 24 // 24 hours
    }
  }));
  
  // Create WebSocket server with specific path to avoid conflict with Vite HMR
  const wss = new WebSocketServer({ 
    server: httpServer, 
    path: '/ws' 
  });
  
  // Keep track of connections by userId for more reliable message delivery
  const connectedClients = new Map<number, Set<WebSocket>>();
  
  // Ping interval to keep connections alive (30 seconds)
  const pingInterval = setInterval(() => {
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.ping();
      }
    });
  }, 30000);
  
  // WebSocket for real-time notifications
  wss.on('connection', (ws, req) => {
    console.log('WebSocket connection established');
    
    // Parse the URL to get token (userId)
    const url = new URL(req.url || '', `http://${req.headers.host}`);
    const token = url.searchParams.get('token');
    
    // If token is provided (userId), authenticate immediately
    if (token && !isNaN(parseInt(token))) {
      const userId = parseInt(token);
      (ws as any).userId = userId;
      
      // Get user info from storage if needed
      storage.getUser(userId).then(user => {
        if (user) {
          (ws as any).userType = user.userType;
          
          // Add to connected clients map
          if (!connectedClients.has(userId)) {
            connectedClients.set(userId, new Set());
          }
          connectedClients.get(userId)?.add(ws);
          
          console.log(`User ${userId} (${user.userType}) authenticated with WebSocket via token`);
          
          // Send authentication success response
          ws.send(JSON.stringify({
            type: 'auth_response',
            success: true,
            message: 'Authentication successful',
            userId: userId,
            userType: user.userType
          }));
        }
      }).catch(err => {
        console.error('Error authenticating WebSocket user:', err);
      });
    }
    
    // Send a welcome message
    ws.send(JSON.stringify({
      type: 'system',
      message: 'Connected to Medical Services WebSocket Server'
    }));
    
    // Set a ping timeout to detect dead connections
    (ws as any).isAlive = true;
    ws.on('pong', () => {
      (ws as any).isAlive = true;
    });
    
    ws.on('message', (message) => {
      try {
        console.log('Received message:', message.toString());
        const data = JSON.parse(message.toString());
        
        // Legacy authentication (to be deprecated)
        if (data.type === 'auth' && data.userId) {
          const userId = parseInt(data.userId);
          
          if (!isNaN(userId)) {
            // Store userId in the websocket object
            (ws as any).userId = userId;
            
            // Get user info from storage
            storage.getUser(userId).then(user => {
              if (user) {
                (ws as any).userType = user.userType;
                
                // Add to connected clients map
                if (!connectedClients.has(userId)) {
                  connectedClients.set(userId, new Set());
                }
                connectedClients.get(userId)?.add(ws);
                
                console.log(`User ${userId} (${user.userType}) authenticated with WebSocket`);
                
                ws.send(JSON.stringify({
                  type: 'auth_response',
                  success: true,
                  message: 'Authentication successful',
                  userId: userId,
                  userType: user.userType
                }));
              } else {
                console.log('Invalid user ID for WebSocket authentication');
                ws.send(JSON.stringify({
                  type: 'auth_response',
                  success: false,
                  message: 'Invalid user ID'
                }));
              }
            }).catch(err => {
              console.error('Error authenticating WebSocket user:', err);
              ws.send(JSON.stringify({
                type: 'auth_response',
                success: false,
                message: 'Authentication error'
              }));
            });
          } else {
            console.log('Invalid user ID format for WebSocket authentication');
            ws.send(JSON.stringify({
              type: 'auth_response',
              success: false,
              message: 'Invalid user ID format'
            }));
          }
        }
        
        // Handle test messages
        if (data.type === 'test') {
          ws.send(JSON.stringify({
            type: 'test_response',
            message: `Echo: ${data.message || 'No message provided'}`,
            timestamp: new Date().toISOString()
          }));
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Invalid message format'
        }));
      }
    });
    
    ws.on('close', () => {
      console.log('WebSocket connection closed');
      
      // Remove from connected clients
      if ((ws as any).userId) {
        const userId = (ws as any).userId;
        const userConnections = connectedClients.get(userId);
        
        if (userConnections) {
          userConnections.delete(ws);
          if (userConnections.size === 0) {
            connectedClients.delete(userId);
          }
        }
      }
    });
    
    // Handle errors
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });
  
  // Interval to check for dead connections (every 45 seconds)
  const heartbeatInterval = setInterval(() => {
    wss.clients.forEach(ws => {
      if (!(ws as any).isAlive) {
        return ws.terminate();
      }
      
      (ws as any).isAlive = false;
    });
  }, 45000);
  
  // Helper function to send notifications
  const sendNotification = async (userId: number, notification: any) => {
    try {
      // Store notification in database
      const dbNotification = await storage.createNotification({
        userId,
        type: notification.type,
        content: notification.message,
        data: {
          appointmentId: notification.appointmentId,
          status: notification.status,
          timestamp: notification.timestamp || new Date().toISOString()
        }
      });
      
      // Send through WebSocket if user is connected
      // Using the connectedClients map for more reliable delivery
      const userConnections = connectedClients.get(userId);
      
      if (userConnections && userConnections.size > 0) {
        const notificationPayload = JSON.stringify(notification);
        
        userConnections.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(notificationPayload);
          }
        });
        
        console.log(`Notification sent to user ${userId} (${userConnections.size} connections)`);
      } else {
        console.log(`User ${userId} not connected, notification stored in database only`);
      }
      
      return dbNotification;
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  };
  
  // AUTH ROUTES
  
  // Register patient (new combined route for user + patient profile)
  app.post('/api/auth/patient/register', async (req, res) => {
    try {
      // Validate using the patient registration schema
      const patientData = patientRegistrationSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(patientData.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use" });
      }
      
      // Hash password
      const hashedPassword = hashPassword(patientData.password);
      
      // Create user with patient type
      const user = await storage.createUser({
        username: patientData.email.split('@')[0], // Generate username from email
        email: patientData.email,
        password: hashedPassword,
        userType: 'patient',
        firstName: patientData.firstName,
        lastName: patientData.lastName,
        phoneNumber: patientData.phoneNumber,
        emailVerified: false,
        twoFactorEnabled: false,
        profilePicture: null,
        authProvider: 'local',
        authProviderId: null
      });
      
      // Create patient profile
      if (patientData.address) {
        await storage.createPatientProfile({
          userId: user.id,
          address: patientData.address,
          city: patientData.city || '',
          postalCode: patientData.postalCode || '',
          dob: patientData.dob ? new Date(patientData.dob) : null,
          insuranceInfo: null,
          medicalHistory: null
        });
      }
      
      // Create verification code in database with 30 minute expiration
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 30);
      
      const verificationCode = generateVerificationCode();
      const verificationRecord = await storage.createVerificationCode({
        userId: user.id,
        code: verificationCode,
        type: 'signup',
        method: 'email',
        expiresAt
      });
      
      // In a real application, you would send an email with the code
      console.log(`Verification code for ${user.email}: ${verificationCode}`);
      
      res.status(201).json({ 
        message: "Patient registered successfully",
        verificationId: verificationRecord.id.toString(),
        userId: user.id,
        // Note: In a production app, we wouldn't return the code directly
        verificationCode
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      console.error("Registration error:", error);
      res.status(500).json({ message: "Server error during registration" });
    }
  });
  
  // Existing Register user (keeping for backward compatibility)
  app.post('/api/auth/register', async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use" });
      }
      
      // Hash password
      const hashedPassword = hashPassword(userData.password);
      
      // Create user
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword
      });
      
      // Generate verification code
      const verificationCode = generateVerificationCode();
      const verificationId = crypto.randomBytes(16).toString('hex');
      verificationCodes.set(verificationId, { code: verificationCode, email: user.email });
      
      // In a real application, you would send an email with the code
      console.log(`Verification code for ${user.email}: ${verificationCode}`);
      
      res.status(201).json({ 
        message: "User registered successfully",
        verificationId,
        // Note: In a production app, we wouldn't return the code directly
        verificationCode
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Server error during registration" });
    }
  });
  
  // Verify email with code
  app.post('/api/auth/verify-code', async (req, res) => {
    try {
      // Validate the verification data
      const verificationData = verifyCodeSchema.parse(req.body);
      
      // Extract verification ID and code
      const { verificationId, code } = verificationData;
      
      // Either convert to number or leave as string depending on how it was stored
      const verId = parseInt(verificationId);
      
      // Look for the verification record directly in the database
      // Get the user ID from the verification record (old method)
      const verification = parseInt(verificationId) ? null : verificationCodes.get(verificationId);
      
      if (verification) {
        // Old verification method
        if (verification.code !== code) {
          return res.status(400).json({ message: "Código de verificación inválido" });
        }
        
        // Get user by email and mark as verified
        const user = await storage.getUserByEmail(verification.email);
        if (user) {
          await storage.updateUser(user.id, { emailVerified: true });
        } else {
          return res.status(404).json({ message: "Usuario no encontrado" });
        }
        
        // Remove verification code
        verificationCodes.delete(verificationId);
        
        res.json({ message: "Correo electrónico verificado exitosamente" });
      } else {
        // Try new method with database stored verification
        // First find the user id associated with this verification code
        // We need to find all verification codes for all users and look for matching ID
        const foundUsers = await storage.getUser(verId);
        if (!foundUsers) {
          return res.status(400).json({ message: "ID de verificación inválido" });
        }
        
        // Find the valid verification code
        const verificationRecord = await storage.getVerificationCode(foundUsers.id, code, 'signup');
        
        if (!verificationRecord) {
          return res.status(400).json({ message: "Código de verificación inválido o expirado" });
        }
        
        // Mark email as verified
        await storage.updateUser(foundUsers.id, { emailVerified: true });
        
        // Mark verification code as used
        await storage.markVerificationCodeAsUsed(verificationRecord.id);
        
        res.json({ 
          message: "Correo electrónico verificado exitosamente",
          userId: foundUsers.id
        });
      }
    } catch (error) {
      console.error("Error during verification:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Datos de verificación inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Error del servidor durante la verificación" });
    }
  });
  
  // Legacy verify email route (keeping for backward compatibility)
  app.post('/api/auth/verify', async (req, res) => {
    try {
      const { userId, code, type = 'signup' } = req.body;
      
      // Buscar el código de verificación en la base de datos
      const verification = await storage.getVerificationCode(
        parseInt(userId), 
        code,
        type
      );
      
      if (!verification) {
        return res.status(400).json({ message: "Código de verificación inválido o expirado" });
      }
      
      // Verificar si el código ha expirado
      const now = new Date();
      if (verification.expiresAt && verification.expiresAt < now) {
        return res.status(400).json({ message: "El código de verificación ha expirado" });
      }
      
      // Marcar el usuario como verificado
      const user = await storage.getUser(verification.userId);
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
      
      // Actualizar el usuario y marcar como verificado
      await storage.updateUser(user.id, { emailVerified: true });
      
      // Marcar el código como usado
      await storage.markVerificationCodeAsUsed(verification.id);
      
      // Iniciar sesión automáticamente
      req.session.user = {
        id: user.id,
        userType: user.userType,
        emailVerified: true
      };
      
      // Obtener los datos de perfil según el tipo de usuario
      let profile = null;
      if (user.userType === 'patient') {
        profile = await storage.getPatientProfileByUserId(user.id);
      } else if (user.userType === 'doctor') {
        profile = await storage.getDoctorProfileByUserId(user.id);
      }
      
      // Devolver datos del usuario sin información sensible
      const { password: _, ...userWithoutPassword } = user;
      
      res.json({
        message: "Email verificado correctamente",
        user: userWithoutPassword,
        profile
      });
    } catch (error) {
      console.error("Error de verificación:", error);
      res.status(500).json({ message: "Error del servidor durante la verificación" });
    }
  });
  
  // Forgot password route
  app.post('/api/auth/forgot-password', async (req, res) => {
    try {
      const { email } = req.body;
      
      // Check if user exists
      const user = await storage.getUserByEmail(email);
      if (!user) {
        // For security reasons, don't reveal if email exists or not
        return res.status(200).json({ message: "If your email is registered, you will receive instructions to reset your password." });
      }
      
      // Create verification code in database with 30 minute expiration
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 30);
      
      const verificationCode = generateVerificationCode();
      const verificationRecord = await storage.createVerificationCode({
        userId: user.id,
        code: verificationCode,
        type: 'password_reset',
        method: 'email',
        expiresAt
      });
      
      // In a real application, you would send an email with the code
      console.log(`Password reset code for ${user.email}: ${verificationCode}`);
      
      res.status(200).json({ 
        message: "If your email is registered, you will receive instructions to reset your password.",
        // For development only, we return these values
        verificationId: verificationRecord.id.toString(),
        verificationCode
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Verify reset code
  app.post('/api/auth/verify-reset-code', async (req, res) => {
    try {
      const { verificationId, code } = req.body;
      
      // Convert to number if it's a numeric string
      const verId = parseInt(verificationId);
      
      // Find verification record
      const verification = isNaN(verId) ? null : await storage.getVerificationCode(verId, code, 'password_reset');
      
      if (!verification) {
        return res.status(400).json({ message: "Código de verificación inválido o expirado" });
      }
      
      // Check if code is expired
      if (verification.expiresAt < new Date()) {
        return res.status(400).json({ message: "El código de verificación ha expirado" });
      }
      
      // Check if code is already used
      if (verification.usedAt) {
        return res.status(400).json({ message: "Este código ya ha sido utilizado" });
      }
      
      // Return success without marking as used yet (will be marked as used when resetting password)
      res.json({ message: "Código verificado correctamente" });
    } catch (error) {
      console.error("Verify reset code error:", error);
      res.status(500).json({ message: "Error del servidor" });
    }
  });
  
  // Reset password
  app.post('/api/auth/reset-password', async (req, res) => {
    try {
      const { verificationId, code, password } = req.body;
      
      // Convert to number if it's a numeric string
      const verId = parseInt(verificationId);
      
      // Find verification record
      const verification = isNaN(verId) ? null : await storage.getVerificationCode(verId, code, 'password_reset');
      
      if (!verification) {
        return res.status(400).json({ message: "Código de verificación inválido o expirado" });
      }
      
      // Check if code is expired
      if (verification.expiresAt < new Date()) {
        return res.status(400).json({ message: "El código de verificación ha expirado" });
      }
      
      // Check if code is already used
      if (verification.usedAt) {
        return res.status(400).json({ message: "Este código ya ha sido utilizado" });
      }
      
      // Update user password
      const user = await storage.getUser(verification.userId);
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
      
      // Hash new password
      const hashedPassword = hashPassword(password);
      
      // Update user password
      await storage.updateUser(user.id, { password: hashedPassword });
      
      // Mark verification code as used
      await storage.markVerificationCodeAsUsed(verification.id);
      
      res.json({ message: "Contraseña actualizada correctamente" });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ message: "Error del servidor" });
    }
  });
  
  // Resend reset code
  app.post('/api/auth/resend-reset-code', async (req, res) => {
    try {
      const { email } = req.body;
      
      // Check if user exists
      const user = await storage.getUserByEmail(email);
      if (!user) {
        // For security reasons, don't reveal if email exists or not
        return res.status(200).json({ message: "Si su correo está registrado, recibirá instrucciones para restablecer su contraseña." });
      }
      
      // Create verification code in database with 30 minute expiration
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 30);
      
      const verificationCode = generateVerificationCode();
      const verificationRecord = await storage.createVerificationCode({
        userId: user.id,
        code: verificationCode,
        type: 'password_reset',
        method: 'email',
        expiresAt
      });
      
      // In a real application, you would send an email with the code
      console.log(`New password reset code for ${user.email}: ${verificationCode}`);
      
      res.status(200).json({ 
        message: "Si su correo está registrado, recibirá instrucciones para restablecer su contraseña.",
        // For development only, we return these values
        verificationId: verificationRecord.id.toString(),
        verificationCode
      });
    } catch (error) {
      console.error("Resend reset code error:", error);
      res.status(500).json({ message: "Error del servidor" });
    }
  });
  
  // OAuth login
  app.post('/api/auth/oauth-login', async (req, res) => {
    try {
      // Importar el manejador de OAuth desde el módulo auth/oauth
      const { handleOAuthLogin } = await import('./auth/oauth');
      await handleOAuthLogin(req, res);
    } catch (error) {
      console.error('Error en OAuth login:', error);
      res.status(500).json({ 
        message: 'Error al procesar la autenticación con OAuth',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  });

  // Login
  app.post('/api/auth/login', async (req, res) => {
    try {
      // Validar los datos de inicio de sesión
      const loginData = loginSchema.parse(req.body);
      const { email, password, remember } = loginData;
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Credenciales inválidas" });
      }
      
      // Verificar la contraseña
      const hashedPassword = hashPassword(password);
      if (user.password !== hashedPassword) {
        return res.status(401).json({ message: "Credenciales inválidas" });
      }
      
      // Verificar si el email está verificado
      if (!user.emailVerified) {
        // Si el email no está verificado, verificamos si tiene un código de verificación activo
        // Si no tiene un código activo, se genera uno nuevo
        let verificationCode;
        
        // Generar nuevo código
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 30);
        
        const code = generateVerificationCode();
        const verificationRecord = await storage.createVerificationCode({
          userId: user.id,
          code,
          type: 'signup',
          method: 'email',
          expiresAt
        });
        
        console.log(`Código de verificación para ${user.email}: ${code}`);
        
        return res.status(403).json({ 
          message: "Correo electrónico no verificado", 
          verificationId: verificationRecord.id.toString(),
          userId: user.id,
          verificationCode: code // En producción no sería enviado directamente
        });
      }
      
      // Si se requiere 2FA y está habilitado
      if (user.twoFactorEnabled) {
        // Generate 2FA code and store it
        // For demonstration purposes we're just showing how this would work
        const twoFactorCode = generateVerificationCode();
        
        // Store verification code with 10 minute expiration
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 10);
        
        const verificationRecord = await storage.createVerificationCode({
          userId: user.id,
          code: twoFactorCode,
          type: 'login',
          method: 'email',
          expiresAt
        });
        
        console.log(`Código 2FA para ${user.email}: ${twoFactorCode}`);
        
        return res.status(200).json({
          message: "Se requiere verificación de dos factores",
          verificationId: verificationRecord.id.toString(),
          requiresTwoFactor: true,
          // Note: In a production app, we wouldn't return the code directly
          twoFactorCode: twoFactorCode
        });
      }
      
      // Almacenar información del usuario en la sesión
      req.session.user = {
        id: user.id, 
        userType: user.userType,
        emailVerified: user.emailVerified
      };
      
      // Obtener los datos de perfil según el tipo de usuario
      let profile = null;
      if (user.userType === 'patient') {
        profile = await storage.getPatientProfileByUserId(user.id);
      } else if (user.userType === 'doctor') {
        profile = await storage.getDoctorProfileByUserId(user.id);
      }
      
      // Devolver datos del usuario sin información sensible
      const { password: _, ...userWithoutPassword } = user;
      
      res.json({
        message: "Inicio de sesión exitoso",
        user: userWithoutPassword,
        profile
      });
    } catch (error) {
      console.error("Error de inicio de sesión:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Datos de inicio de sesión inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Error del servidor durante el inicio de sesión" });
    }
  });
  
  // Logout
  app.post('/api/auth/logout', async (req, res) => {
    // Destruir la sesión si existe
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          console.error('Error destroying session:', err);
          return res.status(500).json({ message: "Error al cerrar sesión" });
        }
        
        res.clearCookie('connect.sid'); // Limpiar cookie de sesión
        res.json({ message: "Sesión cerrada correctamente" });
      });
    } else {
      res.json({ message: "No hay sesión activa" });
    }
  });
  
  // Get current user
  app.get('/api/auth/me', async (req, res) => {
    const auth = await isAuthenticated(req, res);
    if (!auth) return;
    
    try {
      const user = await storage.getUser(auth.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get profile data based on user type
      let profile = null;
      if (user.userType === 'patient') {
        profile = await storage.getPatientProfileByUserId(user.id);
      } else if (user.userType === 'doctor') {
        profile = await storage.getDoctorProfileByUserId(user.id);
      }
      
      // Return user data without sensitive information
      const { password, ...userWithoutPassword } = user;
      
      res.json({
        user: userWithoutPassword,
        profile
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Error del servidor" });
    }
  });
  
  // PATIENT PROFILE ROUTES
  
  // Create patient profile
  app.post('/api/patients/profile', async (req, res) => {
    const auth = await isAuthenticated(req, res);
    if (!auth) return;
    
    try {
      if (auth.userType !== 'patient') {
        return res.status(403).json({ message: "Only patients can create a patient profile" });
      }
      
      const profileData = insertPatientProfileSchema.parse({
        ...req.body,
        userId: auth.userId
      });
      
      // Check if profile already exists
      const existingProfile = await storage.getPatientProfileByUserId(auth.userId);
      if (existingProfile) {
        return res.status(400).json({ message: "Patient profile already exists" });
      }
      
      const profile = await storage.createPatientProfile(profileData);
      
      res.status(201).json(profile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Server error creating patient profile" });
    }
  });
  
  // Get patient profile
  app.get('/api/patients/profile', async (req, res) => {
    const auth = await isAuthenticated(req, res);
    if (!auth) return;
    
    try {
      const profile = await storage.getPatientProfileByUserId(auth.userId);
      if (!profile) {
        return res.status(404).json({ message: "Patient profile not found" });
      }
      
      res.json(profile);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // DOCTOR PROFILE ROUTES
  
  // Create doctor profile
  app.post('/api/doctors/profile', async (req, res) => {
    const auth = await isAuthenticated(req, res);
    if (!auth) return;
    
    try {
      if (auth.userType !== 'doctor') {
        return res.status(403).json({ message: "Only doctors can create a doctor profile" });
      }
      
      const profileData = insertDoctorProfileSchema.parse({
        ...req.body,
        userId: auth.userId
      });
      
      // Check if profile already exists
      const existingProfile = await storage.getDoctorProfileByUserId(auth.userId);
      if (existingProfile) {
        return res.status(400).json({ message: "Doctor profile already exists" });
      }
      
      const profile = await storage.createDoctorProfile(profileData);
      
      res.status(201).json(profile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Server error creating doctor profile" });
    }
  });
  
  // Get doctor profile
  app.get('/api/doctors/profile', async (req, res) => {
    const auth = await isAuthenticated(req, res);
    if (!auth) return;
    
    try {
      const profile = await storage.getDoctorProfileByUserId(auth.userId);
      if (!profile) {
        return res.status(404).json({ message: "Doctor profile not found" });
      }
      
      res.json(profile);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Update doctor availability
  app.put('/api/availability', async (req, res) => {
    const auth = await isAuthenticated(req, res);
    if (!auth) return;
    
    try {
      if (auth.userType !== 'doctor') {
        return res.status(403).json({ message: "Only doctors can update availability" });
      }
      
      const { available } = req.body;
      if (typeof available !== 'boolean') {
        return res.status(400).json({ message: "Availability status must be a boolean value" });
      }
      
      // Get doctor profile
      const doctorProfile = await storage.getDoctorProfileByUserId(auth.userId);
      if (!doctorProfile) {
        return res.status(404).json({ message: "Doctor profile not found" });
      }
      
      // Update availability
      const updatedProfile = await storage.updateDoctorProfile(doctorProfile.id, {
        isAvailable: available
      });
      
      if (!updatedProfile) {
        return res.status(500).json({ message: "Failed to update availability" });
      }
      
      // Get doctor details for notification
      const doctor = await storage.getUser(auth.userId);
      
      // Broadcast a system notification to all connected clients
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'doctor_availability',
            doctorId: doctorProfile.id,
            doctorName: doctor ? `${doctor.firstName} ${doctor.lastName}` : `Dr. ${doctorProfile.id}`,
            available,
            specialtyId: doctorProfile.specialtyId,
            timestamp: Date.now()
          }));
        }
      });
      
      // Send a notification to the doctor
      await sendNotification(auth.userId, {
        type: 'system',
        message: available ? 'You are now available for appointments' : 'You are no longer available',
        timestamp: Date.now()
      });
      
      res.json({ 
        message: available ? "Availability updated to available" : "Availability updated to unavailable",
        profile: updatedProfile
      });
    } catch (error) {
      console.error('Error updating availability:', error);
      res.status(500).json({ message: "Server error updating availability" });
    }
  });
  
  // Update doctor weekly availability
  app.put('/api/weekly-availability', async (req, res) => {
    const auth = await isAuthenticated(req, res);
    if (!auth) return;
    
    try {
      if (auth.userType !== 'doctor') {
        return res.status(403).json({ message: "Only doctors can update weekly availability" });
      }
      
      // Validate the weekly availability data
      const weeklyAvailability = weeklyAvailabilitySchema.parse(req.body);
      
      // Get doctor profile
      const doctorProfile = await storage.getDoctorProfileByUserId(auth.userId);
      if (!doctorProfile) {
        return res.status(404).json({ message: "Doctor profile not found" });
      }
      
      // Update weekly availability using the dedicated method
      const updatedProfile = await storage.updateDoctorWeeklyAvailability(auth.userId, weeklyAvailability);
      
      if (!updatedProfile) {
        return res.status(500).json({ message: "Failed to update weekly availability" });
      }
      
      // Get doctor details for notification
      const doctor = await storage.getUser(auth.userId);
      
      // Broadcast a system notification to all connected clients
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'doctor_weekly_availability_update',
            doctorId: doctorProfile.id,
            doctorName: doctor ? `${doctor.firstName} ${doctor.lastName}` : `Dr. ${doctorProfile.id}`,
            timestamp: Date.now()
          }));
        }
      });
      
      // Send a notification to the doctor
      await sendNotification(auth.userId, {
        type: 'system',
        message: 'Your weekly availability schedule has been updated',
        timestamp: Date.now()
      });
      
      res.json({ 
        message: "Weekly availability schedule updated successfully",
        profile: updatedProfile
      });
    } catch (error) {
      console.error('Error updating weekly availability:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid weekly availability data format", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ message: "Server error updating weekly availability" });
    }
  });
  
  // Get doctor by ID (public)
  app.get('/api/doctors/:id', async (req, res) => {
    try {
      const doctorId = parseInt(req.params.id);
      const doctorProfile = await storage.getDoctorProfile(doctorId);
      
      if (!doctorProfile) {
        return res.status(404).json({ message: "Doctor not found" });
      }
      
      // Get user data
      const user = await storage.getUser(doctorProfile.userId);
      if (!user) {
        return res.status(404).json({ message: "Doctor user not found" });
      }
      
      // Get specialty
      const specialty = await storage.getSpecialty(doctorProfile.specialtyId);
      
      // Get availability
      const availability = await storage.getAvailabilityByDoctorId(doctorProfile.id);
      
      // Get reviews
      const reviews = await storage.getReviewsByRevieweeId(doctorProfile.userId);
      
      // Format doctor data for client
      const { password, ...userWithoutPassword } = user;
      
      res.json({
        ...doctorProfile,
        user: userWithoutPassword,
        specialty,
        availability,
        reviews
      });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Search doctors
  app.get('/api/doctors', async (req, res) => {
    try {
      const specialtyId = req.query.specialty ? parseInt(req.query.specialty as string) : undefined;
      const isAvailable = req.query.available ? req.query.available === 'true' : undefined;
      const isVerified = req.query.verified ? req.query.verified === 'true' : true; // Default to verified doctors
      
      // Check if location parameters are provided
      const lat = req.query.lat ? parseFloat(req.query.lat as string) : undefined;
      const lng = req.query.lng ? parseFloat(req.query.lng as string) : undefined;
      const distance = req.query.distance ? parseFloat(req.query.distance as string) : 10; // Default 10km radius
      
      // Check if we're in SANDBOX mode
      const isSandbox = process.env.VITE_IS_SANDBOX === 'true';
      
      let doctors = [];
      
      if (isSandbox) {
        // In sandbox mode, we'll check if we're inside the allowed area
        if (lat !== undefined && lng !== undefined) {
          // Import from sandbox config
          const { isWithinAllowedArea, TEST_DOCTOR, calculateDistance } = await import('./sandbox/config');
          
          if (isWithinAllowedArea(lat, lng)) {
            // If we're in the allowed area, return our test doctor
            const testUser = await storage.getUser(TEST_DOCTOR.userId) || {
              id: TEST_DOCTOR.userId,
              firstName: "Dr. Simulado",
              lastName: "Pérez",
              email: "doctor.sandbox@oncall.clinic",
              phoneNumber: "+34600123456",
              password: "",
              userType: "doctor"
            };
            
            const specialty = await storage.getSpecialty(TEST_DOCTOR.specialtyId) || {
              id: TEST_DOCTOR.specialtyId,
              name: "Medicina General",
              description: "Atención médica primaria y general"
            };
            
            // Calculate distance to the test doctor
            const doctorDistance = calculateDistance(
              lat, 
              lng, 
              TEST_DOCTOR.locationLat || 39.5696, 
              TEST_DOCTOR.locationLng || 2.6502
            );
            
            doctors = [{
              ...TEST_DOCTOR,
              id: 1,
              distance: doctorDistance,
              firstName: testUser.firstName,
              lastName: testUser.lastName,
              email: testUser.email,
              phoneNumber: testUser.phoneNumber,
              specialty,
              isVerified: true
            }];
          } else {
            // Otherwise, return empty results
            doctors = [];
          }
        } else {
          // If no location provided in sandbox mode, return empty results
          doctors = [];
        }
      } else {
        // PRODUCTION MODE: normal search
        // If we have latitude and longitude, use location-based search
        if (lat !== undefined && lng !== undefined) {
          doctors = await storage.searchDoctorsByLocation(
            lat,
            lng,
            distance,
            specialtyId ? String(specialtyId) : undefined
          );
        } else {
          // Otherwise use regular search
          doctors = await storage.searchDoctors(specialtyId, isAvailable, isVerified);
        }
        
        // Enrich doctor profiles with user data
        const enrichedDoctors = await Promise.all(doctors.map(async (doctor) => {
          const user = await storage.getUser(doctor.userId);
          const specialty = await storage.getSpecialty(doctor.specialtyId);
          
          if (!user) return null;
          
          const { password, ...userWithoutPassword } = user;
          
          return {
            ...doctor,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            specialty,
            // Include distance if it was a location-based search
            ...(doctor.distance !== undefined && {distance: doctor.distance})
          };
        }));
        
        // Filter out null results
        doctors = enrichedDoctors.filter(doctor => doctor !== null);
      }
      
      res.json(doctors);
    } catch (error) {
      console.error("Error searching doctors:", error);
      res.status(500).json({ message: "Server error searching doctors" });
    }
  });
  
  // DOCTOR REGISTRATION AND VERIFICATION ROUTES
  
  // API de registro de médicos
  app.post('/api/doctor/register', async (req, res) => {
    try {
      // Validar datos de entrada con zod
      const validationResult = doctorRegistrationSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: 'Datos de registro inválidos',
          details: validationResult.error.format()
        });
      }
      
      const registrationData = validationResult.data;
      
      // Verificar si el email ya existe
      const existingUser = await storage.getUserByEmail(registrationData.email);
      if (existingUser) {
        return res.status(400).json({ error: 'El correo electrónico ya está registrado' });
      }
      
      // Crear usuario
      const hashedPassword = hashPassword(registrationData.password);
      const user = await storage.createUser({
        username: registrationData.email.split('@')[0],
        email: registrationData.email,
        password: hashedPassword,
        userType: 'doctor',
        firstName: registrationData.firstName,
        lastName: registrationData.lastName,
        phoneNumber: registrationData.phoneNumber,
        emailVerified: false,
        profilePicture: null,
        twoFactorEnabled: false,
        authProvider: 'local',
        authProviderId: null
      });
      
      // Generar y guardar código de verificación
      const verificationCode = generateVerificationCode();
      const verificationId = generateSessionId();
      
      // Simular envío de email (en producción se enviaría un email real)
      console.log(`Código de verificación para ${user.email}: ${verificationCode}`);
      verificationCodes.set(verificationId, { code: verificationCode, email: user.email });
      
      // Crear perfil de médico
      const doctorProfile = await storage.createDoctorProfile({
        userId: user.id,
        specialtyId: registrationData.specialtyId,
        licenseNumber: registrationData.licenseNumber,
        education: registrationData.education,
        experience: registrationData.experience,
        bio: registrationData.bio,
        basePrice: registrationData.basePrice,
        identityDocFront: typeof registrationData.identityDocFront === 'string' 
          ? registrationData.identityDocFront 
          : null,
        identityDocBack: typeof registrationData.identityDocBack === 'string'
          ? registrationData.identityDocBack
          : null,
        bankAccount: null
      });
      
      // Crear notificación para el nuevo médico
      await storage.createNotification({
        userId: user.id,
        type: 'welcome',
        content: 'Bienvenido a OnCall Clinic. Tu perfil está siendo revisado por nuestro equipo. Te notificaremos cuando sea verificado.',
        data: {
          doctorProfileId: doctorProfile.id
        } as any
      });
      
      // Crear notificación para administradores de que hay un nuevo médico por verificar
      const admins = Array.from((await storage.getAllDoctorProfiles()))
        .filter(profile => profile.isVerified && profile.specialtyId === registrationData.specialtyId)
        .map(profile => profile.userId);
      
      if (admins.length > 0) {
        for (const adminId of admins) {
          await storage.createNotification({
            userId: adminId,
            type: 'new_doctor',
            content: `Nuevo médico por verificar: ${user.firstName} ${user.lastName}`,
            data: {
              doctorProfileId: doctorProfile.id,
              specialtyId: registrationData.specialtyId
            } as any
          });
        }
      }
      
      res.status(201).json({ 
        success: true,
        userId: user.id,
        doctorProfileId: doctorProfile.id,
        verificationId,
        verificationCode
      });
    } catch (error) {
      console.error('Error en el registro de médico:', error);
      res.status(500).json({ error: 'Error en el proceso de registro' });
    }
  });
  
  // API para verificar doctor (solo administradores)
  app.post('/api/admin/verify-doctor', async (req, res) => {
    try {
      // Verificar autenticación
      const authResult = await isAuthenticated(req, res);
      if (!authResult || authResult.userType !== 'admin') {
        return res.status(401).json({ error: 'No autorizado. Se requiere acceso de administrador.' });
      }
      
      // Validar datos de entrada
      const validationResult = doctorVerificationSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: 'Datos de verificación inválidos',
          details: validationResult.error.format()
        });
      }
      
      const verificationData = validationResult.data;
      
      // Verificar médico
      const verifiedProfile = await storage.verifyDoctor(
        verificationData.doctorId,
        authResult.userId,
        verificationData.adminNotes
      );
      
      if (!verifiedProfile) {
        return res.status(404).json({ error: 'Perfil de médico no encontrado' });
      }
      
      res.json({ 
        success: true,
        doctorProfileId: verifiedProfile.id,
        isVerified: verifiedProfile.isVerified,
        verificationDate: verifiedProfile.verificationDate
      });
    } catch (error) {
      console.error('Error al verificar médico:', error);
      res.status(500).json({ error: 'Error al verificar médico' });
    }
  });
  
  // API para obtener médicos no verificados (solo administradores)
  app.get('/api/admin/unverified-doctors', async (req, res) => {
    try {
      // Verificar autenticación
      const authResult = await isAuthenticated(req, res);
      if (!authResult || authResult.userType !== 'admin') {
        return res.status(401).json({ error: 'No autorizado. Se requiere acceso de administrador.' });
      }
      
      // Obtener médicos no verificados
      const unverifiedDoctors = await storage.getUnverifiedDoctorProfiles();
      
      // Para cada médico, obtener información de usuario
      const doctorsWithUserInfo = await Promise.all(unverifiedDoctors.map(async (doctor) => {
        const user = await storage.getUser(doctor.userId);
        const specialty = await storage.getSpecialty(doctor.specialtyId);
        return {
          ...doctor,
          user: user ? {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phoneNumber: user.phoneNumber
          } : null,
          specialty: specialty ? specialty.name : null
        };
      }));
      
      res.json({ doctors: doctorsWithUserInfo });
    } catch (error) {
      console.error('Error al obtener médicos no verificados:', error);
      res.status(500).json({ error: 'Error al obtener médicos no verificados' });
    }
  });
  
  // SPECIALTY ROUTES
  
  // ROUTES FOR APPOINTMENT BOOKING / DOCTOR SEARCH
  
  // API para buscar médicos por ubicación
  app.post('/api/search/doctors', async (req, res) => {
    try {
      // Validar los datos de entrada
      const searchParams = doctorSearchSchema.parse(req.body);
      
      // Verificar modo sandbox
      if (IS_SANDBOX) {
        // Verificar si las coordenadas están dentro del área permitida
        if (searchParams.lat && searchParams.lng && !isWithinAllowedArea(searchParams.lat, searchParams.lng)) {
          return res.status(400).json({ 
            message: "Área restringida", 
            details: "Actualmente solo ofrecemos servicios en las Islas Baleares.",
            isSandbox: true
          });
        }
        
        // En modo sandbox, solo permitir especialidad de Medicina General (ID 1)
        if (searchParams.specialtyId && searchParams.specialtyId !== 1) {
          return res.status(400).json({ 
            message: "Especialidad restringida", 
            details: "Actualmente solo ofrecemos servicios de Medicina General.",
            isSandbox: true
          });
        }
      }
      
      // Buscar médicos cercanos
      const doctors = await storage.searchDoctorsByLocation(
        searchParams.lat || 0, 
        searchParams.lng || 0, 
        searchParams.distance, 
        searchParams.specialtyId ? String(searchParams.specialtyId) : undefined
      );
      
      // Enriquecer los resultados con información del usuario
      const enrichedDoctors = await Promise.all(
        doctors.map(async (doctorWithDistance) => {
          const user = await storage.getUser(doctorWithDistance.userId);
          const specialty = await storage.getSpecialty(doctorWithDistance.specialtyId);
          
          if (!user) return null;
          
          const { password, ...userWithoutPassword } = user;
          
          return {
            ...doctorWithDistance,
            user: userWithoutPassword,
            specialty
          };
        })
      );
      
      // Filtrar resultados nulos
      const validDoctors = enrichedDoctors.filter(doctor => doctor !== null);
      
      // Modo sandbox - añadir información adicional
      if (IS_SANDBOX) {
        return res.json({
          doctors: validDoctors,
          isSandbox: true,
          sandboxInfo: {
            message: "Estás utilizando la versión ALPHA de prueba",
            restrictedArea: "Islas Baleares",
            restrictedSpecialty: "Medicina General"
          }
        });
      }
      
      // Respuesta normal
      res.json(validDoctors);
    } catch (error) {
      console.error('Error en búsqueda de médicos:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Datos de búsqueda inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Error del servidor durante la búsqueda de médicos" });
    }
  });
  

  
  // Get all specialties
  app.get('/api/specialties', async (req, res) => {
    try {
      const specialties = await storage.getAllSpecialties();
      res.json(specialties);
    } catch (error) {
      res.status(500).json({ message: "Server error fetching specialties" });
    }
  });
  
  // LOCATION ROUTES
  
  // API para crear ubicaciones
  app.post('/api/locations', async (req, res) => {
    try {
      // Verificar autenticación
      const authResult = await isAuthenticated(req, res);
      if (!authResult) {
        return res.status(401).json({ error: 'No autenticado' });
      }
      
      // Validar datos
      const locationData = insertLocationSchema.parse({
        ...req.body,
        userId: authResult.userId
      });
      
      // Crear ubicación
      const location = await storage.createLocation(locationData);
      
      return res.status(201).json(location);
    } catch (error) {
      console.error('Error al crear ubicación:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Datos inválidos', details: error.format() });
      }
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  });
  
  // API para obtener ubicaciones del usuario
  app.get('/api/locations', async (req, res) => {
    try {
      // Verificar autenticación
      const authResult = await isAuthenticated(req, res);
      if (!authResult) {
        return res.status(401).json({ error: 'No autenticado' });
      }
      
      // Obtener ubicaciones
      const locations = await storage.getLocationsByUserId(authResult.userId);
      
      return res.json(locations);
    } catch (error) {
      console.error('Error al obtener ubicaciones:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  });
  
  // Add location
  app.post('/api/locations', async (req, res) => {
    const auth = await isAuthenticated(req, res);
    if (!auth) return;
    
    try {
      const locationData = insertLocationSchema.parse({
        ...req.body,
        userId: auth.userId
      });
      
      const location = await storage.createLocation(locationData);
      
      res.status(201).json(location);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Server error adding location" });
    }
  });
  
  // Get user locations
  app.get('/api/locations', async (req, res) => {
    const auth = await isAuthenticated(req, res);
    if (!auth) return;
    
    try {
      const locations = await storage.getLocationsByUserId(auth.userId);
      res.json(locations);
    } catch (error) {
      res.status(500).json({ message: "Server error fetching locations" });
    }
  });
  
  // APPOINTMENT ROUTES
  
  // Create guest appointment
  app.post('/api/appointments/guest', async (req, res) => {
    try {
      const { guestData, ...appointmentData } = req.body;
      
      // Validate guest data
      const validatedGuest = guestPatientSchema.parse(guestData);
      
      // Generate auth token
      const authToken = crypto.randomUUID();
      
      // Set expiration 24h after appointment
      const expiresAt = new Date(appointmentData.appointmentDate);
      expiresAt.setHours(expiresAt.getHours() + 24);
      
      // Create appointment
      const appointment = await storage.createAppointment({
        ...appointmentData,
        status: 'scheduled',
        paymentStatus: 'pending'
      });
      
      // Create guest patient
      const guestPatient = await storage.createGuestPatient({
        ...validatedGuest,
        appointmentId: appointment.id,
        authToken,
        expiresAt
      });
      
      res.status(201).json({ 
        appointment,
        authToken
      });
    } catch (error) {
      console.error('Guest booking error:', error);
      res.status(500).json({ message: "Error creating guest appointment" });
    }
  });

  // Create appointment 
  app.post('/api/appointments', async (req, res) => {
    const auth = await isAuthenticated(req, res);
    if (!auth) return;
    
    try {
      if (auth.userType !== 'patient') {
        return res.status(403).json({ message: "Only patients can create appointments" });
      }
      
      const appointmentData = insertAppointmentSchema.parse({
        ...req.body,
        patientId: auth.userId,
        status: 'scheduled',
        paymentStatus: 'pending'
      });
      
      // Validate doctor exists
      const doctor = await storage.getUser(appointmentData.doctorId);
      if (!doctor || doctor.userType !== 'doctor') {
        return res.status(400).json({ message: "Invalid doctor ID" });
      }
      
      // Validate location exists
      const location = await storage.getLocation(appointmentData.locationId);
      if (!location || location.userId !== auth.userId) {
        return res.status(400).json({ message: "Invalid location ID" });
      }
      
      const appointment = await storage.createAppointment(appointmentData);
      
      // Create a pending payment record
      await storage.createPayment({
        appointmentId: appointment.id,
        amount: appointment.totalAmount,
        status: 'pending',
        currency: 'EUR'
      });
      
      // Send notification to doctor
      await sendNotification(appointmentData.doctorId, {
        type: 'new_appointment',
        message: `New appointment request for ${new Date(appointmentData.appointmentDate).toLocaleString()}`
      });
      
      res.status(201).json(appointment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Server error creating appointment" });
    }
  });
  
  // Get user appointments
  app.get('/api/appointments', async (req, res) => {
    const auth = await isAuthenticated(req, res);
    if (!auth) return;
    
    try {
      let appointments;
      
      if (auth.userType === 'patient') {
        appointments = await storage.getAppointmentsByPatientId(auth.userId);
      } else if (auth.userType === 'doctor') {
        appointments = await storage.getAppointmentsByDoctorId(auth.userId);
      } else {
        return res.status(403).json({ message: "Unauthorized user type" });
      }
      
      // Enrich appointments with related data
      const enrichedAppointments = await Promise.all(appointments.map(async (appointment) => {
        const patient = await storage.getUser(appointment.patientId);
        const doctor = await storage.getUser(appointment.doctorId);
        const location = await storage.getLocation(appointment.locationId);
        const payment = await storage.getPaymentByAppointmentId(appointment.id);
        
        const { password: patientPassword, ...patientData } = patient || {};
        const { password: doctorPassword, ...doctorData } = doctor || {};
        
        return {
          ...appointment,
          patient: patientData,
          doctor: doctorData,
          location,
          payment
        };
      }));
      
      res.json(enrichedAppointments);
    } catch (error) {
      res.status(500).json({ message: "Server error fetching appointments" });
    }
  });
  
  // Get single appointment by ID
  app.get('/api/appointments/:id', async (req, res) => {
    const auth = await isAuthenticated(req, res);
    if (!auth) return;
    
    try {
      const appointmentId = parseInt(req.params.id);
      if (isNaN(appointmentId)) {
        return res.status(400).json({ message: "Invalid appointment ID" });
      }
      
      const appointment = await storage.getAppointment(appointmentId);
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      // Check if user is authorized to view this appointment
      if (auth.userType !== 'admin' && 
          auth.userId !== appointment.patientId && 
          auth.userId !== appointment.doctorId) {
        return res.status(403).json({ message: "Not authorized to view this appointment" });
      }
      
      // Get doctor details including specialty
      const doctor = await storage.getUser(appointment.doctorId);
      if (!doctor) {
        return res.status(500).json({ message: "Doctor information not found" });
      }
      
      const doctorProfile = await storage.getDoctorProfileByUserId(doctor.id);
      if (!doctorProfile) {
        return res.status(500).json({ message: "Doctor profile not found" });
      }
      
      const specialty = await storage.getSpecialty(doctorProfile.specialtyId);
      
      // Get location
      const location = await storage.getLocation(appointment.locationId);
      if (!location) {
        return res.status(500).json({ message: "Location information not found" });
      }
      
      // Get payment
      const payment = await storage.getPaymentByAppointmentId(appointment.id);
      
      // Hide sensitive doctor data
      const { password: doctorPassword, ...doctorData } = doctor;
      
      // Return enriched appointment data
      res.json({
        ...appointment,
        doctor: {
          id: doctorProfile.id,
          user: doctorData,
          specialty: specialty || { name: "Especialidad no especificada" }
        },
        location,
        payment
      });
    } catch (error) {
      console.error('Error fetching appointment details:', error);
      res.status(500).json({ message: "Server error fetching appointment details" });
    }
  });
  
  // Update appointment status
  app.patch('/api/appointments/:id/status', async (req, res) => {
    const auth = await isAuthenticated(req, res);
    if (!auth) return;
    
    try {
      const appointmentId = parseInt(req.params.id);
      const { status } = req.body;
      
      // Add real-time tracking status support
      const validStatuses = [
        'scheduled',    // Initial state after booking
        'confirmed',    // Doctor confirmed appointment
        'en_route',     // Doctor is on the way
        'arrived',      // Doctor arrived at patient's location
        'in_progress',  // Consultation in progress
        'completed',    // Appointment completed 
        'canceled'      // Appointment canceled
      ];
      
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ 
          message: "Invalid status value", 
          validValues: validStatuses 
        });
      }
      
      const appointment = await storage.getAppointment(appointmentId);
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      // Check if user is authorized to update this appointment
      if (
        (auth.userType === 'patient' && appointment.patientId !== auth.userId) ||
        (auth.userType === 'doctor' && appointment.doctorId !== auth.userId)
      ) {
        return res.status(403).json({ message: "Not authorized to update this appointment" });
      }
      
      // Check for valid status transitions
      if (auth.userType === 'doctor') {
        // Only doctor can set these statuses
        if (['confirmed', 'en_route', 'arrived', 'in_progress', 'completed'].includes(status)) {
          // Valid transition
        } else if (status === 'canceled') {
          // Both doctor and patient can cancel
        } else {
          return res.status(400).json({ message: "Invalid status transition for doctor" });
        }
      } else if (auth.userType === 'patient') {
        // Patient can only cancel or scheduled (re-schedule) appointments
        if (!['canceled', 'scheduled'].includes(status)) {
          return res.status(400).json({ message: "Invalid status transition for patient" });
        }
      }
      
      const updatedAppointment = await storage.updateAppointment(appointmentId, { status });
      
      // Get patient and doctor information for notification
      const patient = await storage.getUser(appointment.patientId);
      const doctor = await storage.getUser(appointment.doctorId);
      
      if (!patient || !doctor) {
        return res.status(500).json({ message: "Failed to retrieve user information" });
      }
      
      // Prepare notification message based on status
      let notificationMessage = '';
      const doctorFullName = `Dr. ${doctor.firstName} ${doctor.lastName}`;
      const patientFullName = `${patient.firstName} ${patient.lastName}`;
      
      switch (status) {
        case 'confirmed':
          notificationMessage = `${doctorFullName} confirmed your appointment for ${new Date(appointment.appointmentDate).toLocaleString()}`;
          break;
        case 'en_route':
          notificationMessage = `${doctorFullName} is on the way to your location`;
          break;
        case 'arrived':
          notificationMessage = `${doctorFullName} has arrived at your location`;
          break;
        case 'in_progress':
          notificationMessage = `Your appointment with ${doctorFullName} is now in progress`;
          break;
        case 'completed':
          notificationMessage = `Your appointment with ${doctorFullName} has been completed`;
          break;
        case 'canceled':
          const canceledBy = auth.userType === 'patient' ? patientFullName : doctorFullName;
          notificationMessage = `Appointment for ${new Date(appointment.appointmentDate).toLocaleString()} was canceled by ${canceledBy}`;
          break;
        default:
          notificationMessage = `Appointment for ${new Date(appointment.appointmentDate).toLocaleString()} was updated to ${status}`;
      }
      
      // Send notification to the other party
      const recipientId = auth.userType === 'patient' ? appointment.doctorId : appointment.patientId;
      await sendNotification(recipientId, {
        type: 'appointment_status',
        message: notificationMessage,
        appointmentId: appointmentId,
        status: status,
        timestamp: new Date().toISOString()
      });
      
      // The WebSocket notification has already been sent by the sendNotification function above
      // No additional code needed here
      
      res.json(updatedAppointment);
    } catch (error) {
      console.error('Error updating appointment:', error);
      res.status(500).json({ message: "Server error updating appointment" });
    }
  });
  
  // PAYMENT ROUTES
  
  // Process payment
  app.post('/api/payments/:appointmentId/process', async (req, res) => {
    const auth = await isAuthenticated(req, res);
    if (!auth) return;
    
    try {
      const appointmentId = parseInt(req.params.appointmentId);
      const { paymentMethod, cardDetails } = req.body;
      
      // Validate appointment exists and belongs to user
      const appointment = await storage.getAppointment(appointmentId);
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      if (appointment.patientId !== auth.userId) {
        return res.status(403).json({ message: "Not authorized to process payment for this appointment" });
      }
      
      // Get payment record
      const payment = await storage.getPaymentByAppointmentId(appointmentId);
      if (!payment) {
        return res.status(404).json({ message: "Payment record not found" });
      }
      
      if (payment.status !== 'pending') {
        return res.status(400).json({ message: `Payment already ${payment.status}` });
      }
      
      // Simulate payment processing
      // In a real app, this would integrate with a payment gateway
      const success = Math.random() > 0.1; // 90% success rate for demo
      
      if (success) {
        // Update payment record
        const updatedPayment = await storage.updatePayment(payment.id, { 
          status: 'completed',
          paymentMethod,
          transactionId: `tx_${Date.now()}`
        });
        
        // Update appointment payment status
        await storage.updateAppointment(appointmentId, { paymentStatus: 'paid' });
        
        // Send notifications
        await sendNotification(auth.userId, {
          type: 'payment_success',
          message: `Payment of ${payment.amount / 100}€ for your appointment was successful`
        });
        
        await sendNotification(appointment.doctorId, {
          type: 'appointment_paid',
          message: `Patient has paid for the appointment on ${new Date(appointment.appointmentDate).toLocaleString()}`
        });
        
        res.json({ 
          success: true, 
          payment: updatedPayment,
          message: "Payment processed successfully"
        });
      } else {
        // Payment failed
        res.status(400).json({ 
          success: false, 
          message: "Payment processing failed. Please try again or use a different payment method."
        });
      }
    } catch (error) {
      res.status(500).json({ message: "Server error processing payment" });
    }
  });
  
  // REVIEW ROUTES
  
  // Create review
  app.post('/api/reviews', async (req, res) => {
    const auth = await isAuthenticated(req, res);
    if (!auth) return;
    
    try {
      const { appointmentId, rating, comment } = req.body;
      
      // Validate appointment exists
      const appointment = await storage.getAppointment(parseInt(appointmentId));
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      // Check if user is part of the appointment
      if (appointment.patientId !== auth.userId && appointment.doctorId !== auth.userId) {
        return res.status(403).json({ message: "Not authorized to review this appointment" });
      }
      
      // Determine reviewer and reviewee
      const reviewerId = auth.userId;
      const revieweeId = reviewerId === appointment.patientId ? appointment.doctorId : appointment.patientId;
      
      // Create review
      const reviewData = insertReviewSchema.parse({
        appointmentId: parseInt(appointmentId),
        reviewerId,
        revieweeId,
        rating: parseInt(rating),
        comment
      });
      
      const review = await storage.createReview(reviewData);
      
      // If review is for a doctor, update their average rating
      if (revieweeId === appointment.doctorId) {
        // Get doctor profile
        const doctorProfile = await storage.getDoctorProfileByUserId(revieweeId);
        if (doctorProfile) {
          // Get all reviews for this doctor
          const reviews = await storage.getReviewsByRevieweeId(revieweeId);
          
          // Calculate new average
          const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
          const newAverage = sum / reviews.length;
          
          // Update doctor profile
          await storage.updateDoctorProfile(doctorProfile.id, { averageRating: newAverage });
        }
      }
      
      // Send notification to reviewee
      await sendNotification(revieweeId, {
        type: 'new_review',
        message: `You've received a new ${rating}-star review`
      });
      
      res.status(201).json(review);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Server error creating review" });
    }
  });
  
  // NOTIFICATION ROUTES
  
  // Get user notifications
  app.get('/api/notifications', async (req, res) => {
    const auth = await isAuthenticated(req, res);
    if (!auth) return;
    
    try {
      const notifications = await storage.getNotifications(auth.userId);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Server error fetching notifications" });
    }
  });
  
  // Mark notification as read
  app.patch('/api/notifications/:id/read', async (req, res) => {
    const auth = await isAuthenticated(req, res);
    if (!auth) return;
    
    try {
      const notificationId = parseInt(req.params.id);
      
      const updatedNotification = await storage.markNotificationAsRead(notificationId);
      if (!updatedNotification) {
        return res.status(404).json({ message: "Notification not found" });
      }
      
      res.json(updatedNotification);
    } catch (error) {
      res.status(500).json({ message: "Server error updating notification" });
    }
  });
  
  // Add basic user authentication endpoint
  app.get('/api/user', (req, res) => {
    res.status(401).json({ message: "Not authenticated" });
  });

  // Legal pages routes
  app.get('/legal/terms', (req, res) => {
    const html = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Términos y Condiciones - OnCall Clinic</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 800px; margin: 0 auto; padding: 2rem; }
        .header { text-align: center; margin-bottom: 3rem; padding-bottom: 2rem; border-bottom: 2px solid #e5e7eb; }
        h1 { color: #111827; margin-bottom: 0.5rem; }
        .subtitle { color: #6b7280; }
        h2 { color: #374151; margin: 2rem 0 1rem; }
        .section { margin-bottom: 2rem; }
        .back-link { display: inline-block; margin-bottom: 2rem; color: #2563eb; text-decoration: none; }
        .back-link:hover { text-decoration: underline; }
        .footer { margin-top: 3rem; padding-top: 2rem; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 0.9rem; }
    </style>
</head>
<body>
    <div class="container">
        <a href="/app" class="back-link">← Volver a OnCall Clinic</a>
        <div class="header">
            <h1>Términos y Condiciones</h1>
            <p class="subtitle">Última actualización: 31 de mayo de 2025</p>
        </div>
        <div class="section">
            <h2>1. Aceptación de los Términos</h2>
            <p>Al acceder y utilizar OnCall Clinic, usted acepta estar sujeto a estos términos y condiciones de uso.</p>
        </div>
        <div class="section">
            <h2>2. Descripción del Servicio</h2>
            <p>OnCall Clinic es una plataforma digital que conecta pacientes con médicos profesionales verificados para consultas médicas a domicilio.</p>
        </div>
        <div class="section">
            <h2>3. Responsabilidades del Usuario</h2>
            <p>Los usuarios se comprometen a proporcionar información médica precisa y respetar las indicaciones médicas recibidas.</p>
        </div>
        <div class="footer">
            <p>&copy; 2025 OnCall Clinic. Todos los derechos reservados.</p>
        </div>
    </div>
</body>
</html>`;
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  });

  app.get('/legal/privacy', (req, res) => {
    const html = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Política de Privacidad - OnCall Clinic</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 800px; margin: 0 auto; padding: 2rem; }
        .header { text-align: center; margin-bottom: 3rem; padding-bottom: 2rem; border-bottom: 2px solid #e5e7eb; }
        h1 { color: #111827; margin-bottom: 0.5rem; }
        .subtitle { color: #6b7280; }
        h2 { color: #374151; margin: 2rem 0 1rem; }
        .section { margin-bottom: 2rem; }
        .back-link { display: inline-block; margin-bottom: 2rem; color: #2563eb; text-decoration: none; }
        .back-link:hover { text-decoration: underline; }
        .footer { margin-top: 3rem; padding-top: 2rem; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 0.9rem; }
        .highlight { background: #f3f4f6; padding: 1rem; border-left: 4px solid #2563eb; margin: 1rem 0; }
    </style>
</head>
<body>
    <div class="container">
        <a href="/app" class="back-link">← Volver a OnCall Clinic</a>
        <div class="header">
            <h1>Política de Privacidad</h1>
            <p class="subtitle">Última actualización: 31 de mayo de 2025</p>
        </div>
        <div class="highlight">
            <p><strong>Resumen:</strong> Respetamos tu privacidad y protegemos tus datos personales y médicos con los más altos estándares de seguridad.</p>
        </div>
        <div class="section">
            <h2>1. Información que Recopilamos</h2>
            <p>Recopilamos datos personales, médicos, de uso y de pago necesarios para proporcionar nuestros servicios.</p>
        </div>
        <div class="section">
            <h2>2. Protección de Datos Médicos</h2>
            <p>Los datos médicos reciben protección especial con encriptación end-to-end y acceso restringido.</p>
        </div>
        <div class="footer">
            <p>&copy; 2025 OnCall Clinic. Todos los derechos reservados.</p>
        </div>
    </div>
</body>
</html>`;
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  });

  app.get('/legal/cookies', (req, res) => {
    const html = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Política de Cookies - OnCall Clinic</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 800px; margin: 0 auto; padding: 2rem; }
        .header { text-align: center; margin-bottom: 3rem; padding-bottom: 2rem; border-bottom: 2px solid #e5e7eb; }
        h1 { color: #111827; margin-bottom: 0.5rem; }
        .subtitle { color: #6b7280; }
        h2 { color: #374151; margin: 2rem 0 1rem; }
        .section { margin-bottom: 2rem; }
        .back-link { display: inline-block; margin-bottom: 2rem; color: #2563eb; text-decoration: none; }
        .back-link:hover { text-decoration: underline; }
        .footer { margin-top: 3rem; padding-top: 2rem; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 0.9rem; }
    </style>
</head>
<body>
    <div class="container">
        <a href="/app" class="back-link">← Volver a OnCall Clinic</a>
        <div class="header">
            <h1>Política de Cookies</h1>
            <p class="subtitle">Última actualización: 31 de mayo de 2025</p>
        </div>
        <div class="section">
            <h2>¿Qué son las Cookies?</h2>
            <p>Las cookies son pequeños archivos que mejoran su experiencia en nuestro sitio web.</p>
        </div>
        <div class="section">
            <h2>Tipos de Cookies</h2>
            <p>Utilizamos cookies esenciales, de funcionalidad, analíticas y de marketing con su consentimiento.</p>
        </div>
        <div class="footer">
            <p>&copy; 2025 OnCall Clinic. Todos los derechos reservados.</p>
        </div>
    </div>
</body>
</html>`;
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  });

  app.get('/legal/refunds', (req, res) => {
    const html = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cancelaciones y Reembolsos - OnCall Clinic</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 800px; margin: 0 auto; padding: 2rem; }
        .header { text-align: center; margin-bottom: 3rem; padding-bottom: 2rem; border-bottom: 2px solid #e5e7eb; }
        h1 { color: #111827; margin-bottom: 0.5rem; }
        .subtitle { color: #6b7280; }
        h2 { color: #374151; margin: 2rem 0 1rem; }
        .section { margin-bottom: 2rem; }
        .back-link { display: inline-block; margin-bottom: 2rem; color: #2563eb; text-decoration: none; }
        .back-link:hover { text-decoration: underline; }
        .footer { margin-top: 3rem; padding-top: 2rem; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 0.9rem; }
        .highlight { background: #dcfce7; border: 1px solid #16a34a; padding: 1rem; border-radius: 0.5rem; margin: 1rem 0; }
        .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 1rem; border-radius: 0.5rem; margin: 1rem 0; }
        .time-table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
        .time-table th, .time-table td { border: 1px solid #e5e7eb; padding: 0.75rem; text-align: left; }
        .time-table th { background: #f9fafb; font-weight: 600; }
    </style>
</head>
<body>
    <div class="container">
        <a href="/app" class="back-link">← Volver a OnCall Clinic</a>
        <div class="header">
            <h1>Cancelaciones y Reembolsos</h1>
            <p class="subtitle">Política de cancelación y devoluciones</p>
        </div>

        <div class="highlight">
            <p><strong>Política Flexible:</strong> Entendemos que las circunstancias pueden cambiar. Ofrecemos opciones flexibles para cancelaciones y reembolsos.</p>
        </div>

        <div class="section">
            <h2>Cancelaciones Gratuitas</h2>
            <p>Puedes cancelar tu cita sin coste adicional en los siguientes casos:</p>
            
            <table class="time-table">
                <thead>
                    <tr>
                        <th>Tiempo de Cancelación</th>
                        <th>Reembolso</th>
                        <th>Condiciones</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><strong>Más de 2 horas antes</strong></td>
                        <td>100% del importe</td>
                        <td>Sin restricciones</td>
                    </tr>
                    <tr>
                        <td><strong>Entre 1-2 horas antes</strong></td>
                        <td>75% del importe</td>
                        <td>Cargo por gestión aplicado</td>
                    </tr>
                    <tr>
                        <td><strong>Menos de 1 hora antes</strong></td>
                        <td>50% del importe</td>
                        <td>Solo en casos excepcionales</td>
                    </tr>
                    <tr>
                        <td><strong>Doctor en camino</strong></td>
                        <td>25% del importe</td>
                        <td>Emergencia médica comprobada</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="section">
            <h2>Casos de Reembolso Completo</h2>
            <p>Ofrecemos reembolso del 100% en las siguientes situaciones:</p>
            <ul style="margin-left: 2rem; margin-top: 0.5rem;">
                <li>El médico cancela la cita por cualquier motivo</li>
                <li>Problemas técnicos de la plataforma que impidan el servicio</li>
                <li>Condiciones meteorológicas extremas que impidan el acceso</li>
                <li>Emergencia médica del paciente que requiera hospitalización</li>
                <li>Error en la programación o información de la cita</li>
            </ul>
        </div>

        <div class="section">
            <h2>Proceso de Cancelación</h2>
            <p>Para cancelar tu cita:</p>
            <ol style="margin-left: 2rem; margin-top: 0.5rem;">
                <li>Accede a tu perfil en la aplicación</li>
                <li>Selecciona "Mis Citas" y encuentra la cita a cancelar</li>
                <li>Haz clic en "Cancelar Cita" y confirma la acción</li>
                <li>Recibirás confirmación por email y SMS</li>
                <li>El reembolso se procesará según la política aplicable</li>
            </ol>
        </div>

        <div class="section">
            <h2>Tiempos de Reembolso</h2>
            <p>Los reembolsos se procesan de la siguiente manera:</p>
            <ul style="margin-left: 2rem; margin-top: 0.5rem;">
                <li><strong>Tarjeta de crédito/débito:</strong> 3-5 días hábiles</li>
                <li><strong>PayPal:</strong> 1-2 días hábiles</li>
                <li><strong>Transferencia bancaria:</strong> 2-3 días hábiles</li>
                <li><strong>Casos especiales:</strong> Hasta 10 días hábiles</li>
            </ul>
        </div>

        <div class="section">
            <h2>Modificaciones de Cita</h2>
            <p>Como alternativa a la cancelación, puedes:</p>
            <ul style="margin-left: 2rem; margin-top: 0.5rem;">
                <li>Reprogramar tu cita hasta 1 hora antes sin coste</li>
                <li>Cambiar la dirección de la consulta (con al menos 2 horas de antelación)</li>
                <li>Solicitar un médico diferente (sujeto a disponibilidad)</li>
            </ul>
        </div>

        <div class="warning">
            <strong>Importante:</strong> En caso de no presentarse (no-show) sin cancelación previa, no se aplicará reembolso alguno.
        </div>

        <div class="section">
            <h2>Contacto para Reembolsos</h2>
            <p>Para consultas sobre reembolsos o asistencia:</p>
            <p><strong>Email:</strong> reembolsos@oncallclinic.es<br>
            <strong>Teléfono:</strong> +34 900 123 456<br>
            <strong>Horario:</strong> Lunes a Domingo, 24 horas</p>
        </div>

        <div class="footer">
            <p>&copy; 2025 OnCall Clinic. Todos los derechos reservados.</p>
        </div>
    </div>
</body>
</html>`;
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  });

  // Página de búsqueda de doctores
  app.get('/doctors', (req, res) => {
    const html = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Buscar Doctores - OnCall Clinic</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #333; background: #f8fafc; }
        .container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
        .back-link { display: inline-block; margin-bottom: 2rem; color: #2563eb; text-decoration: none; font-weight: 600; }
        .back-link:hover { text-decoration: underline; }
        .header { text-align: center; margin-bottom: 3rem; }
        .header h1 { font-size: 3rem; font-weight: 800; color: #111827; margin-bottom: 1rem; }
        .search-form { background: white; padding: 2rem; border-radius: 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.1); margin-bottom: 3rem; }
        .form-group { margin-bottom: 1.5rem; }
        .form-group label { display: block; font-weight: 600; margin-bottom: 0.5rem; color: #374151; }
        .form-control { width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 12px; font-size: 16px; }
        .form-control:focus { outline: none; border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); }
        .btn-search { background: linear-gradient(45deg, #2563eb, #1d4ed8); color: white; padding: 12px 32px; border: none; border-radius: 12px; font-weight: 600; cursor: pointer; font-size: 16px; }
        .btn-search:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(37, 99, 235, 0.3); }
        .doctors-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 2rem; }
        .doctor-card { background: white; border-radius: 20px; padding: 2rem; box-shadow: 0 10px 40px rgba(0,0,0,0.08); transition: all 0.3s ease; }
        .doctor-card:hover { transform: translateY(-5px); box-shadow: 0 20px 60px rgba(0,0,0,0.15); }
        .doctor-avatar { width: 80px; height: 80px; background: #2563eb; border-radius: 50%; margin: 0 auto 1rem; display: flex; align-items: center; justify-content: center; color: white; font-size: 2rem; font-weight: bold; }
        .doctor-name { font-size: 1.5rem; font-weight: 700; text-align: center; margin-bottom: 0.5rem; }
        .doctor-specialty { text-align: center; color: #6b7280; margin-bottom: 1rem; }
        .doctor-rating { text-align: center; margin-bottom: 1rem; }
        .stars { color: #fbbf24; font-size: 1.2rem; }
        .doctor-info { text-align: center; margin-bottom: 1.5rem; }
        .btn-book { background: linear-gradient(45deg, #fbbf24, #f59e0b); color: #1e40af; padding: 12px 24px; border: none; border-radius: 25px; font-weight: 700; cursor: pointer; width: 100%; }
        .btn-book:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(251, 191, 36, 0.4); }
    </style>
</head>
<body>
    <div class="container">
        <a href="/app" class="back-link">← Volver al inicio</a>
        <div class="header">
            <h1>Buscar Doctores</h1>
            <p>Encuentra el médico perfecto para tu consulta</p>
        </div>
        
        <div class="search-form">
            <div class="form-group">
                <label for="specialty">Especialidad</label>
                <select class="form-control" id="specialty">
                    <option value="">Todas las especialidades</option>
                    <option value="general">Medicina General</option>
                    <option value="cardiology">Cardiología</option>
                    <option value="dermatology">Dermatología</option>
                    <option value="pediatrics">Pediatría</option>
                </select>
            </div>
            <button class="btn-search" onclick="searchDoctors()">🔍 Buscar Doctores</button>
        </div>
        
        <div class="doctors-grid">
            <div class="doctor-card">
                <div class="doctor-avatar">DR</div>
                <div class="doctor-name">Dr. Ana Rodríguez</div>
                <div class="doctor-specialty">Medicina General</div>
                <div class="doctor-rating">
                    <span class="stars">★★★★★</span>
                    <span>(4.9/5)</span>
                </div>
                <div class="doctor-info">
                    <p>15 años de experiencia</p>
                    <p>Disponible 24/7</p>
                    <p><strong>€75/consulta</strong></p>
                </div>
                <button class="btn-book" onclick="bookDoctor(1)">Reservar Consulta</button>
            </div>
            
            <div class="doctor-card">
                <div class="doctor-avatar">DR</div>
                <div class="doctor-name">Dr. Carlos Martín</div>
                <div class="doctor-specialty">Cardiología</div>
                <div class="doctor-rating">
                    <span class="stars">★★★★★</span>
                    <span>(4.8/5)</span>
                </div>
                <div class="doctor-info">
                    <p>20 años de experiencia</p>
                    <p>Especialista en emergencias</p>
                    <p><strong>€90/consulta</strong></p>
                </div>
                <button class="btn-book" onclick="bookDoctor(2)">Reservar Consulta</button>
            </div>
        </div>
    </div>
    
    <script>
        function searchDoctors() {
            const specialty = document.getElementById('specialty').value;
            alert('Buscando doctores' + (specialty ? ' en ' + specialty : '') + '...');
        }
        
        function bookDoctor(doctorId) {
            window.location.href = '/booking?doctor=' + doctorId;
        }
    </script>
</body>
</html>`;
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  });

  // Página de login
  app.get('/login', (req, res) => {
    const html = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Iniciar Sesión - OnCall Clinic</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #333; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); min-height: 100vh; display: flex; align-items: center; }
        .container { max-width: 400px; margin: 0 auto; padding: 2rem; }
        .back-link { display: inline-block; margin-bottom: 2rem; color: white; text-decoration: none; font-weight: 600; }
        .back-link:hover { text-decoration: underline; }
        .login-form { background: white; padding: 3rem; border-radius: 20px; box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
        .form-header { text-align: center; margin-bottom: 2rem; }
        .form-header h1 { font-size: 2rem; font-weight: 800; color: #111827; margin-bottom: 0.5rem; }
        .form-group { margin-bottom: 1.5rem; }
        .form-group label { display: block; font-weight: 600; margin-bottom: 0.5rem; color: #374151; }
        .form-control { width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 12px; font-size: 16px; }
        .form-control:focus { outline: none; border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); }
        .btn-login { background: linear-gradient(45deg, #2563eb, #1d4ed8); color: white; padding: 14px 0; border: none; border-radius: 12px; font-weight: 600; cursor: pointer; font-size: 16px; width: 100%; margin-bottom: 1rem; }
        .btn-login:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(37, 99, 235, 0.3); }
        .form-links { text-align: center; }
        .form-links a { color: #2563eb; text-decoration: none; }
        .form-links a:hover { text-decoration: underline; }
        .user-type { display: flex; gap: 1rem; margin-bottom: 1.5rem; }
        .user-type label { background: #f3f4f6; padding: 12px; border-radius: 12px; cursor: pointer; flex: 1; text-align: center; font-weight: 600; }
        .user-type input[type="radio"]:checked + span { background: #2563eb; color: white; }
    </style>
</head>
<body>
    <div class="container">
        <a href="/app" class="back-link">← Volver al inicio</a>
        <div class="login-form">
            <div class="form-header">
                <h1>Iniciar Sesión</h1>
                <p>Accede a tu cuenta de OnCall Clinic</p>
            </div>
            
            <form onsubmit="handleLogin(event)">
                <div class="user-type">
                    <label>
                        <input type="radio" name="userType" value="patient" checked style="display: none;">
                        <span>Paciente</span>
                    </label>
                    <label>
                        <input type="radio" name="userType" value="doctor" style="display: none;">
                        <span>Doctor</span>
                    </label>
                </div>
                
                <div class="form-group">
                    <label for="email">Email</label>
                    <input type="email" class="form-control" id="email" required>
                </div>
                
                <div class="form-group">
                    <label for="password">Contraseña</label>
                    <input type="password" class="form-control" id="password" required>
                </div>
                
                <button type="submit" class="btn-login">Iniciar Sesión</button>
                
                <div class="form-links">
                    <p><a href="/register">¿No tienes cuenta? Regístrate</a></p>
                    <p><a href="/forgot-password">¿Olvidaste tu contraseña?</a></p>
                </div>
            </form>
        </div>
    </div>
    
    <script>
        function handleLogin(event) {
            event.preventDefault();
            const userType = document.querySelector('input[name="userType"]:checked').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            if (userType === 'doctor') {
                // Redirect to doctor dashboard for demo
                window.location.href = '/doctor-dashboard';
            } else {
                // Redirect to patient dashboard
                alert('Iniciando sesión como paciente...');
                window.location.href = '/app';
            }
        }
    </script>
</body>
</html>`;
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  });

  // Página de reserva de citas
  app.get('/booking', (req, res) => {
    const html = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reservar Consulta - OnCall Clinic</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #333; background: #f8fafc; }
        .container { max-width: 800px; margin: 0 auto; padding: 2rem; }
        .back-link { display: inline-block; margin-bottom: 2rem; color: #2563eb; text-decoration: none; font-weight: 600; }
        .back-link:hover { text-decoration: underline; }
        .booking-form { background: white; padding: 3rem; border-radius: 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.1); }
        .form-header { text-align: center; margin-bottom: 3rem; }
        .form-header h1 { font-size: 2.5rem; font-weight: 800; color: #111827; margin-bottom: 1rem; }
        .form-step { margin-bottom: 2rem; padding: 2rem; border: 2px solid #e5e7eb; border-radius: 16px; }
        .form-step.active { border-color: #2563eb; background: #f0f9ff; }
        .step-title { font-size: 1.3rem; font-weight: 700; color: #2563eb; margin-bottom: 1rem; }
        .form-group { margin-bottom: 1.5rem; }
        .form-group label { display: block; font-weight: 600; margin-bottom: 0.5rem; color: #374151; }
        .form-control { width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 12px; font-size: 16px; }
        .form-control:focus { outline: none; border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); }
        .time-slots { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 1rem; }
        .time-slot { padding: 12px; border: 2px solid #e5e7eb; border-radius: 12px; text-align: center; cursor: pointer; transition: all 0.3s; }
        .time-slot:hover { border-color: #2563eb; background: #f0f9ff; }
        .time-slot.selected { border-color: #2563eb; background: #2563eb; color: white; }
        .btn-book { background: linear-gradient(45deg, #fbbf24, #f59e0b); color: #1e40af; padding: 16px 32px; border: none; border-radius: 25px; font-weight: 700; cursor: pointer; font-size: 18px; width: 100%; margin-top: 2rem; }
        .btn-book:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(251, 191, 36, 0.4); }
        .summary { background: #f0f9ff; padding: 2rem; border-radius: 16px; margin-top: 2rem; }
        .summary h3 { color: #2563eb; margin-bottom: 1rem; }
    </style>
</head>
<body>
    <div class="container">
        <a href="/doctors" class="back-link">← Volver a doctores</a>
        <div class="booking-form">
            <div class="form-header">
                <h1>Reservar Consulta</h1>
                <p>Completa los siguientes pasos para agendar tu cita médica</p>
            </div>
            
            <div class="form-step active">
                <div class="step-title">📅 1. Selecciona fecha y hora</div>
                <div class="form-group">
                    <label for="date">Fecha de la consulta</label>
                    <input type="date" class="form-control" id="date" min="${new Date().toISOString().split('T')[0]}">
                </div>
                <div class="form-group">
                    <label>Hora disponible</label>
                    <div class="time-slots">
                        <div class="time-slot" onclick="selectTime(this)">09:00</div>
                        <div class="time-slot" onclick="selectTime(this)">10:00</div>
                        <div class="time-slot" onclick="selectTime(this)">11:00</div>
                        <div class="time-slot" onclick="selectTime(this)">14:00</div>
                        <div class="time-slot" onclick="selectTime(this)">15:00</div>
                        <div class="time-slot" onclick="selectTime(this)">16:00</div>
                    </div>
                </div>
            </div>
            
            <div class="form-step">
                <div class="step-title">📍 2. Dirección de la consulta</div>
                <div class="form-group">
                    <label for="address">Dirección completa</label>
                    <input type="text" class="form-control" id="address" placeholder="Calle, número, piso, puerta">
                </div>
                <div class="form-group">
                    <label for="city">Ciudad</label>
                    <input type="text" class="form-control" id="city" placeholder="Madrid">
                </div>
                <div class="form-group">
                    <label for="postal">Código postal</label>
                    <input type="text" class="form-control" id="postal" placeholder="28001">
                </div>
            </div>
            
            <div class="form-step">
                <div class="step-title">👤 3. Información del paciente</div>
                <div class="form-group">
                    <label for="name">Nombre completo</label>
                    <input type="text" class="form-control" id="name" placeholder="Nombre y apellidos">
                </div>
                <div class="form-group">
                    <label for="phone">Teléfono</label>
                    <input type="tel" class="form-control" id="phone" placeholder="+34 600 000 000">
                </div>
                <div class="form-group">
                    <label for="symptoms">Motivo de la consulta</label>
                    <textarea class="form-control" id="symptoms" rows="3" placeholder="Describe brevemente tus síntomas o motivo de consulta"></textarea>
                </div>
            </div>
            
            <div class="summary">
                <h3>Resumen de tu consulta</h3>
                <p><strong>Doctor:</strong> Dr. Ana Rodríguez - Medicina General</p>
                <p><strong>Precio:</strong> €75</p>
                <p><strong>Duración estimada:</strong> 30-45 minutos</p>
            </div>
            
            <button class="btn-book" onclick="confirmBooking()">🚀 Confirmar Reserva</button>
        </div>
    </div>
    
    <script>
        function selectTime(element) {
            document.querySelectorAll('.time-slot').forEach(slot => slot.classList.remove('selected'));
            element.classList.add('selected');
        }
        
        function confirmBooking() {
            const date = document.getElementById('date').value;
            const selectedTime = document.querySelector('.time-slot.selected');
            const address = document.getElementById('address').value;
            const name = document.getElementById('name').value;
            const phone = document.getElementById('phone').value;
            
            if (!date || !selectedTime || !address || !name || !phone) {
                alert('Por favor, completa todos los campos obligatorios.');
                return;
            }
            
            alert('¡Consulta reservada con éxito! Recibirás un SMS de confirmación en breve.');
            window.location.href = '/booking-success';
        }
    </script>
</body>
</html>`;
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  });

  // Página de confirmación de reserva
  app.get('/booking-success', (req, res) => {
    const html = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reserva Confirmada - OnCall Clinic</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #333; background: linear-gradient(135deg, #10b981 0%, #059669 100%); min-height: 100vh; display: flex; align-items: center; }
        .container { max-width: 600px; margin: 0 auto; padding: 2rem; text-align: center; }
        .success-card { background: white; padding: 4rem 3rem; border-radius: 20px; box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
        .success-icon { font-size: 4rem; margin-bottom: 2rem; }
        .success-title { font-size: 2.5rem; font-weight: 800; color: #111827; margin-bottom: 1rem; }
        .success-message { font-size: 1.2rem; color: #6b7280; margin-bottom: 3rem; line-height: 1.8; }
        .booking-details { background: #f9fafb; padding: 2rem; border-radius: 16px; margin-bottom: 3rem; text-align: left; }
        .booking-details h3 { color: #10b981; margin-bottom: 1rem; }
        .detail-row { display: flex; justify-content: space-between; margin-bottom: 0.5rem; }
        .detail-row strong { color: #374151; }
        .btn-home { background: linear-gradient(45deg, #2563eb, #1d4ed8); color: white; padding: 14px 32px; border: none; border-radius: 12px; font-weight: 600; cursor: pointer; font-size: 16px; text-decoration: none; display: inline-block; }
        .btn-home:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(37, 99, 235, 0.3); }
    </style>
</head>
<body>
    <div class="container">
        <div class="success-card">
            <div class="success-icon">✅</div>
            <h1 class="success-title">¡Reserva Confirmada!</h1>
            <p class="success-message">
                Tu consulta médica ha sido programada exitosamente. 
                Recibirás un SMS y email de confirmación con todos los detalles.
            </p>
            
            <div class="booking-details">
                <h3>Detalles de tu consulta</h3>
                <div class="detail-row">
                    <span>Número de reserva:</span>
                    <strong>#OCC-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}</strong>
                </div>
                <div class="detail-row">
                    <span>Doctor:</span>
                    <strong>Dr. Ana Rodríguez</strong>
                </div>
                <div class="detail-row">
                    <span>Especialidad:</span>
                    <strong>Medicina General</strong>
                </div>
                <div class="detail-row">
                    <span>Fecha:</span>
                    <strong>Próxima disponibilidad</strong>
                </div>
                <div class="detail-row">
                    <span>Precio:</span>
                    <strong>€75</strong>
                </div>
            </div>
            
            <a href="/app" class="btn-home">Volver al inicio</a>
        </div>
    </div>
</body>
</html>`;
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  });

  return httpServer;
}
