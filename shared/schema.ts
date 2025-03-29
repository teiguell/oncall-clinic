import { pgTable, text, serial, integer, boolean, timestamp, jsonb, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema (base for both patients and doctors)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  userType: text("user_type").notNull(), // "patient" or "doctor"
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phoneNumber: text("phone_number").notNull(),
  emailVerified: boolean("email_verified").default(false),
  twoFactorEnabled: boolean("two_factor_enabled").default(false),
  profilePicture: text("profile_picture"),
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
  licenseNumber: text("license_number").notNull(),
  education: text("education").notNull(),
  experience: integer("experience").notNull(), // years
  bio: text("bio").notNull(),
  basePrice: integer("base_price").notNull(), // in cents
  isAvailable: boolean("is_available").default(true),
  averageRating: doublePrecision("average_rating").default(0),
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
  status: text("status").notNull(), // "scheduled", "completed", "canceled"
  reasonForVisit: text("reason_for_visit").notNull(),
  locationId: integer("location_id").notNull().references(() => locations.id),
  totalAmount: integer("total_amount").notNull(), // in cents
  paymentStatus: text("payment_status").notNull(), // "pending", "paid", "refunded"
  createdAt: timestamp("created_at").defaultNow(),
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
  averageRating: true
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
