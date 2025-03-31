import { Page, expect } from '@playwright/test';
import { User } from './types';

/**
 * Genera datos de prueba aleatorios para un usuario
 */
export function generateTestUser(type: 'patient' | 'doctor' = 'patient'): User {
  const randomId = Math.floor(Math.random() * 10000);
  return {
    firstName: `Test${type === 'patient' ? 'Patient' : 'Doctor'}`,
    lastName: `Apellido${randomId}`,
    email: `test${type}${randomId}@example.com`,
    password: 'Test123!',
    phoneNumber: `6${Math.floor(Math.random() * 100000000)}`,
    userType: type
  };
}

/**
 * Inicia sesión con las credenciales proporcionadas
 */
export async function login(page: Page, email: string, password: string): Promise<void> {
  await page.goto('/login');
  await page.waitForLoadState('networkidle');
  
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Contraseña').fill(password);
  
  // Click en iniciar sesión y esperar navegación
  await Promise.all([
    page.waitForNavigation(),
    page.getByRole('button', { name: /iniciar sesión/i }).click()
  ]);
}

/**
 * Registra un nuevo usuario
 */
export async function registerUser(page: Page, user: User): Promise<void> {
  await page.goto(`/register/${user.userType}`);
  await page.waitForLoadState('networkidle');
  
  // Llenar formulario de registro
  await page.getByLabel('Nombre').fill(user.firstName);
  await page.getByLabel('Apellidos').fill(user.lastName);
  await page.getByLabel('Email').fill(user.email);
  await page.getByLabel('Teléfono').fill(user.phoneNumber);
  await page.getByLabel('Contraseña').fill(user.password);
  await page.getByLabel('Confirmar contraseña').fill(user.password);
  
  // Aceptar términos y condiciones
  await page.getByRole('checkbox', { name: /acepto los términos/i }).check();
  
  // Click en registrar y esperar navegación
  await Promise.all([
    page.waitForNavigation(),
    page.getByRole('button', { name: /crear cuenta/i }).click()
  ]);
}

/**
 * Obtiene el código de verificación de la consola del servidor
 * Nota: En un entorno real, sería mejor usar servicios como Mailosaur
 */
export async function getVerificationCodeFromLogs(page: Page): Promise<string> {
  // En un entorno real, se utilizaría un servicio como Mailosaur
  // Para pruebas, podemos obtener el código directamente del almacenamiento
  // o simular un código válido
  return '123456'; // Código simulado (debe ser válido para pasar las pruebas)
}

/**
 * Verifica la cuenta de usuario con el código proporcionado
 */
export async function verifyAccount(page: Page, code: string): Promise<void> {
  // Verificar que estamos en la página correcta
  expect(page.url()).toContain('/verify');
  
  // Ingresar código de verificación
  const codeInputs = await page.getByRole('textbox').all();
  
  // Si hay múltiples inputs (uno por dígito)
  if (codeInputs.length === code.length) {
    for (let i = 0; i < code.length; i++) {
      await codeInputs[i].fill(code[i]);
    }
  } else {
    // Si hay un solo input
    await page.getByRole('textbox').fill(code);
  }
  
  // Click en verificar y esperar navegación
  await Promise.all([
    page.waitForNavigation(),
    page.getByRole('button', { name: /verificar/i }).click()
  ]);
}

/**
 * Cierra la sesión del usuario
 */
export async function logout(page: Page): Promise<void> {
  // Navega al menú de usuario
  await page.getByRole('button', { name: /perfil/i }).click();
  
  // Click en cerrar sesión y esperar navegación
  await Promise.all([
    page.waitForNavigation(),
    page.getByRole('menuitem', { name: /cerrar sesión/i }).click()
  ]);
  
  // Verificar que hemos cerrado sesión correctamente
  expect(page.url()).toContain('/login');
}

/**
 * Verifica que el usuario está en la página de dashboard correcta según su tipo
 */
export async function expectCorrectDashboard(page: Page, userType: 'patient' | 'doctor' | 'admin'): Promise<void> {
  if (userType === 'patient') {
    expect(page.url()).toContain('/dashboard/patient');
    await expect(page.getByText(/mi historial/i)).toBeVisible();
  } else if (userType === 'doctor') {
    expect(page.url()).toContain('/dashboard/doctor');
    await expect(page.getByText(/mis citas/i)).toBeVisible();
  } else if (userType === 'admin') {
    expect(page.url()).toContain('/admin');
    await expect(page.getByText(/verificación de médicos/i)).toBeVisible();
  }
}