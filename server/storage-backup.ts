import { 
  User, InsertUser, 
  PatientProfile, InsertPatientProfile,
  DoctorProfile, InsertDoctorProfile,
  Specialty, InsertSpecialty,
  Availability, InsertAvailability,
  Location, InsertLocation,
  Appointment, InsertAppointment,
  Review, InsertReview,
  Notification, InsertNotification,
  Payment, InsertPayment,
  VerificationCode, InsertVerificationCode,
  RevolutTransaction, InsertRevolutTransaction,
  BookingConfirmation, InsertBookingConfirmation,
  TransferLog, InsertTransferLog,
  DoctorLocationTracking, InsertDoctorLocationTracking,
  PatientFeedback, InsertPatientFeedback,
  GuestPatient,
  WeeklyAvailability
} from '@shared/schema';
import { z } from 'zod';
import createMemoryStore from 'memorystore';
import session from 'express-session';

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  sessionStore: any;

  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByOAuth(provider: string, providerId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User | undefined>;

  // Patient Profiles
  getPatientProfile(id: number): Promise<PatientProfile | undefined>;
  getPatientProfileByUserId(userId: number): Promise<PatientProfile | undefined>;
  createPatientProfile(profile: InsertPatientProfile): Promise<PatientProfile>;
  updatePatientProfile(id: number, data: Partial<PatientProfile>): Promise<PatientProfile | undefined>;

  // Verification Codes
  createVerificationCode(data: InsertVerificationCode): Promise<VerificationCode>;
  getVerificationCode(userId: number, code: string, type: string): Promise<VerificationCode | undefined>;
  markVerificationCodeAsUsed(id: number): Promise<VerificationCode | undefined>;

  // Doctor Profiles
  getDoctorProfile(id: number): Promise<DoctorProfile | undefined>;
  getDoctorProfileByUserId(userId: number): Promise<DoctorProfile | undefined>;
  getAllDoctorProfiles(): Promise<DoctorProfile[]>;
  getUnverifiedDoctorProfiles(): Promise<DoctorProfile[]>;
  createDoctorProfile(profile: InsertDoctorProfile): Promise<DoctorProfile>;
  updateDoctorProfile(id: number, data: Partial<DoctorProfile>): Promise<DoctorProfile | undefined>;
  updateDoctorWeeklyAvailability(doctorId: number, weeklyAvailability: WeeklyAvailability): Promise<DoctorProfile | undefined>;
  verifyDoctor(doctorId: number, adminId: number, notes?: string): Promise<DoctorProfile | undefined>;
  searchDoctors(specialtyId?: number, available?: boolean, verified?: boolean): Promise<DoctorProfile[]>;
  searchDoctorsByLocation(lat: number, lng: number, maxDistance?: number, specialtyName?: string): Promise<Array<DoctorProfile & { distance: number }>>;
  updateDoctorBankAccount(doctorId: number, bankAccount: string): Promise<DoctorProfile | undefined>;
  getDoctorEarnings(doctorId: number): Promise<{
    totalEarnings: number;
    pendingEarnings: number;
    commissionRate: number;
    netEarnings: number;
  } | undefined>;

  // Specialties
  getSpecialty(id: number): Promise<Specialty | undefined>;
  getAllSpecialties(): Promise<Specialty[]>;
  createSpecialty(specialty: InsertSpecialty): Promise<Specialty>;

  // Availability
  getAvailability(id: number): Promise<Availability | undefined>;
  getAvailabilityByDoctorId(doctorProfileId: number): Promise<Availability[]>;
  createAvailability(avail: InsertAvailability): Promise<Availability>;
  updateAvailability(id: number, data: Partial<Availability>): Promise<Availability | undefined>;

  // Locations
  getLocation(id: number): Promise<Location | undefined>;
  getLocationsByUserId(userId: number): Promise<Location[]>;
  createLocation(location: InsertLocation): Promise<Location>;
  updateLocation(id: number, data: Partial<Location>): Promise<Location | undefined>;

  // Appointments
  getAppointment(id: number): Promise<Appointment | undefined>;
  getAppointmentsByPatientId(patientId: number): Promise<Appointment[]>;
  getAppointmentsByDoctorId(doctorId: number): Promise<Appointment[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: number, data: Partial<Appointment>): Promise<Appointment | undefined>;

  // Reviews
  getReview(id: number): Promise<Review | undefined>;
  getReviewsByRevieweeId(revieweeId: number): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;

  // Notifications
  getNotifications(userId: number): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<Notification | undefined>;

  // Payments
  getPayment(id: number): Promise<Payment | undefined>;
  getPaymentByAppointmentId(appointmentId: number): Promise<Payment | undefined>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePayment(id: number, data: Partial<Payment>): Promise<Payment | undefined>;

  // Guest Patients
  createGuestPatient(guestPatient: z.infer<typeof import('@shared/schema').guestPatientSchema>): Promise<GuestPatient>;

  // Revolut Transactions
  createRevolutTransaction(transaction: InsertRevolutTransaction): Promise<RevolutTransaction>;
  getRevolutTransaction(id: number): Promise<RevolutTransaction | undefined>;
  getRevolutTransactionByAppointment(appointmentId: number): Promise<RevolutTransaction | undefined>;
  updateRevolutTransaction(id: number, data: Partial<RevolutTransaction>): Promise<RevolutTransaction | undefined>;

  // Booking Confirmations
  createBookingConfirmation(confirmation: InsertBookingConfirmation): Promise<BookingConfirmation>;
  getBookingConfirmation(id: number): Promise<BookingConfirmation | undefined>;
  getBookingConfirmationByTrackingCode(trackingCode: string): Promise<BookingConfirmation | undefined>;
  getBookingConfirmationByAppointment(appointmentId: number): Promise<BookingConfirmation | undefined>;
  updateBookingConfirmation(id: number, data: Partial<BookingConfirmation>): Promise<BookingConfirmation | undefined>;

  // Transfer Logs
  createTransferLog(log: InsertTransferLog): Promise<TransferLog>;
  getTransferLogsByAppointment(appointmentId: number): Promise<TransferLog[]>;

  // Doctor Location Tracking
  createDoctorLocationTracking(location: InsertDoctorLocationTracking): Promise<DoctorLocationTracking>;
  getDoctorActiveLocation(doctorId: number, appointmentId: number): Promise<DoctorLocationTracking[]>;
  deactivateOldLocations(doctorId: number): Promise<void>;

  // Patient Feedback
  createPatientFeedback(feedback: InsertPatientFeedback): Promise<PatientFeedback>;
  getPatientFeedbackByAppointment(appointmentId: number): Promise<PatientFeedback[]>;
  updatePatientFeedback(id: number, data: Partial<PatientFeedback>): Promise<PatientFeedback | undefined>;
}

export class MemStorage implements IStorage {
  public sessionStore: any;
  private users = new Map<number, User>();
  private patientProfiles = new Map<number, PatientProfile>();
  private doctorProfiles = new Map<number, DoctorProfile>();
  private specialties = new Map<number, Specialty>();
  private availability = new Map<number, Availability>();
  private locations = new Map<number, Location>();
  private appointments = new Map<number, Appointment>();
  private reviews = new Map<number, Review>();
  private notifications = new Map<number, Notification>();
  private payments = new Map<number, Payment>();
  private verificationCodes = new Map<number, VerificationCode>();
  private revolutTransactions = new Map<number, RevolutTransaction>();
  private bookingConfirmations = new Map<number, BookingConfirmation>();
  private transferLogs = new Map<number, TransferLog>();
  private doctorLocationTracking = new Map<number, DoctorLocationTracking>();
  private patientFeedback = new Map<number, PatientFeedback>();
  private guestPatients = new Map<number, GuestPatient>();

  private currentUserId = 1000;
  private currentPatientProfileId = 1;
  private currentDoctorProfileId = 1;
  private currentSpecialtyId = 2;
  private currentAvailabilityId = 1;
  private currentLocationId = 1;
  private currentAppointmentId = 1;
  private currentReviewId = 1;
  private currentNotificationId = 1;
  private currentPaymentId = 1;
  private currentVerificationCodeId = 1;
  private currentRevolutTransactionId = 1;
  private currentBookingConfirmationId = 1;
  private currentTransferLogId = 1;
  private currentDoctorLocationTrackingId = 1;
  private currentPatientFeedbackId = 1;
  private currentGuestPatientId = 1;

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
    this.initializeData();
  }

  private initializeData() {
    // Create General Medicine specialty
    const generalMedicineSpecialty: Specialty = {
      id: 1,
      name: "General Medicine",
      description: "General medical practice and primary healthcare"
    };
    this.specialties.set(1, generalMedicineSpecialty);

    // Create test doctor user
    const testDoctorUser: User = {
      id: 999,
      username: "doctortest",
      email: "doctortest@oncall.clinic",
      password: "pepe",
      userType: "doctor",
      firstName: "María",
      lastName: "González",
      phoneNumber: "+34600123456",
      emailVerified: true,
      twoFactorEnabled: false,
      profilePicture: null,
      authProvider: "local",
      authProviderId: null,
      createdAt: new Date()
    };
    this.users.set(999, testDoctorUser);

    // Create test doctor profile
    const testDoctorProfile: DoctorProfile = {
      id: 999,
      userId: 999,
      specialtyId: 1,
      licenseNumber: "TEST123456",
      education: "Medical Degree, Universidad Complutense Madrid",
      experience: 10,
      bio: "General practitioner with extensive experience in home healthcare services",
      basePrice: 8000,
      isAvailable: true,
      isVerified: true,
      averageRating: 4.8,
      totalEarnings: 0,
      pendingEarnings: 0,
      commissionRate: 15,
      verificationDate: new Date(),
      verifiedBy: 1,
      bankAccount: "ES123456789",
      identityDocFront: null,
      identityDocBack: null,
      medicalLicense: null,
      insuranceCert: null,
      locationLat: 39.5696,
      locationLng: 2.6502,
      locationAddress: "Palma de Mallorca, Islas Baleares"
    };
    this.doctorProfiles.set(999, testDoctorProfile);

    // Create admin user
    const adminUser: User = {
      id: 1,
      username: 'admin',
      email: 'admin@oncall.clinic',
      password: 'admin123',
      userType: 'admin',
      firstName: 'Admin',
      lastName: 'User',
      phoneNumber: '123456789',
      emailVerified: true,
      twoFactorEnabled: false,
      profilePicture: null,
      authProvider: 'local',
      authProviderId: null,
      createdAt: new Date()
    };
    this.users.set(1, adminUser);

    // Add test doctor user (plaintext password for testing)
    const testDoctorUser: User = {
      id: 2,
      username: "doctortest",
      email: "doctortest@oncall.clinic",
      password: "pepe",
      userType: "doctor",
      firstName: "María",
      lastName: "González",
      phoneNumber: "+34600123456",
      emailVerified: true,
      twoFactorEnabled: false,
      profilePicture: null,
      authProvider: "local",
      authProviderId: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(2, testDoctorUser);

    // Add doctor profile for test doctor
    const testDoctorProfile: DoctorProfile = {
      id: 1,
      userId: 2,
      specialtyId: 1,
      licenseNumber: "MD-12345",
      education: "Universidad de Barcelona - Medicina",
      experience: 10,
      bio: "Especialista en medicina general con 10 años de experiencia",
      basePrice: 80,
      isAvailable: true,
      isVerified: true,
      identityDocFront: null,
      identityDocBack: null,
      criminalRecordCert: null,
      professionalPhoto: null,
      bankAccount: "ES12 3456 7890 1234 5678 9012",
      locationLatitude: 39.5696,
      locationLongitude: 2.6502,
      locationAddress: "Palma de Mallorca, Baleares"
    };
    this.doctorProfiles.set(1, testDoctorProfile);

    // Add test patient user (plaintext password for testing)
    const testPatientUser: User = {
      id: 999,
      email: "patient@test.com",
      password: "test123",
      userType: "patient",
      username: "testpatient",
      firstName: "Test",
      lastName: "Patient",
      phoneNumber: "+34600000000",
      emailVerified: true,
      twoFactorEnabled: false,
      profilePicture: null,
      authProvider: "local",
      authProviderId: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(999, testPatientUser);
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }

  async getUserByOAuth(provider: string, providerId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.authProvider === provider && user.authProviderId === providerId
    );
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const createdAt = new Date();
    const newUser: User = { ...user, id, createdAt };
    this.users.set(id, newUser);
    return newUser;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updatedUser = { ...user, ...data };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Patient Profiles
  async getPatientProfile(id: number): Promise<PatientProfile | undefined> {
    return this.patientProfiles.get(id);
  }

  async getPatientProfileByUserId(userId: number): Promise<PatientProfile | undefined> {
    return Array.from(this.patientProfiles.values()).find(
      (profile) => profile.userId === userId
    );
  }

  async createPatientProfile(profile: InsertPatientProfile): Promise<PatientProfile> {
    const id = this.currentPatientProfileId++;
    const newProfile: PatientProfile = { ...profile, id };
    this.patientProfiles.set(id, newProfile);
    return newProfile;
  }

  async updatePatientProfile(id: number, data: Partial<PatientProfile>): Promise<PatientProfile | undefined> {
    const profile = this.patientProfiles.get(id);
    if (!profile) return undefined;

    const updatedProfile = { ...profile, ...data };
    this.patientProfiles.set(id, updatedProfile);
    return updatedProfile;
  }

  // Verification Codes
  async createVerificationCode(data: InsertVerificationCode): Promise<VerificationCode> {
    const id = this.currentVerificationCodeId++;
    const createdAt = new Date();
    const newCode: VerificationCode = { ...data, id, createdAt, usedAt: null };
    this.verificationCodes.set(id, newCode);
    return newCode;
  }

  async getVerificationCode(userId: number, code: string, type: string): Promise<VerificationCode | undefined> {
    return Array.from(this.verificationCodes.values()).find(
      (vc) => vc.userId === userId && vc.code === code && vc.type === type && !vc.usedAt
    );
  }

  async markVerificationCodeAsUsed(id: number): Promise<VerificationCode | undefined> {
    const code = this.verificationCodes.get(id);
    if (!code) return undefined;

    const updatedCode = { ...code, usedAt: new Date() };
    this.verificationCodes.set(id, updatedCode);
    return updatedCode;
  }

  // Doctor Profiles
  async getDoctorProfile(id: number): Promise<DoctorProfile | undefined> {
    return this.doctorProfiles.get(id);
  }

  async getDoctorProfileByUserId(userId: number): Promise<DoctorProfile | undefined> {
    return Array.from(this.doctorProfiles.values()).find(
      (profile) => profile.userId === userId
    );
  }

  async getAllDoctorProfiles(): Promise<DoctorProfile[]> {
    return Array.from(this.doctorProfiles.values());
  }

  async getUnverifiedDoctorProfiles(): Promise<DoctorProfile[]> {
    return Array.from(this.doctorProfiles.values()).filter(
      (profile) => !profile.isVerified
    );
  }

  async createDoctorProfile(profile: InsertDoctorProfile): Promise<DoctorProfile> {
    const id = this.currentDoctorProfileId++;
    const newProfile: DoctorProfile = { 
      ...profile, 
      id,
      averageRating: 0,
      isAvailable: false,
      isVerified: false,
      totalEarnings: 0,
      pendingEarnings: 0,
      commissionRate: 15,
      verificationDate: null,
      verifiedBy: null,
      identityDocFront: profile.identityDocFront || null,
      identityDocBack: profile.identityDocBack || null,
      medicalLicense: profile.medicalLicense || null,
      insuranceCert: profile.insuranceCert || null,
      bankAccount: profile.bankAccount || null,
      locationLat: profile.locationLat || null,
      locationLng: profile.locationLng || null,
      locationAddress: profile.locationAddress || null
    };
    this.doctorProfiles.set(id, newProfile);
    return newProfile;
  }

  async updateDoctorProfile(id: number, data: Partial<DoctorProfile>): Promise<DoctorProfile | undefined> {
    const profile = this.doctorProfiles.get(id);
    if (!profile) return undefined;

    const updatedProfile = { ...profile, ...data };
    this.doctorProfiles.set(id, updatedProfile);
    return updatedProfile;
  }

  async updateDoctorWeeklyAvailability(doctorId: number, weeklyAvailability: WeeklyAvailability): Promise<DoctorProfile | undefined> {
    const profile = this.doctorProfiles.get(doctorId);
    if (!profile) return undefined;

    const updatedProfile = { ...profile, weeklyAvailability };
    this.doctorProfiles.set(doctorId, updatedProfile);
    return updatedProfile;
  }

  async verifyDoctor(doctorId: number, adminId: number, notes?: string): Promise<DoctorProfile | undefined> {
    const profile = this.doctorProfiles.get(doctorId);
    if (!profile) return undefined;

    const updatedProfile = { 
      ...profile, 
      isVerified: true, 
      verificationDate: new Date(),
      verifiedBy: adminId 
    };
    this.doctorProfiles.set(doctorId, updatedProfile);
    return updatedProfile;
  }

  async searchDoctors(specialtyId?: number, available?: boolean, verified?: boolean): Promise<DoctorProfile[]> {
    let doctors = Array.from(this.doctorProfiles.values());

    if (specialtyId) {
      doctors = doctors.filter(doctor => doctor.specialtyId === specialtyId);
    }
    if (available !== undefined) {
      doctors = doctors.filter(doctor => doctor.isAvailable === available);
    }
    if (verified !== undefined) {
      doctors = doctors.filter(doctor => doctor.isVerified === verified);
    }

    return doctors;
  }

  async searchDoctorsByLocation(lat: number, lng: number, maxDistance?: number, specialtyName?: string): Promise<Array<DoctorProfile & { distance: number }>> {
    const doctors = Array.from(this.doctorProfiles.values())
      .filter(doctor => doctor.locationLat && doctor.locationLng)
      .map(doctor => ({
        ...doctor,
        distance: this.calculateDistance(lat, lng, doctor.locationLat!, doctor.locationLng!)
      }))
      .filter(doctor => !maxDistance || doctor.distance <= maxDistance)
      .sort((a, b) => a.distance - b.distance);

    return doctors;
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  async updateDoctorBankAccount(doctorId: number, bankAccount: string): Promise<DoctorProfile | undefined> {
    const profile = this.doctorProfiles.get(doctorId);
    if (!profile) return undefined;

    const updatedProfile = { ...profile, bankAccount };
    this.doctorProfiles.set(doctorId, updatedProfile);
    return updatedProfile;
  }

  async getDoctorEarnings(doctorId: number): Promise<{
    totalEarnings: number;
    pendingEarnings: number;
    commissionRate: number;
    netEarnings: number;
  } | undefined> {
    const profile = this.doctorProfiles.get(doctorId);
    if (!profile) return undefined;

    return {
      totalEarnings: profile.totalEarnings || 0,
      pendingEarnings: profile.pendingEarnings || 0,
      commissionRate: profile.commissionRate || 15,
      netEarnings: (profile.totalEarnings || 0) * (1 - (profile.commissionRate || 15) / 100)
    };
  }

  // Specialties
  async getSpecialty(id: number): Promise<Specialty | undefined> {
    return this.specialties.get(id);
  }

  async getAllSpecialties(): Promise<Specialty[]> {
    return Array.from(this.specialties.values());
  }

  async createSpecialty(specialty: InsertSpecialty): Promise<Specialty> {
    const id = this.currentSpecialtyId++;
    const newSpecialty: Specialty = { ...specialty, id };
    this.specialties.set(id, newSpecialty);
    return newSpecialty;
  }

  // Availability
  async getAvailability(id: number): Promise<Availability | undefined> {
    return this.availability.get(id);
  }

  async getAvailabilityByDoctorId(doctorProfileId: number): Promise<Availability[]> {
    return Array.from(this.availability.values()).filter(
      (avail) => avail.doctorProfileId === doctorProfileId
    );
  }

  async createAvailability(avail: InsertAvailability): Promise<Availability> {
    const id = this.currentAvailabilityId++;
    const newAvailability: Availability = { ...avail, id };
    this.availability.set(id, newAvailability);
    return newAvailability;
  }

  async updateAvailability(id: number, data: Partial<Availability>): Promise<Availability | undefined> {
    const availability = this.availability.get(id);
    if (!availability) return undefined;

    const updatedAvailability = { ...availability, ...data };
    this.availability.set(id, updatedAvailability);
    return updatedAvailability;
  }

  // Locations
  async getLocation(id: number): Promise<Location | undefined> {
    return this.locations.get(id);
  }

  async getLocationsByUserId(userId: number): Promise<Location[]> {
    return Array.from(this.locations.values()).filter(
      (location) => location.userId === userId
    );
  }

  async createLocation(location: InsertLocation): Promise<Location> {
    const id = this.currentLocationId++;
    const newLocation: Location = { ...location, id };
    this.locations.set(id, newLocation);
    return newLocation;
  }

  async updateLocation(id: number, data: Partial<Location>): Promise<Location | undefined> {
    const location = this.locations.get(id);
    if (!location) return undefined;

    const updatedLocation = { ...location, ...data };
    this.locations.set(id, updatedLocation);
    return updatedLocation;
  }

  // Appointments
  async getAppointment(id: number): Promise<Appointment | undefined> {
    return this.appointments.get(id);
  }

  async getAppointmentsByPatientId(patientId: number): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).filter(
      (appointment) => appointment.patientId === patientId
    );
  }

  async getAppointmentsByDoctorId(doctorId: number): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).filter(
      (appointment) => appointment.doctorId === doctorId
    );
  }

  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const id = this.currentAppointmentId++;
    const createdAt = new Date();
    const updatedAt = new Date();
    const newAppointment: Appointment = { ...appointment, id, createdAt, updatedAt };
    this.appointments.set(id, newAppointment);
    return newAppointment;
  }

  async updateAppointment(id: number, data: Partial<Appointment>): Promise<Appointment | undefined> {
    const appointment = this.appointments.get(id);
    if (!appointment) return undefined;

    const updatedAppointment = { ...appointment, ...data, updatedAt: new Date() };
    this.appointments.set(id, updatedAppointment);
    return updatedAppointment;
  }

  // Reviews
  async getReview(id: number): Promise<Review | undefined> {
    return this.reviews.get(id);
  }

  async getReviewsByRevieweeId(revieweeId: number): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(
      (review) => review.revieweeId === revieweeId
    );
  }

  async createReview(review: InsertReview): Promise<Review> {
    const id = this.currentReviewId++;
    const createdAt = new Date();
    const newReview: Review = { ...review, id, createdAt };
    this.reviews.set(id, newReview);
    return newReview;
  }

  // Notifications
  async getNotifications(userId: number): Promise<Notification[]> {
    return Array.from(this.notifications.values()).filter(
      (notification) => notification.userId === userId
    );
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const id = this.currentNotificationId++;
    const createdAt = new Date();
    const newNotification: Notification = { ...notification, id, createdAt, read: false };
    this.notifications.set(id, newNotification);
    return newNotification;
  }

  async markNotificationAsRead(id: number): Promise<Notification | undefined> {
    const notification = this.notifications.get(id);
    if (!notification) return undefined;

    const updatedNotification = { ...notification, read: true };
    this.notifications.set(id, updatedNotification);
    return updatedNotification;
  }

  // Payments
  async getPayment(id: number): Promise<Payment | undefined> {
    return this.payments.get(id);
  }

  async getPaymentByAppointmentId(appointmentId: number): Promise<Payment | undefined> {
    return Array.from(this.payments.values()).find(
      (payment) => payment.appointmentId === appointmentId
    );
  }

  async createPayment(payment: InsertPayment): Promise<Payment> {
    const id = this.currentPaymentId++;
    const createdAt = new Date();
    const newPayment: Payment = { ...payment, id, createdAt };
    this.payments.set(id, newPayment);
    return newPayment;
  }

  async updatePayment(id: number, data: Partial<Payment>): Promise<Payment | undefined> {
    const payment = this.payments.get(id);
    if (!payment) return undefined;

    const updatedPayment = { ...payment, ...data };
    this.payments.set(id, updatedPayment);
    return updatedPayment;
  }

  // Guest Patients
  async createGuestPatient(guestPatient: z.infer<typeof import('@shared/schema').guestPatientSchema>): Promise<GuestPatient> {
    const id = this.currentGuestPatientId++;
    const newGuestPatient: GuestPatient = {
      id,
      ...guestPatient,
      createdAt: new Date()
    };
    this.guestPatients.set(id, newGuestPatient);
    return newGuestPatient;
  }

  // Revolut Transactions
  async createRevolutTransaction(transaction: InsertRevolutTransaction): Promise<RevolutTransaction> {
    const id = this.currentRevolutTransactionId++;
    const newTransaction: RevolutTransaction = {
      id,
      createdAt: new Date(),
      paidAt: null,
      transferredAt: null,
      ...transaction
    };
    this.revolutTransactions.set(id, newTransaction);
    return newTransaction;
  }

  async getRevolutTransaction(id: number): Promise<RevolutTransaction | undefined> {
    return this.revolutTransactions.get(id);
  }

  async getRevolutTransactionByAppointment(appointmentId: number): Promise<RevolutTransaction | undefined> {
    return Array.from(this.revolutTransactions.values()).find(
      (transaction) => transaction.appointmentId === appointmentId
    );
  }

  async updateRevolutTransaction(id: number, data: Partial<RevolutTransaction>): Promise<RevolutTransaction | undefined> {
    const transaction = this.revolutTransactions.get(id);
    if (!transaction) return undefined;

    const updatedTransaction = { ...transaction, ...data };
    this.revolutTransactions.set(id, updatedTransaction);
    return updatedTransaction;
  }

  // Booking Confirmations
  async createBookingConfirmation(confirmation: InsertBookingConfirmation): Promise<BookingConfirmation> {
    const id = this.currentBookingConfirmationId++;
    const newConfirmation: BookingConfirmation = {
      id,
      createdAt: new Date(),
      patientConfirmedAt: null,
      doctorConfirmedAt: null,
      ...confirmation
    };
    this.bookingConfirmations.set(id, newConfirmation);
    return newConfirmation;
  }

  async getBookingConfirmation(id: number): Promise<BookingConfirmation | undefined> {
    return this.bookingConfirmations.get(id);
  }

  async getBookingConfirmationByTrackingCode(trackingCode: string): Promise<BookingConfirmation | undefined> {
    return Array.from(this.bookingConfirmations.values()).find(
      (confirmation) => confirmation.trackingCode === trackingCode
    );
  }

  async getBookingConfirmationByAppointment(appointmentId: number): Promise<BookingConfirmation | undefined> {
    return Array.from(this.bookingConfirmations.values()).find(
      (confirmation) => confirmation.appointmentId === appointmentId
    );
  }

  async updateBookingConfirmation(id: number, data: Partial<BookingConfirmation>): Promise<BookingConfirmation | undefined> {
    const confirmation = this.bookingConfirmations.get(id);
    if (!confirmation) return undefined;

    const updatedConfirmation = { ...confirmation, ...data };
    this.bookingConfirmations.set(id, updatedConfirmation);
    return updatedConfirmation;
  }

  // Transfer Logs
  async createTransferLog(log: InsertTransferLog): Promise<TransferLog> {
    const id = this.currentTransferLogId++;
    const newLog: TransferLog = {
      id,
      processedAt: new Date(),
      ...log
    };
    this.transferLogs.set(id, newLog);
    return newLog;
  }

  async getTransferLogsByAppointment(appointmentId: number): Promise<TransferLog[]> {
    return Array.from(this.transferLogs.values()).filter(
      (log) => log.appointmentId === appointmentId
    );
  }

  // Doctor Location Tracking
  async createDoctorLocationTracking(location: InsertDoctorLocationTracking): Promise<DoctorLocationTracking> {
    const id = this.currentDoctorLocationTrackingId++;
    const newLocation: DoctorLocationTracking = {
      id,
      timestamp: new Date(),
      ...location
    };
    this.doctorLocationTracking.set(id, newLocation);
    return newLocation;
  }

  async getDoctorActiveLocation(doctorId: number, appointmentId: number): Promise<DoctorLocationTracking[]> {
    return Array.from(this.doctorLocationTracking.values()).filter(
      (location) => location.doctorId === doctorId && location.appointmentId === appointmentId && location.isActive
    );
  }

  async deactivateOldLocations(doctorId: number): Promise<void> {
    for (const [id, location] of this.doctorLocationTracking.entries()) {
      if (location.doctorId === doctorId) {
        const updatedLocation = { ...location, isActive: false };
        this.doctorLocationTracking.set(id, updatedLocation);
      }
    }
  }

  // Patient Feedback
  async createPatientFeedback(feedback: InsertPatientFeedback): Promise<PatientFeedback> {
    const id = this.currentPatientFeedbackId++;
    const newFeedback: PatientFeedback = {
      id,
      createdAt: new Date(),
      ...feedback
    };
    this.patientFeedback.set(id, newFeedback);
    return newFeedback;
  }

  async getPatientFeedbackByAppointment(appointmentId: number): Promise<PatientFeedback[]> {
    return Array.from(this.patientFeedback.values()).filter(f => f.appointmentId === appointmentId);
  }

  async updatePatientFeedback(id: number, data: Partial<PatientFeedback>): Promise<PatientFeedback | undefined> {
    const feedback = this.patientFeedback.get(id);
    if (!feedback) return undefined;

    const updatedFeedback = { ...feedback, ...data };
    this.patientFeedback.set(id, updatedFeedback);
    return updatedFeedback;
  }
}

export const storage = new MemStorage();