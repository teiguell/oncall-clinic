# Configuración para Integración Continua

Este archivo proporciona instrucciones para configurar los tests automatizados en un entorno de CI/CD (por ejemplo, GitHub Actions).

## Configuración de GitHub Actions

Para configurar GitHub Actions para ejecutar estos tests, puedes crear un archivo `.github/workflows/test.yml` con el siguiente contenido:

```yaml
name: E2E Tests
on: [push, pull_request]

jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - name: Install dependencies
        run: npm ci
      - name: Install Playwright Browsers
        run: npx playwright install --with-deps chromium
      - name: Build application
        run: npm run build
      - name: Start server and run tests
        run: |
          npm run dev &
          sleep 10
          npx playwright test
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

## Opciones de Configuración Adicionales

Para ajustar la configuración de las pruebas en CI, puedes modificar el archivo `playwright.config.ts`:

```typescript
// Configuración específica para entornos CI
const isCI = !!process.env.CI;

export default defineConfig({
  // ...
  retries: isCI ? 2 : 0, // Más reintentos en CI
  workers: isCI ? 1 : undefined, // Menos workers en CI
  // ...
});
```

## Recomendaciones para CI/CD

1. **Cacheo de dependencias**: Configura la caché de npm/Playwright para acelerar las builds.

```yaml
- name: Cache dependencies
  uses: actions/cache@v3
  with:
    path: |
      ~/.npm
      ~/.cache/ms-playwright
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-
```

2. **Tests selectivos para pull requests**: Considera ejecutar sólo un subconjunto de tests para pull requests y tests completos para main/develop.

3. **Notificaciones**: Configura notificaciones para fallos de tests, especialmente en las ramas principales.

4. **Reportes visuales**: Usa herramientas como Allure para visualizar los resultados de las pruebas.

## Ejecución en Entornos Específicos

Para ejecutar los tests contra diferentes entornos (desarrollo, staging, producción), puedes parametrizar la URL base:

```yaml
- name: Run tests against staging
  run: npx playwright test --project=chromium
  env:
    PLAYWRIGHT_TEST_BASE_URL: https://staging.oncall.clinic
```

Esto requiere modificar `playwright.config.ts` para usar la variable de entorno:

```typescript
export default defineConfig({
  use: {
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:5000',
    // ...
  },
});
```