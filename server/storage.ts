import { 
  users, type User, type InsertUser,
  patientProfiles, type PatientProfile, type InsertPatientProfile,
  doctorProfiles, type DoctorProfile, type InsertDoctorProfile,
  specialties, type Specialty, type InsertSpecialty,
  availability, type Availability, type InsertAvailability,
  locations, type Location, type InsertLocation,
  appointments, type Appointment, type InsertAppointment,
  reviews, type Review, type InsertReview,
  notifications, type Notification, type InsertNotification,
  payments, type Payment, type InsertPayment,
  verificationCodes, type VerificationCode, type InsertVerificationCode,
  type WeeklyAvailability,
  guestPatients, type GuestPatient, guestPatientSchema,
  revolutTransactions, type RevolutTransaction, type InsertRevolutTransaction,
  bookingConfirmations, type BookingConfirmation, type InsertBookingConfirmation,
  transferLogs, type TransferLog, type InsertTransferLog,
  doctorLocationTracking, type DoctorLocationTracking, type InsertDoctorLocationTracking,
  patientFeedback, type PatientFeedback, type InsertPatientFeedback
} from "@shared/schema";
import { z } from "zod";
import crypto from "crypto";
import session from "express-session";
import memorystore from "memorystore";

export interface IStorage {
  // Session Store
  sessionStore: any; // Usar any para evitar problemas con el tipo SessionStore

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
  createGuestPatient(guestPatient: z.infer<typeof guestPatientSchema>): Promise<GuestPatient>;

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
  public sessionStore: any; // Usar any para evitar problemas con el tipo SessionStore
  private users: Map<number, User>;
  private patientProfiles: Map<number, PatientProfile>;
  private doctorProfiles: Map<number, DoctorProfile>;
  private specialties: Map<number, Specialty>;
  private availability: Map<number, Availability>;
  private locations: Map<number, Location>;
  private appointments: Map<number, Appointment>;
  private reviews: Map<number, Review>;
  private notifications: Map<number, Notification>;
  private payments: Map<number, Payment>;
  private verificationCodes: Map<number, VerificationCode>;
  private revolutTransactions: Map<number, RevolutTransaction>;
  private bookingConfirmations: Map<number, BookingConfirmation>;
  private transferLogs: Map<number, TransferLog>;
  private doctorLocationTracking: Map<number, DoctorLocationTracking>;
  private patientFeedback: Map<number, PatientFeedback>;
  private guestPatients: Map<number, GuestPatient>;

  private currentUserId: number;
  private currentPatientProfileId: number;
  private currentDoctorProfileId: number;
  private currentSpecialtyId: number;
  private currentAvailabilityId: number;
  private currentLocationId: number;
  private currentAppointmentId: number;
  private currentReviewId: number;
  private currentNotificationId: number;
  private currentPaymentId: number;
  private currentVerificationCodeId: number;
  private currentRevolutTransactionId: number;
  private currentBookingConfirmationId: number;
  private currentTransferLogId: number;
  private currentDoctorLocationTrackingId: number;
  private currentPatientFeedbackId: number;
  private currentGuestPatientId: number;

  constructor() {
    this.users = new Map();
    this.patientProfiles = new Map();
    this.doctorProfiles = new Map();
    this.specialties = new Map();
    this.availability = new Map();
    this.locations = new Map();
    this.appointments = new Map();
    this.reviews = new Map();
    this.notifications = new Map();
    this.payments = new Map();
    this.verificationCodes = new Map();
    this.revolutTransactions = new Map();
    this.bookingConfirmations = new Map();
    this.transferLogs = new Map();
    this.doctorLocationTracking = new Map();
    this.patientFeedback = new Map();
    this.guestPatients = new Map();

    // Initialize the session store
    const MemoryStore = memorystore(session);
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // Prune expired entries every 24h
    });

    this.currentUserId = 1;
    this.currentPatientProfileId = 1;
    this.currentDoctorProfileId = 1;
    this.currentSpecialtyId = 1;
    this.currentAvailabilityId = 1;
    this.currentLocationId = 1;
    this.currentAppointmentId = 1;
    this.currentReviewId = 1;
    this.currentNotificationId = 1;
    this.currentPaymentId = 1;
    this.currentVerificationCodeId = 1;
    this.currentRevolutTransactionId = 1;
    this.currentBookingConfirmationId = 1;
    this.currentTransferLogId = 1;
    this.currentDoctorLocationTrackingId = 1;
    this.currentPatientFeedbackId = 1;
    this.currentGuestPatientId = 1;

    // Initialize with sample data
    this.initializeData();
  }

  private initializeData() {
    // Add test doctor profile
    const testDoctorUser: User = {
      id: 999,
      username: "doctortest",
      email: "doctortest@oncall.clinic",
      password: "pepe", // Test credentials as requested
      userType: "doctor",
      firstName: "Dr. María",
      lastName: "González",
      phoneNumber: "+34600123456",
      emailVerified: true,
      twoFactorEnabled: false,
      profilePicture: "/img/doctor-avatar.svg",
      authProvider: "local",
      authProviderId: null,
      createdAt: new Date()
    };

    const testDoctorProfile: DoctorProfile = {
      id: 999,
      userId: 999,
      specialtyId: 1, // General Medicine
      licenseNumber: "TEST123",
      education: "Medical Degree, Test University",
      experience: 10,
      bio: "General practitioner with extensive experience in home healthcare",
      basePrice: 8000, // €80
      isAvailable: true,
      isVerified: true,
      averageRating: 4.8,
      totalEarnings: 0,
      pendingEarnings: 0,
      commissionRate: 0.15,
      verificationDate: new Date(),
      verifiedBy: 1, // Admin user
      weeklyAvailability: {
        monday: { available: true, startTime: "09:00", endTime: "18:00" },
        tuesday: { available: true, startTime: "09:00", endTime: "18:00" },
        wednesday: { available: true, startTime: "09:00", endTime: "18:00" },
        thursday: { available: true, startTime: "09:00", endTime: "18:00" },
        friday: { available: true, startTime: "09:00", endTime: "18:00" },
        saturday: { available: false, startTime: "", endTime: "" },
        sunday: { available: false, startTime: "", endTime: "" }
      },
      identityDocFront: null,
      identityDocBack: null,
      bankAccount: null,
      locationLat: 40.7128,
      locationLng: -74.0060,
      locationAddress: "123 Test Street, New York, NY 10001"
    };

    this.users.set(testDoctorUser.id, testDoctorUser);
    this.doctorProfiles.set(testDoctorProfile.id, testDoctorProfile);

    // Add sample specialties
    const specialties = [
      { name: "General Medicine", description: "Basic and preventive medical care" },
      { name: "Pediatrics", description: "Specialized in children and adolescents" },
      { name: "Gynecology", description: "Female reproductive system health" },
      { name: "Cardiology", description: "Heart disease treatment" },
      { name: "Dermatology", description: "Skin diseases" },
      { name: "Geriatrics", description: "Specialized in elderly care" },
      { name: "Neurology", description: "Nervous system disorders" }
    ];

    specialties.forEach(specialty => {
      const id = this.currentSpecialtyId++;
      this.specialties.set(id, { id, ...specialty });
    });
  }

  private initializeAdminUser() {
    // Crear un usuario administrador para pruebas
    const adminId = this.currentUserId++;
    const hashedPassword = crypto.createHmac('sha256', 'salt').update('admin123').digest('hex');

    const adminUser: User = {
      id: adminId,
      username: 'admin',
      email: 'admin@oncall.clinic',
      password: hashedPassword,
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

    this.users.set(adminId, adminUser);

    console.log('Usuario administrador creado:');
    console.log('- Email: admin@oncall.clinic');
    console.log('- Contraseña: admin123');
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
      (vc) => vc.userId === userId && vc.code === code && vc.type === type && !vc.usedAt && new Date() < new Date(vc.expiresAt)
    );
  }

  async markVerificationCodeAsUsed(id: number): Promise<VerificationCode | undefined> {
    const code = this.verificationCodes.get(id);
    if (!code) return undefined;

    const usedAt = new Date();
    const updatedCode = { ...code, usedAt };
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
    return Array.from(this.doctorProfiles.values())
      .filter(profile => profile.isVerified === false);
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
      commissionRate: 15.0,
      verificationDate: null,
      verifiedBy: null
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
    // Primero obtenemos el perfil del doctor por ID de usuario
    const doctorProfile = await this.getDoctorProfileByUserId(doctorId);
    if (!doctorProfile) return undefined;

    // Actualizamos la disponibilidad semanal
    const updatedProfile = await this.updateDoctorProfile(doctorProfile.id, {
      weeklyAvailability: weeklyAvailability as any // Usamos 'any' para evitar problemas de tipos con jsonb
    });

    return updatedProfile;
  }

  async verifyDoctor(doctorId: number, adminId: number, notes?: string): Promise<DoctorProfile | undefined> {
    const profile = await this.getDoctorProfile(doctorId);
    if (!profile) return undefined;

    // Verificar el perfil del médico
    const verificationDate = new Date();
    const updatedProfile = await this.updateDoctorProfile(profile.id, {
      isVerified: true,
      verificationDate,
      verifiedBy: adminId
    });

    if (updatedProfile) {
      // Crear notificación para el médico
      await this.createNotification({
        userId: profile.userId,
        type: "verification",
        content: notes || "Su cuenta ha sido verificada. Ya puede comenzar a recibir solicitudes de citas.",
        data: {
          doctorId: profile.id,
          verifiedBy: adminId,
          verificationDate
        } as any
      });
    }

    return updatedProfile;
  }

  async updateDoctorBankAccount(doctorId: number, bankAccount: string): Promise<DoctorProfile | undefined> {
    const profile = await this.getDoctorProfile(doctorId);
    if (!profile) return undefined;

    return this.updateDoctorProfile(profile.id, { bankAccount });
  }

  async getDoctorEarnings(doctorId: number): Promise<{
    totalEarnings: number;
    pendingEarnings: number;
    commissionRate: number;
    netEarnings: number;
  } | undefined> {
    const profile = await this.getDoctorProfile(doctorId);
    if (!profile) return undefined;

    return {
      totalEarnings: profile.totalEarnings,
      pendingEarnings: profile.pendingEarnings,
      commissionRate: profile.commissionRate,
      netEarnings: Math.round(profile.totalEarnings * (1 - profile.commissionRate / 100))
    };
  }

  // Calcular distancia entre dos puntos geográficos usando la fórmula de Haversine
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }

  async searchDoctors(specialtyId?: number, available?: boolean, verified?: boolean): Promise<DoctorProfile[]> {
    let doctors = Array.from(this.doctorProfiles.values());

    if (specialtyId !== undefined) {
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

  async searchDoctorsByLocation(
    lat: number, 
    lng: number, 
    maxDistance: number = 10,
    specialtyName?: string
  ): Promise<Array<DoctorProfile & { distance: number }>> {
    const doctors = await this.getAllDoctorProfiles();
    let filteredDoctors = doctors.filter(d => d.isVerified && d.isAvailable);

    // Filtrar por especialidad si se proporciona
    if (specialtyName) {
      const specialties = await this.getAllSpecialties();
      const specialty = specialties.find(s => 
        s.name.toLowerCase().includes(specialtyName.toLowerCase())
      );

      if (specialty) {
        filteredDoctors = filteredDoctors.filter(d => d.specialtyId === specialty.id);
      }
    }

    // Para cada médico, necesitamos:
    // 1. Obtener sus ubicaciones
    // 2. Calcular la distancia desde la ubicación del paciente a cada ubicación del médico
    // 3. Seleccionar la ubicación más cercana dentro del rango máximo
    const result = await Promise.all(
      filteredDoctors.map(async (doctor) => {
        const doctorLocations = await this.getLocationsByUserId(doctor.userId);

        if (doctorLocations.length === 0) {
          // El médico no tiene ubicaciones registradas
          return null;
        }

        // Calcular distancias a todas las ubicaciones del médico
        const distances = doctorLocations.map(location => ({
          location,
          distance: this.calculateDistance(lat, lng, location.lat, location.lng)
        }));

        // Ordenar por distancia y tomar la más cercana
        distances.sort((a, b) => a.distance - b.distance);
        const nearestLocation = distances[0];

        // Verificar si está dentro del rango máximo
        if (nearestLocation.distance <= maxDistance) {
          return {
            ...doctor,
            distance: nearestLocation.distance
          };
        }

        return null;
      })
    );

    // Filtrar los doctores que no tienen ubicaciones en el rango
    return result.filter(doctor => doctor !== null) as Array<DoctorProfile & { distance: number }>;
  }

  // Specialties
  private async createTestDoctor() {
    const testDoctor = {
      id: 1,
      userId: 1,
      specialtyId: 1, // General Medicine
      licenseNumber: "TEST1234",
      education: "Universidad de Test",
      experience: 10,
      bio: "Médico de prueba para el entorno sandbox",
      basePrice: 8000, // 80€
      isAvailable: true,
      isVerified: true,
      location: {
        lat: 38.9067339,
        lng: 1.4206979,
        address: "Avenida Ignacio Wallis, Ibiza",
        city: "Ibiza",
        postalCode: "07800"
      },
      user: {
        id: 1,
        firstName: "Marina",
        lastName: "Prueba",
        email: "dra.marina@test.com",
        phoneNumber: "+34600000000",
        profilePicture: null
      }
    };

    return testDoctor;
  }

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
      avail => avail.doctorProfileId === doctorProfileId
    );
  }

  async createAvailability(avail: InsertAvailability): Promise<Availability> {
    const id = this.currentAvailabilityId++;
    const newAvailability: Availability = { ...avail, id };
    this.availability.set(id, newAvailability);
    return newAvailability;
  }

  async updateAvailability(id: number, data: Partial<Availability>): Promise<Availability | undefined> {
    const avail = this.availability.get(id);
    if (!avail) return undefined;

    const updatedAvailability = { ...avail, ...data };
    this.availability.set(id, updatedAvailability);
    return updatedAvailability;
  }

  // Locations
  async getLocation(id: number): Promise<Location | undefined> {
    return this.locations.get(id);
  }

  async getLocationsByUserId(userId: number): Promise<Location[]> {
    return Array.from(this.locations.values()).filter(
      location => location.userId === userId
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
      appointment => appointment.patientId === patientId
    );
  }

  async getAppointmentsByDoctorId(doctorId: number): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).filter(
      appointment => appointment.doctorId === doctorId
    );
  }

  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const id = this.currentAppointmentId++;
    const createdAt = new Date();
    const updatedAt = createdAt;
    const newAppointment: Appointment = { ...appointment, id, createdAt, updatedAt };
    this.appointments.set(id, newAppointment);
    return newAppointment;
  }

  async updateAppointment(id: number, data: Partial<Appointment>): Promise<Appointment | undefined> {
    const appointment = this.appointments.get(id);
    if (!appointment) return undefined;

    const updatedAt = new Date();
    const updatedAppointment = { ...appointment, ...data, updatedAt };
    this.appointments.set(id, updatedAppointment);
    return updatedAppointment;
  }

  // Reviews
  async getReview(id: number): Promise<Review | undefined> {
    return this.reviews.get(id);
  }

  async getReviewsByRevieweeId(revieweeId: number): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(
      review => review.revieweeId === revieweeId
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
      notification => notification.userId === userId
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
      payment => payment.appointmentId === appointmentId
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
  async createGuestPatient(guestPatient: z.infer<typeof guestPatientSchema>): Promise<GuestPatient> {
    // Generamos un token de autenticación para el paciente invitado
    const authToken = crypto.randomBytes(32).toString('hex');
    
    // La fecha de expiración será 24 horas desde ahora
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    
    // Crear el paciente invitado con ID único
    const id = Math.floor(1000 + Math.random() * 9000); // ID único para guest patients
    const createdAt = new Date();
    
    const newGuestPatient: GuestPatient = {
      id,
      name: guestPatient.name,
      email: guestPatient.email,
      phone: guestPatient.phone,
      appointmentId: null, // Se asignará cuando se cree la cita
      authToken,
      createdAt,
      expiresAt,
      privacyAccepted: guestPatient.privacyAccepted,
      termsAccepted: guestPatient.termsAccepted
    };
    
    return newGuestPatient;
  }

  // Revolut Transactions methods
  async createRevolutTransaction(transaction: InsertRevolutTransaction): Promise<RevolutTransaction> {
    const id = this.currentRevolutTransactionId++;
    const createdAt = new Date();
    
    const newTransaction: RevolutTransaction = {
      ...transaction,
      id,
      createdAt,
      paidAt: null,
      transferredAt: null
    };

    this.revolutTransactions.set(id, newTransaction);
    return newTransaction;
  }

  async getRevolutTransaction(id: number): Promise<RevolutTransaction | undefined> {
    return this.revolutTransactions.get(id);
  }

  async getRevolutTransactionByAppointment(appointmentId: number): Promise<RevolutTransaction | undefined> {
    return Array.from(this.revolutTransactions.values()).find(t => t.appointmentId === appointmentId);
  }

  async updateRevolutTransaction(id: number, data: Partial<RevolutTransaction>): Promise<RevolutTransaction | undefined> {
    const transaction = this.revolutTransactions.get(id);
    if (!transaction) return undefined;

    const updatedTransaction = { ...transaction, ...data };
    this.revolutTransactions.set(id, updatedTransaction);
    return updatedTransaction;
  }

  // Booking Confirmations methods
  async createBookingConfirmation(confirmation: InsertBookingConfirmation): Promise<BookingConfirmation> {
    const id = this.currentBookingConfirmationId++;
    const createdAt = new Date();
    
    const newConfirmation: BookingConfirmation = {
      ...confirmation,
      id,
      createdAt,
      patientConfirmedAt: null,
      doctorConfirmedAt: null
    };

    this.bookingConfirmations.set(id, newConfirmation);
    return newConfirmation;
  }

  async getBookingConfirmation(id: number): Promise<BookingConfirmation | undefined> {
    return this.bookingConfirmations.get(id);
  }

  async getBookingConfirmationByTrackingCode(trackingCode: string): Promise<BookingConfirmation | undefined> {
    return Array.from(this.bookingConfirmations.values()).find(c => c.trackingCode === trackingCode);
  }

  async getBookingConfirmationByAppointment(appointmentId: number): Promise<BookingConfirmation | undefined> {
    return Array.from(this.bookingConfirmations.values()).find(c => c.appointmentId === appointmentId);
  }

  async updateBookingConfirmation(id: number, data: Partial<BookingConfirmation>): Promise<BookingConfirmation | undefined> {
    const confirmation = this.bookingConfirmations.get(id);
    if (!confirmation) return undefined;

    const updatedConfirmation = { ...confirmation, ...data };
    this.bookingConfirmations.set(id, updatedConfirmation);
    return updatedConfirmation;
  }

  // Transfer Logs methods
  async createTransferLog(log: InsertTransferLog): Promise<TransferLog> {
    const id = this.currentTransferLogId++;
    const processedAt = new Date();
    
    const newLog: TransferLog = {
      ...log,
      id,
      processedAt
    };

    this.transferLogs.set(id, newLog);
    return newLog;
  }

  async getTransferLogsByAppointment(appointmentId: number): Promise<TransferLog[]> {
    return Array.from(this.transferLogs.values()).filter(l => l.appointmentId === appointmentId);
  }

  // Doctor Location Tracking methods
  async createDoctorLocationTracking(location: InsertDoctorLocationTracking): Promise<DoctorLocationTracking> {
    const id = this.currentDoctorLocationTrackingId++;
    const timestamp = new Date();
    
    const newLocation: DoctorLocationTracking = {
      ...location,
      id,
      timestamp
    };

    this.doctorLocationTracking.set(id, newLocation);
    return newLocation;
  }

  async getDoctorActiveLocation(doctorId: number, appointmentId: number): Promise<DoctorLocationTracking[]> {
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    return Array.from(this.doctorLocationTracking.values()).filter(l => 
      l.doctorId === doctorId && 
      l.appointmentId === appointmentId &&
      l.isActive && 
      l.timestamp && l.timestamp > fifteenMinutesAgo
    );
  }

  async deactivateOldLocations(doctorId: number): Promise<void> {
    for (const [id, location] of this.doctorLocationTracking.entries()) {
      if (location.doctorId === doctorId) {
        this.doctorLocationTracking.set(id, { ...location, isActive: false });
      }
    }
  }

  // Patient Feedback methods
  async createPatientFeedback(feedback: InsertPatientFeedback): Promise<PatientFeedback> {
    const id = this.currentPatientFeedbackId++;
    const createdAt = new Date();
    
    const newFeedback: PatientFeedback = {
      ...feedback,
      id,
      createdAt,
      reviewedAt: null
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