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
  type WeeklyAvailability
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User | undefined>;
  
  // Patient Profiles
  getPatientProfile(id: number): Promise<PatientProfile | undefined>;
  getPatientProfileByUserId(userId: number): Promise<PatientProfile | undefined>;
  createPatientProfile(profile: InsertPatientProfile): Promise<PatientProfile>;
  updatePatientProfile(id: number, data: Partial<PatientProfile>): Promise<PatientProfile | undefined>;
  
  // Doctor Profiles
  getDoctorProfile(id: number): Promise<DoctorProfile | undefined>;
  getDoctorProfileByUserId(userId: number): Promise<DoctorProfile | undefined>;
  getAllDoctorProfiles(): Promise<DoctorProfile[]>;
  createDoctorProfile(profile: InsertDoctorProfile): Promise<DoctorProfile>;
  updateDoctorProfile(id: number, data: Partial<DoctorProfile>): Promise<DoctorProfile | undefined>;
  updateDoctorWeeklyAvailability(doctorId: number, weeklyAvailability: WeeklyAvailability): Promise<DoctorProfile | undefined>;
  searchDoctors(specialtyId?: number, available?: boolean): Promise<DoctorProfile[]>;
  
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
}

export class MemStorage implements IStorage {
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
    
    // Initialize with some specialties
    this.initializeSpecialties();
  }
  
  private initializeSpecialties() {
    const specialties = [
      { name: "Medicina General", description: "Atención médica básica y preventiva" },
      { name: "Pediatría", description: "Especializada en niños y adolescentes" },
      { name: "Ginecología", description: "Salud del sistema reproductor femenino" },
      { name: "Cardiología", description: "Tratamiento de enfermedades del corazón" },
      { name: "Dermatología", description: "Enfermedades de la piel" },
      { name: "Geriatría", description: "Especializada en adultos mayores" },
      { name: "Neurología", description: "Trastornos del sistema nervioso" }
    ];
    
    specialties.forEach(specialty => {
      const id = this.currentSpecialtyId++;
      this.specialties.set(id, { id, ...specialty });
    });
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
  
  async createDoctorProfile(profile: InsertDoctorProfile): Promise<DoctorProfile> {
    const id = this.currentDoctorProfileId++;
    const newProfile: DoctorProfile = { ...profile, id, averageRating: 0 };
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
  
  async searchDoctors(specialtyId?: number, available?: boolean): Promise<DoctorProfile[]> {
    let doctors = Array.from(this.doctorProfiles.values());
    
    if (specialtyId !== undefined) {
      doctors = doctors.filter(doctor => doctor.specialtyId === specialtyId);
    }
    
    if (available !== undefined) {
      doctors = doctors.filter(doctor => doctor.isAvailable === available);
    }
    
    return doctors;
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
    const newAppointment: Appointment = { ...appointment, id, createdAt };
    this.appointments.set(id, newAppointment);
    return newAppointment;
  }
  
  async updateAppointment(id: number, data: Partial<Appointment>): Promise<Appointment | undefined> {
    const appointment = this.appointments.get(id);
    if (!appointment) return undefined;
    
    const updatedAppointment = { ...appointment, ...data };
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
}

export const storage = new MemStorage();
