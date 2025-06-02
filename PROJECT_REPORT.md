# OnCall Clinic - Reporte del Proyecto

## Estructura del Proyecto

### Frontend (React/TypeScript)
- **Ubicación**: `client/src/`
- **Frameworks**: React, TypeScript, Tailwind CSS, Shadcn/UI
- **Componentes principales**:
  - `App.tsx` - Aplicación principal con routing
  - `pages/` - 15 páginas (home, login, dashboard, admin, etc.)
  - `components/` - Componentes organizados por funcionalidad
  - `hooks/` - Custom hooks para auth, notifications, etc.
  - `lib/` - Utilidades y configuración

### Backend (Node.js/Express)
- **Ubicación**: `server/`
- **Frameworks**: Express, TypeScript
- **Archivos principales**:
  - `index.ts` - Servidor principal
  - `routes.ts` - API endpoints
  - `auth.ts` - Sistema de autenticación
  - `supabase.ts` - Integración con Supabase
  - `storage.ts` - Gestión de datos

### Configuración
- **Build System**: Vite + ESBuild
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Replit (puerto 5000)
- **Package Manager**: npm

## Estado Actual

### Funcionalidades Implementadas
✅ Sistema de autenticación completo
✅ Registro y gestión de médicos  
✅ Registro y gestión de pacientes
✅ Panel administrativo
✅ Sistema de reservas de citas
✅ Tracking de citas en tiempo real
✅ Integración con Google Maps
✅ Páginas legales (términos, privacidad)
✅ Sistema de trazabilidad con Supabase
✅ Notificaciones SMS (Twilio)
✅ Emails (SendGrid)

### Configuración de Deployment
- **Puerto**: 5000 (configurado en .replit)
- **Build**: `npm run build` genera `dist/index.mjs`
- **Start**: `npm run start` ejecuta servidor de producción
- **Desarrollo**: `npm run dev` con hot reload

### Variables de Entorno Configuradas
- `GOOGLE_CLIENT_ID`
- `GOOGLE_MAPS_API_KEY`
- `SENDGRID_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_PHONE_NUMBER`

## Problemas Actuales

### Error 502 en Deployment
- **Síntoma**: https://oncall.clinic devuelve error 502
- **Causa**: Servidor no se inicia correctamente en producción
- **Solución**: Build de producción creado, requiere restart manual del deployment

### Estado del Git Repository
- **Issue**: `.git/index.lock` impide operaciones git
- **Recomendación**: Resolver bloqueo antes de push a GitHub

## Dr Test Alpha - Datos de Prueba

```javascript
{
  id: 1,
  licenseNumber: "MD-ALPHA-TEST",
  education: "Universidad Complutense de Madrid - Medicina",
  experience: 15,
  bio: "Médico especialista disponible 24/7 en toda España",
  basePrice: 60,
  isAvailable: true,
  isVerified: true,
  locationAddress: "España - Disponible en todas las comunidades autónomas"
}
```

### Credenciales de Acceso
- **Doctor Login**: doctortest@oncall.clinic / pepe
- **Admin Password**: Pepillo2727#

## Próximos Pasos para GitHub Migration

1. **Resolver Git Lock**: `rm .git/index.lock`
2. **Configurar Remote**: `git remote add origin https://github.com/TeiGuell/oncall-clinic.git`
3. **Push Initial**: `git push -u origin main`
4. **Verificar Deployment**: Activar en Replit Deployments

## Archivos Críticos para GitHub

### Configuración
- `package.json` - Dependencias y scripts
- `.replit` - Configuración de deployment
- `vite.config.ts` - Build configuration
- `drizzle.config.ts` - Database configuration

### Source Code
- `client/src/` - Frontend completo
- `server/` - Backend completo  
- `shared/schema.ts` - Tipos compartidos
- `dist/index.mjs` - Build de producción

### Assets
- `attached_assets/` - Imágenes del proyecto
- `uploads/` - Directorio de subida de archivos

---

**Proyecto listo para migración a GitHub con funcionalidades completas de telemedicina**