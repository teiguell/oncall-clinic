import { test as base } from '@playwright/test';
import { generateTestUser } from './utils';
import { User, TestFixtures } from './types';

/**
 * Define los fixtures para los tests de autenticación
 */
export const test = base.extend<TestFixtures>({
  // Fixture para un usuario paciente de prueba
  patientUser: async ({}, use) => {
    const user = generateTestUser('patient');
    await use(user);
  },
  
  // Fixture para un usuario médico de prueba
  doctorUser: async ({}, use) => {
    const user = generateTestUser('doctor');
    await use(user);
  },
  
  // Fixture para un usuario administrador de prueba
  adminUser: async ({}, use) => {
    const user: User = {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@oncall.clinic',
      password: 'admin123',
      phoneNumber: '600000000',
      userType: 'admin'
    };
    await use(user);
  },
});