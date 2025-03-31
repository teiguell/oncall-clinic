# Tests de OnCall Clinic

Este directorio contiene tests automatizados para verificar el correcto funcionamiento de OnCall Clinic, especialmente enfocados en los flujos de autenticación y navegación.

## Estructura de tests

Los tests están organizados en la carpeta `authentication` y cubren los siguientes flujos:

1. **Registro y verificación de paciente**
   - Registrar un nuevo paciente
   - Verificar el código enviado
   - Comprobar redirecciones correctas

2. **Flujo de médico verificado**
   - Acceso al dashboard correcto
   - Restricción de acceso a dashboards de otros roles
   - Conexión WebSocket exitosa

3. **Protección de rutas**
   - Redirección a login para usuarios no autenticados
   - Verificación tras cierre de sesión

4. **Usuario ya autenticado**
   - Redirección desde páginas de login/registro al dashboard
   - Protección de la página de verificación

## Ejecución de tests

Para ejecutar los tests, utiliza los siguientes comandos:

```bash
# Ejecutar todos los tests
npx playwright test

# Ejecutar sólo los tests de autenticación
npx playwright test tests/authentication/

# Ejecutar en modo debug (con navegador visible)
npx playwright test --debug

# Ejecutar con interfaz gráfica
npx playwright test --ui
```

## Requisitos

Para que los tests funcionen correctamente, la aplicación debe estar en ejecución (npm run dev). Los tests están configurados para usar la URL base http://localhost:5000.

## Notas para la integración continua

Estos tests son ideales para integración continua con GitHub Actions o servicios similares. Para ello:

1. Asegúrate de que los tests no dependan de estado externo (APIs reales, etc.)
2. Configura timeouts apropiados para esperar a que los elementos aparezcan
3. Usa retries en CI para manejar posibles flakiness

## Configuración de navegadores

Por defecto, los tests se ejecutan en Chromium. Para añadir más navegadores, edita `playwright.config.ts` y añade más proyectos.