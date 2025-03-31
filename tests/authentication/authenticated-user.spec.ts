import { test, expect } from '@playwright/test';
import { login, expectCorrectDashboard } from './utils';
import { EXISTING_USERS } from './types';

/**
 * Flujo 4: Usuario ya autenticado y verificado
 * 
 * 1. Iniciar sesión
 * 2. Ir manualmente a /login o /verify-code
 * 3. Verificar redirección al dashboard correspondiente
 */
test.describe('Flujo de usuario ya autenticado y verificado', () => {
  test('Paciente autenticado redirecciona de login al dashboard', async ({ page }) => {
    // 1. Iniciar sesión como paciente
    await login(page, EXISTING_USERS.patient.email, EXISTING_USERS.patient.password);
    
    // Verificar que estamos en el dashboard de paciente
    await expectCorrectDashboard(page, 'patient');
    
    // 2. Intentar acceder a la página de login
    await page.goto('/login');
    
    // 3. Verificar que redirige al dashboard de paciente
    expect(page.url()).toContain('/dashboard/patient');
  });

  test('Médico autenticado redirecciona de login al dashboard', async ({ page }) => {
    // 1. Iniciar sesión como médico
    await login(page, EXISTING_USERS.doctor.email, EXISTING_USERS.doctor.password);
    
    // Verificar que estamos en el dashboard de médico
    await expectCorrectDashboard(page, 'doctor');
    
    // 2. Intentar acceder a la página de login
    await page.goto('/login');
    
    // 3. Verificar que redirige al dashboard de médico
    expect(page.url()).toContain('/dashboard/doctor');
  });

  test('Usuario autenticado redirecciona de página de verificación al dashboard', async ({ page }) => {
    // 1. Iniciar sesión como paciente
    await login(page, EXISTING_USERS.patient.email, EXISTING_USERS.patient.password);
    
    // Verificar que estamos en el dashboard de paciente
    await expectCorrectDashboard(page, 'patient');
    
    // 2. Intentar acceder a la página de verificación
    await page.goto('/verify');
    
    // 3. Verificar que redirige al dashboard de paciente
    expect(page.url()).toContain('/dashboard/patient');
  });

  test('Usuario autenticado redirecciona de registro al dashboard', async ({ page }) => {
    // 1. Iniciar sesión como paciente
    await login(page, EXISTING_USERS.patient.email, EXISTING_USERS.patient.password);
    
    // Verificar que estamos en el dashboard de paciente
    await expectCorrectDashboard(page, 'patient');
    
    // 2. Intentar acceder a páginas de registro
    await page.goto('/register');
    expect(page.url()).toContain('/dashboard/patient');
    
    await page.goto('/register/patient');
    expect(page.url()).toContain('/dashboard/patient');
    
    await page.goto('/register/doctor');
    expect(page.url()).toContain('/dashboard/patient');
  });
});