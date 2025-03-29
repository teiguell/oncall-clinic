import { pgTable, text, serial, integer, boolean, timestamp, jsonb, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema (base for both patients and doctors)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  userType: text("user_type").notNull(), // "patient", "doctor", or "admin"
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phoneNumber: text("phone_number").notNull(),
  emailVerified: boolean("email_verified").default(false),
  twoFactorEnabled: boolean("two_factor_enabled").default(false),
  profilePicture: text("profile_picture"),
  authProvider: text("auth_provider").default("local"), // "local", "google", "apple"
  authProviderId: text("auth_provider_id"), // ID from OAuth provider if applicable
  createdAt: timestamp("created_at").defaultNow(),
});

// Patient specific details
export const patientProfiles = pgTable("patient_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  address: text("address").notNull(),
  city: text("city").notNull(),
  postalCode: text("postal_code").notNull(),
  dob: timestamp("date_of_birth"),
  insuranceInfo: text("insurance_info"),
  medicalHistory: text("medical_history"),
});

// Doctor specific details
export const doctorProfiles = pgTable("doctor_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  specialtyId: integer("specialty_id").notNull().references(() => specialties.id),
  licenseNumber: text("license_number").notNull(), // Número de colegiado
  education: text("education").notNull(),
  experience: integer("experience").notNull(), // years
  bio: text("bio").notNull(),
  basePrice: integer("base_price").notNull(), // in cents
  isAvailable: boolean("is_available").default(false), // Default to false until verified
  isVerified: boolean("is_verified").default(false), // Admin verification status
  identityDocFront: text("identity_doc_front"), // DNI frontal
  identityDocBack: text("identity_doc_back"), // DNI reverso
  bankAccount: text("bank_account"), // IBAN
  averageRating: doublePrecision("average_rating").default(0),
  weeklyAvailability: jsonb("weekly_availability"),
  commissionRate: doublePrecision("commission_rate").default(15.0), // Platform commission percentage
  totalEarnings: integer("total_earnings").default(0), // Total earnings in cents
  pendingEarnings: integer("pending_earnings").default(0), // Earnings not yet transferred
  verificationDate: timestamp("verification_date"), // When the doctor was verified
  verifiedBy: integer("verified_by").references(() => users.id), // Admin who verified
});

// Specialties table
export const specialties = pgTable("specialties", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
});

// Doctor availability
export const availability = pgTable("availability", {
  id: serial("id").primaryKey(),
  doctorProfileId: integer("doctor_profile_id").notNull().references(() => doctorProfiles.id),
  dayOfWeek: integer("day_of_week").notNull(), // 0-6 (Sun-Sat)
  startTime: text("start_time").notNull(), // "HH:MM" format
  endTime: text("end_time").notNull(), // "HH:MM" format
});

// Locations
export const locations = pgTable("locations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  postalCode: text("postal_code").notNull(),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  isDefault: boolean("is_default").default(false),
});

// Appointments
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull().references(() => users.id),
  doctorId: integer("doctor_id").notNull().references(() => users.id),
  appointmentDate: timestamp("appointment_date").notNull(),
  duration: integer("duration").notNull(), // in minutes
  status: text("status").notNull(), // "scheduled", "confirmed", "en_route", "arrived", "in_progress", "completed", "canceled"
  reasonForVisit: text("reason_for_visit").notNull(),
  locationId: integer("location_id").notNull().references(() => locations.id),
  totalAmount: integer("total_amount").notNull(), // in cents
  paymentStatus: text("payment_status").notNull(), // "pending", "paid", "refunded"
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
});

// Reviews
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  appointmentId: integer("appointment_id").notNull().references(() => appointments.id),
  reviewerId: integer("reviewer_id").notNull().references(() => users.id),
  revieweeId: integer("reviewee_id").notNull().references(() => users.id),
  rating: integer("rating").notNull(), // 1-5
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Notifications
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // "appointment_reminder", "new_review", etc.
  content: text("content").notNull(),
  read: boolean("read").default(false),
  data: jsonb("data"), // Additional data like appointmentId, status, etc.
  createdAt: timestamp("created_at").defaultNow(),
});

// Payment information (to simulate actual payment integration)
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  appointmentId: integer("appointment_id").notNull().references(() => appointments.id),
  amount: integer("amount").notNull(), // in cents
  currency: text("currency").default("EUR"),
  status: text("status").notNull(), // "pending", "completed", "failed", "refunded"
  paymentMethod: text("payment_method"), // "credit_card", "transfer", etc.
  transactionId: text("transaction_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert Schemas for creating new records
export const insertUserSchema = createInsertSchema(users).omit({ 
  id: true, 
  createdAt: true
});

export const insertPatientProfileSchema = createInsertSchema(patientProfiles).omit({
  id: true
});

export const insertDoctorProfileSchema = createInsertSchema(doctorProfiles).omit({
  id: true,
  averageRating: true,
  isVerified: true,
  verificationDate: true,
  verifiedBy: true,
  totalEarnings: true,
  pendingEarnings: true
});

export const insertSpecialtySchema = createInsertSchema(specialties).omit({
  id: true
});

export const insertAvailabilitySchema = createInsertSchema(availability).omit({
  id: true
});

export const insertLocationSchema = createInsertSchema(locations).omit({
  id: true
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
  createdAt: true
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
  read: true
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true
});

// Types for use throughout the application
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type PatientProfile = typeof patientProfiles.$inferSelect;
export type InsertPatientProfile = z.infer<typeof insertPatientProfileSchema>;

export type DoctorProfile = typeof doctorProfiles.$inferSelect;
export type InsertDoctorProfile = z.infer<typeof insertDoctorProfileSchema>;

export type Specialty = typeof specialties.$inferSelect;
export type InsertSpecialty = z.infer<typeof insertSpecialtySchema>;

export type Availability = typeof availability.$inferSelect;
export type InsertAvailability = z.infer<typeof insertAvailabilitySchema>;

export type Location = typeof locations.$inferSelect;
export type InsertLocation = z.infer<typeof insertLocationSchema>;

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;

export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;

// Weekly availability type and validation schemas
export const timeSlotSchema = z.object({
  start: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Formato de hora inválido. Use HH:MM"),
  end: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Formato de hora inválido. Use HH:MM")
}).refine(data => data.start < data.end, {
  message: "La hora de inicio debe ser anterior a la hora de fin",
  path: ["start", "end"],
});

export const weeklyAvailabilitySchema = z.object({
  monday: z.array(timeSlotSchema),
  tuesday: z.array(timeSlotSchema),
  wednesday: z.array(timeSlotSchema),
  thursday: z.array(timeSlotSchema),
  friday: z.array(timeSlotSchema),
  saturday: z.array(timeSlotSchema),
  sunday: z.array(timeSlotSchema),
});

export type TimeSlot = z.infer<typeof timeSlotSchema>;
export type WeeklyAvailability = z.infer<typeof weeklyAvailabilitySchema>;

// Doctor registration specific schemas
export const doctorRegistrationSchema = z.object({
  // User information
  email: z.string().email("Correo electrónico inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  confirmPassword: z.string(),
  firstName: z.string().min(2, "Nombre demasiado corto"),
  lastName: z.string().min(2, "Apellido demasiado corto"),
  phoneNumber: z.string().min(9, "Número de teléfono inválido"),
  
  // Professional information
  licenseNumber: z.string().min(4, "Número de colegiado inválido"),
  specialtyId: z.number().int().positive("Debe seleccionar una especialidad"),
  education: z.string().min(10, "Por favor, proporcione más detalles sobre su educación"),
  experience: z.number().int().min(0, "La experiencia no puede ser negativa"),
  bio: z.string().min(50, "La biografía debe tener al menos 50 caracteres"),
  basePrice: z.number().int().positive("El precio base debe ser mayor que cero"),
  
  // Document uploads (as File objects in frontend, as strings in backend)
  profilePhoto: z.any(),
  identityDocFront: z.any(),
  identityDocBack: z.any(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

export type DoctorRegistration = z.infer<typeof doctorRegistrationSchema>;

// Admin verification schema
export const doctorVerificationSchema = z.object({
  doctorId: z.number().int().positive(),
  isVerified: z.boolean(),
  adminNotes: z.string().optional(),
});

export type DoctorVerification = z.infer<typeof doctorVerificationSchema>;

// Verification code schema
export const verificationCodes = pgTable("verification_codes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  code: text("code").notNull(),
  type: text("type").notNull(), // "signup", "login", "password_reset"
  method: text("method").notNull(), // "email", "sms", "whatsapp", "totp"
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  usedAt: timestamp("used_at"),
});

export const insertVerificationCodeSchema = createInsertSchema(verificationCodes).omit({
  id: true,
  createdAt: true,
  usedAt: true,
});

export type VerificationCode = typeof verificationCodes.$inferSelect;
export type InsertVerificationCode = z.infer<typeof insertVerificationCodeSchema>;

// Patient registration schema
export const patientRegistrationSchema = z.object({
  // User information
  email: z.string().email("Correo electrónico inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  confirmPassword: z.string(),
  firstName: z.string().min(2, "Nombre demasiado corto"),
  lastName: z.string().min(2, "Apellido demasiado corto"),
  phoneNumber: z.string().min(9, "Número de teléfono inválido"),
  
  // Optional fields
  address: z.string().optional(),
  city: z.string().optional(), 
  postalCode: z.string().optional(),
  dob: z.string().optional(), // fecha de nacimiento (string para facilitar manejo en frontend)
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

export type PatientRegistration = z.infer<typeof patientRegistrationSchema>;

// Verification code validation schema
export const verifyCodeSchema = z.object({
  verificationId: z.string(),
  code: z.string().length(6, "El código debe tener 6 dígitos"),
});

export type VerifyCodeData = z.infer<typeof verifyCodeSchema>;

// Login schema
export const loginSchema = z.object({
  email: z.string().email("Correo electrónico inválido"),
  password: z.string().min(1, "Por favor, ingrese su contraseña"),
  remember: z.boolean().optional(),
});

export type LoginData = z.infer<typeof loginSchema>;

// Schema para buscar médicos por ubicación
export const doctorSearchSchema = z.object({
  location: z.object({
    lat: z.number(),
    lng: z.number()
  }),
  maxDistance: z.number().default(10), // distancia máxima en kilómetros
  specialtyName: z.string().default('medicina general')
});

export type DoctorSearchParams = z.infer<typeof doctorSearchSchema>;

// Schema para crear cita
export const appointmentBookingSchema = z.object({
  doctorId: z.number(),
  patientId: z.number(),
  appointmentDate: z.string(), // ISO string format
  duration: z.number().default(30), // duración en minutos por defecto 30
  reasonForVisit: z.string(),
  locationId: z.number(),
  totalAmount: z.number() // en centavos
});

export type AppointmentBookingData = z.infer<typeof appointmentBookingSchema>;
