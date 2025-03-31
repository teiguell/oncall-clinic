import { test, expect } from '@playwright/test';
import { generateTestUser, registerUser, verifyAccount, getVerificationCodeFromLogs } from './utils';
import { User } from './types';

/**
 * Flujo 1: Registro y verificación de paciente
 * 
 * 1. Ir a /register y completar formulario con email nuevo
 * 2. Verificar que redirige a /verify-code
 * 3. Simular ingreso de código correcto (puede ser mock directo)
 * 4. Verificar redirección automática a /dashboard/patient
 * 5. Si intenta volver a /verify-code, debe redirigir al dashboard
 */
test.describe('Flujo de registro y verificación de paciente', () => {
  let testUser: User;

  test.beforeEach(async () => {
    // Generar datos de usuario aleatorios para cada test
    testUser = generateTestUser('patient');
  });

  test('Completar registro de paciente', async ({ page }) => {
    // 1. Registrar un nuevo paciente
    await registerUser(page, testUser);
    
    // 2. Verificar redirección a página de verificación
    expect(page.url()).toContain('/verify');
    await expect(page.getByText(/verificación de cuenta/i)).toBeVisible();
    
    // 3. Obtener y usar código de verificación
    const verificationCode = await getVerificationCodeFromLogs(page);
    await verifyAccount(page, verificationCode);
    
    // 4. Verificar redirección al dashboard correcto
    expect(page.url()).toContain('/dashboard/patient');
    await expect(page.getByText(/Panel del Paciente/i)).toBeVisible();
    
    // 5. Verificar que al intentar acceder a la página de verificación 
    // redirecciona al dashboard por estar ya verificado
    await page.goto('/verify');
    expect(page.url()).toContain('/dashboard/patient');
  });

  test('Protección de ruta de verificación para usuario ya verificado', async ({ page }) => {
    // 1. Registrar y verificar un paciente
    await registerUser(page, testUser);
    const verificationCode = await getVerificationCodeFromLogs(page);
    await verifyAccount(page, verificationCode);
    
    // Verificar que estamos en el dashboard
    expect(page.url()).toContain('/dashboard/patient');
    
    // 2. Intentar acceder a la página de verificación directamente
    await page.goto('/verify');
    
    // 3. Verificar que redirige al dashboard por estar ya verificado
    expect(page.url()).toContain('/dashboard/patient');
    await expect(page.getByText(/Panel del Paciente/i)).toBeVisible();
  });
});