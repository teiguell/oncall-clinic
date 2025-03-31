import { test, expect } from '@playwright/test';
import { login, logout } from './utils';
import { EXISTING_USERS } from './types';

/**
 * Flujo 3: Protección de rutas
 * 
 * 1. Desloguearse
 * 2. Intentar acceder a rutas protegidas:
 *    - /dashboard/doctor
 *    - /dashboard/patient
 *    - /verify-code
 * 3. Verificar redirección automática a /login
 */
test.describe('Flujo de protección de rutas', () => {
  test('Protección de rutas para usuarios no autenticados', async ({ page }) => {
    // Asegurarse de que no hay sesión iniciada
    await page.goto('/');
    
    // Intentar acceder al dashboard de médico
    await page.goto('/dashboard/doctor');
    expect(page.url()).toContain('/login');
    
    // Intentar acceder al dashboard de paciente
    await page.goto('/dashboard/patient');
    expect(page.url()).toContain('/login');
    
    // Intentar acceder a la página de verificación
    await page.goto('/verify');
    expect(page.url()).toContain('/login');
    
    // Intentar acceder al perfil
    await page.goto('/profile');
    expect(page.url()).toContain('/login');
  });

  test('Deslogueo y protección de rutas', async ({ page }) => {
    // 1. Iniciar sesión con un usuario existente
    await login(page, EXISTING_USERS.patient.email, EXISTING_USERS.patient.password);
    
    // Verificar que estamos en el dashboard
    expect(page.url()).toContain('/dashboard/patient');
    
    // 2. Cerrar sesión
    await logout(page);
    
    // Verificar que estamos en la página de login
    expect(page.url()).toContain('/login');
    
    // 3. Intentar acceder nuevamente a rutas protegidas
    await page.goto('/dashboard/patient');
    expect(page.url()).toContain('/login');
    
    await page.goto('/profile');
    expect(page.url()).toContain('/login');
  });

  test('URLs protegidas requieren autenticación', async ({ page }) => {
    // Asegurarse de que no hay sesión iniciada
    await page.goto('/');
    
    // Array de URLs protegidas para probar
    const protectedUrls = [
      '/dashboard/patient',
      '/dashboard/doctor',
      '/profile',
      '/verify',
      '/appointment/new/1', // Ruta de nueva cita con ID de médico 1
      '/appointment/success/1', // Ruta de cita exitosa con ID de cita 1
    ];
    
    // Probar cada URL protegida
    for (const url of protectedUrls) {
      await page.goto(url);
      expect(page.url()).toContain('/login');
      
      // Verificar mensaje de login
      await expect(page.getByText(/iniciar sesión/i)).toBeVisible();
    }
  });
});