import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertPatientProfileSchema, 
  insertDoctorProfileSchema,
  insertLocationSchema,
  insertAppointmentSchema,
  insertReviewSchema,
  insertPaymentSchema,
  weeklyAvailabilitySchema
} from "@shared/schema";
import { z } from "zod";
import crypto from "crypto";
import { WebSocketServer, WebSocket } from "ws";
import path from "path";
import session from "express-session";
import MemoryStore from "memorystore";

// Simple in-memory session store for demo purposes
const sessions = new Map<string, {userId: number, userType: string}>();
const verificationCodes = new Map<string, {code: string, email: string}>();

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function generateSessionId(): string {
  return crypto.randomBytes(32).toString('hex');
}

async function isAuthenticated(req: Request, res: Response): Promise<{userId: number, userType: string} | null> {
  const sessionId = req.headers.authorization?.split(' ')[1];
  if (!sessionId) {
    res.status(401).json({ message: "No session token provided" });
    return null;
  }
  
  const session = sessions.get(sessionId);
  if (!session) {
    res.status(401).json({ message: "Invalid or expired session" });
    return null;
  }
  
  return session;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Add a test route to check if the server is accessible
  app.get('/api/test', (req, res) => {
    res.json({ message: 'API is working properly!' });
  });

  // Add a test html page to check if the server can serve static content
  app.get('/test', (req, res) => {
    res.sendFile(path.resolve(process.cwd(), 'client/public/test.html'));
  });
  
  // Add a WebSocket test page
  app.get('/ws-test', (req, res) => {
    res.sendFile(path.resolve(process.cwd(), 'client/public/websocket-test.html'));
  });

  const httpServer = createServer(app);
  
  // Setup express-session with memorystore
  const MemoryStoreSession = MemoryStore(session);
  const sessionStore = new MemoryStoreSession({
    checkPeriod: 86400000 // prune expired entries every 24h
  });

  app.use(session({
    store: sessionStore,
    secret: 'medical-app-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // set to true if using https
      maxAge: 1000 * 60 * 60 * 24 // 24 hours
    }
  }));
  
  // Create WebSocket server with specific path to avoid conflict with Vite HMR
  const wss = new WebSocketServer({ 
    server: httpServer, 
    path: '/ws' 
  });
  
  // Keep track of connections by userId for more reliable message delivery
  const connectedClients = new Map<number, Set<WebSocket>>();
  
  // Ping interval to keep connections alive (30 seconds)
  const pingInterval = setInterval(() => {
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.ping();
      }
    });
  }, 30000);
  
  // WebSocket for real-time notifications
  wss.on('connection', (ws) => {
    console.log('WebSocket connection established');
    
    // Send a welcome message
    ws.send(JSON.stringify({
      type: 'system',
      message: 'Connected to Medical Services WebSocket Server'
    }));
    
    // Set a ping timeout to detect dead connections
    (ws as any).isAlive = true;
    ws.on('pong', () => {
      (ws as any).isAlive = true;
    });
    
    ws.on('message', (message) => {
      try {
        console.log('Received message:', message.toString());
        const data = JSON.parse(message.toString());
        
        // Handle authentication
        if (data.type === 'auth' && data.sessionId) {
          const session = sessions.get(data.sessionId);
          if (session) {
            // Store userId and userType in the websocket object
            (ws as any).userId = session.userId;
            (ws as any).userType = session.userType;
            console.log(`User ${session.userId} (${session.userType}) authenticated with WebSocket`);
            
            // Add to connected clients map
            if (!connectedClients.has(session.userId)) {
              connectedClients.set(session.userId, new Set());
            }
            connectedClients.get(session.userId)?.add(ws);
            
            ws.send(JSON.stringify({
              type: 'auth_response',
              success: true,
              message: 'Authentication successful',
              userId: session.userId,
              userType: session.userType
            }));
          } else {
            console.log('Invalid session for WebSocket authentication');
            ws.send(JSON.stringify({
              type: 'auth_response',
              success: false,
              message: 'Invalid session'
            }));
          }
        }
        
        // Handle test messages
        if (data.type === 'test') {
          ws.send(JSON.stringify({
            type: 'test_response',
            message: `Echo: ${data.message || 'No message provided'}`,
            timestamp: new Date().toISOString()
          }));
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Invalid message format'
        }));
      }
    });
    
    ws.on('close', () => {
      console.log('WebSocket connection closed');
      
      // Remove from connected clients
      if ((ws as any).userId) {
        const userId = (ws as any).userId;
        const userConnections = connectedClients.get(userId);
        
        if (userConnections) {
          userConnections.delete(ws);
          if (userConnections.size === 0) {
            connectedClients.delete(userId);
          }
        }
      }
    });
    
    // Handle errors
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });
  
  // Interval to check for dead connections (every 45 seconds)
  const heartbeatInterval = setInterval(() => {
    wss.clients.forEach(ws => {
      if (!(ws as any).isAlive) {
        return ws.terminate();
      }
      
      (ws as any).isAlive = false;
    });
  }, 45000);
  
  // Helper function to send notifications
  const sendNotification = async (userId: number, notification: any) => {
    try {
      // Store notification in database
      const dbNotification = await storage.createNotification({
        userId,
        type: notification.type,
        content: notification.message,
        data: {
          appointmentId: notification.appointmentId,
          status: notification.status,
          timestamp: notification.timestamp || new Date().toISOString()
        }
      });
      
      // Send through WebSocket if user is connected
      // Using the connectedClients map for more reliable delivery
      const userConnections = connectedClients.get(userId);
      
      if (userConnections && userConnections.size > 0) {
        const notificationPayload = JSON.stringify(notification);
        
        userConnections.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(notificationPayload);
          }
        });
        
        console.log(`Notification sent to user ${userId} (${userConnections.size} connections)`);
      } else {
        console.log(`User ${userId} not connected, notification stored in database only`);
      }
      
      return dbNotification;
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  };
  
  // AUTH ROUTES
  
  // Register user
  app.post('/api/auth/register', async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use" });
      }
      
      // Hash password
      const hashedPassword = hashPassword(userData.password);
      
      // Create user
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword
      });
      
      // Generate verification code
      const verificationCode = generateVerificationCode();
      const verificationId = crypto.randomBytes(16).toString('hex');
      verificationCodes.set(verificationId, { code: verificationCode, email: user.email });
      
      // In a real application, you would send an email with the code
      console.log(`Verification code for ${user.email}: ${verificationCode}`);
      
      res.status(201).json({ 
        message: "User registered successfully",
        verificationId,
        // Note: In a production app, we wouldn't return the code directly
        verificationCode
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Server error during registration" });
    }
  });
  
  // Verify email
  app.post('/api/auth/verify', async (req, res) => {
    try {
      const { verificationId, code } = req.body;
      
      const verification = verificationCodes.get(verificationId);
      if (!verification) {
        return res.status(400).json({ message: "Invalid verification ID" });
      }
      
      if (verification.code !== code) {
        return res.status(400).json({ message: "Invalid verification code" });
      }
      
      // Get user by email and mark as verified
      const user = await storage.getUserByEmail(verification.email);
      if (user) {
        await storage.updateUser(user.id, { emailVerified: true });
      }
      
      // Remove verification code
      verificationCodes.delete(verificationId);
      
      res.json({ message: "Email verified successfully" });
    } catch (error) {
      res.status(500).json({ message: "Server error during verification" });
    }
  });
  
  // Login
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Check password
      const hashedPassword = hashPassword(password);
      if (user.password !== hashedPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Check if email is verified
      if (!user.emailVerified) {
        return res.status(403).json({ message: "Email not verified" });
      }
      
      // Generate session token
      const sessionId = generateSessionId();
      sessions.set(sessionId, { userId: user.id, userType: user.userType });
      
      // Return user data without sensitive information
      const { password: _, ...userWithoutPassword } = user;
      
      res.json({
        message: "Login successful",
        sessionId,
        user: userWithoutPassword
      });
    } catch (error) {
      res.status(500).json({ message: "Server error during login" });
    }
  });
  
  // Logout
  app.post('/api/auth/logout', async (req, res) => {
    const sessionId = req.headers.authorization?.split(' ')[1];
    if (sessionId) {
      sessions.delete(sessionId);
    }
    
    res.json({ message: "Logged out successfully" });
  });
  
  // Get current user
  app.get('/api/auth/me', async (req, res) => {
    const auth = await isAuthenticated(req, res);
    if (!auth) return;
    
    try {
      const user = await storage.getUser(auth.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Return user data without sensitive information
      const { password, ...userWithoutPassword } = user;
      
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // PATIENT PROFILE ROUTES
  
  // Create patient profile
  app.post('/api/patients/profile', async (req, res) => {
    const auth = await isAuthenticated(req, res);
    if (!auth) return;
    
    try {
      if (auth.userType !== 'patient') {
        return res.status(403).json({ message: "Only patients can create a patient profile" });
      }
      
      const profileData = insertPatientProfileSchema.parse({
        ...req.body,
        userId: auth.userId
      });
      
      // Check if profile already exists
      const existingProfile = await storage.getPatientProfileByUserId(auth.userId);
      if (existingProfile) {
        return res.status(400).json({ message: "Patient profile already exists" });
      }
      
      const profile = await storage.createPatientProfile(profileData);
      
      res.status(201).json(profile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Server error creating patient profile" });
    }
  });
  
  // Get patient profile
  app.get('/api/patients/profile', async (req, res) => {
    const auth = await isAuthenticated(req, res);
    if (!auth) return;
    
    try {
      const profile = await storage.getPatientProfileByUserId(auth.userId);
      if (!profile) {
        return res.status(404).json({ message: "Patient profile not found" });
      }
      
      res.json(profile);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // DOCTOR PROFILE ROUTES
  
  // Create doctor profile
  app.post('/api/doctors/profile', async (req, res) => {
    const auth = await isAuthenticated(req, res);
    if (!auth) return;
    
    try {
      if (auth.userType !== 'doctor') {
        return res.status(403).json({ message: "Only doctors can create a doctor profile" });
      }
      
      const profileData = insertDoctorProfileSchema.parse({
        ...req.body,
        userId: auth.userId
      });
      
      // Check if profile already exists
      const existingProfile = await storage.getDoctorProfileByUserId(auth.userId);
      if (existingProfile) {
        return res.status(400).json({ message: "Doctor profile already exists" });
      }
      
      const profile = await storage.createDoctorProfile(profileData);
      
      res.status(201).json(profile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Server error creating doctor profile" });
    }
  });
  
  // Get doctor profile
  app.get('/api/doctors/profile', async (req, res) => {
    const auth = await isAuthenticated(req, res);
    if (!auth) return;
    
    try {
      const profile = await storage.getDoctorProfileByUserId(auth.userId);
      if (!profile) {
        return res.status(404).json({ message: "Doctor profile not found" });
      }
      
      res.json(profile);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Update doctor availability
  app.put('/api/availability', async (req, res) => {
    const auth = await isAuthenticated(req, res);
    if (!auth) return;
    
    try {
      if (auth.userType !== 'doctor') {
        return res.status(403).json({ message: "Only doctors can update availability" });
      }
      
      const { available } = req.body;
      if (typeof available !== 'boolean') {
        return res.status(400).json({ message: "Availability status must be a boolean value" });
      }
      
      // Get doctor profile
      const doctorProfile = await storage.getDoctorProfileByUserId(auth.userId);
      if (!doctorProfile) {
        return res.status(404).json({ message: "Doctor profile not found" });
      }
      
      // Update availability
      const updatedProfile = await storage.updateDoctorProfile(doctorProfile.id, {
        isAvailable: available
      });
      
      if (!updatedProfile) {
        return res.status(500).json({ message: "Failed to update availability" });
      }
      
      // Get doctor details for notification
      const doctor = await storage.getUser(auth.userId);
      
      // Broadcast a system notification to all connected clients
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'doctor_availability',
            doctorId: doctorProfile.id,
            doctorName: doctor ? `${doctor.firstName} ${doctor.lastName}` : `Dr. ${doctorProfile.id}`,
            available,
            specialtyId: doctorProfile.specialtyId,
            timestamp: Date.now()
          }));
        }
      });
      
      // Send a notification to the doctor
      await sendNotification(auth.userId, {
        type: 'system',
        message: available ? 'You are now available for appointments' : 'You are no longer available',
        timestamp: Date.now()
      });
      
      res.json({ 
        message: available ? "Availability updated to available" : "Availability updated to unavailable",
        profile: updatedProfile
      });
    } catch (error) {
      console.error('Error updating availability:', error);
      res.status(500).json({ message: "Server error updating availability" });
    }
  });
  
  // Update doctor weekly availability
  app.put('/api/weekly-availability', async (req, res) => {
    const auth = await isAuthenticated(req, res);
    if (!auth) return;
    
    try {
      if (auth.userType !== 'doctor') {
        return res.status(403).json({ message: "Only doctors can update weekly availability" });
      }
      
      // Validate the weekly availability data
      const weeklyAvailability = weeklyAvailabilitySchema.parse(req.body);
      
      // Get doctor profile
      const doctorProfile = await storage.getDoctorProfileByUserId(auth.userId);
      if (!doctorProfile) {
        return res.status(404).json({ message: "Doctor profile not found" });
      }
      
      // Update weekly availability using the dedicated method
      const updatedProfile = await storage.updateDoctorWeeklyAvailability(auth.userId, weeklyAvailability);
      
      if (!updatedProfile) {
        return res.status(500).json({ message: "Failed to update weekly availability" });
      }
      
      // Get doctor details for notification
      const doctor = await storage.getUser(auth.userId);
      
      // Broadcast a system notification to all connected clients
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'doctor_weekly_availability_update',
            doctorId: doctorProfile.id,
            doctorName: doctor ? `${doctor.firstName} ${doctor.lastName}` : `Dr. ${doctorProfile.id}`,
            timestamp: Date.now()
          }));
        }
      });
      
      // Send a notification to the doctor
      await sendNotification(auth.userId, {
        type: 'system',
        message: 'Your weekly availability schedule has been updated',
        timestamp: Date.now()
      });
      
      res.json({ 
        message: "Weekly availability schedule updated successfully",
        profile: updatedProfile
      });
    } catch (error) {
      console.error('Error updating weekly availability:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid weekly availability data format", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ message: "Server error updating weekly availability" });
    }
  });
  
  // Get doctor by ID (public)
  app.get('/api/doctors/:id', async (req, res) => {
    try {
      const doctorId = parseInt(req.params.id);
      const doctorProfile = await storage.getDoctorProfile(doctorId);
      
      if (!doctorProfile) {
        return res.status(404).json({ message: "Doctor not found" });
      }
      
      // Get user data
      const user = await storage.getUser(doctorProfile.userId);
      if (!user) {
        return res.status(404).json({ message: "Doctor user not found" });
      }
      
      // Get specialty
      const specialty = await storage.getSpecialty(doctorProfile.specialtyId);
      
      // Get availability
      const availability = await storage.getAvailabilityByDoctorId(doctorProfile.id);
      
      // Get reviews
      const reviews = await storage.getReviewsByRevieweeId(doctorProfile.userId);
      
      // Format doctor data for client
      const { password, ...userWithoutPassword } = user;
      
      res.json({
        ...doctorProfile,
        user: userWithoutPassword,
        specialty,
        availability,
        reviews
      });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Search doctors
  app.get('/api/doctors', async (req, res) => {
    try {
      const specialtyId = req.query.specialty ? parseInt(req.query.specialty as string) : undefined;
      const isAvailable = req.query.available ? req.query.available === 'true' : undefined;
      
      let doctors = await storage.searchDoctors(specialtyId, isAvailable);
      
      // Enrich doctor profiles with user data
      const enrichedDoctors = await Promise.all(doctors.map(async (doctor) => {
        const user = await storage.getUser(doctor.userId);
        const specialty = await storage.getSpecialty(doctor.specialtyId);
        
        if (!user) return null;
        
        const { password, ...userWithoutPassword } = user;
        
        return {
          ...doctor,
          user: userWithoutPassword,
          specialty
        };
      }));
      
      // Filter out null results
      const validDoctors = enrichedDoctors.filter(doctor => doctor !== null);
      
      res.json(validDoctors);
    } catch (error) {
      res.status(500).json({ message: "Server error searching doctors" });
    }
  });
  
  // SPECIALTY ROUTES
  
  // Get all specialties
  app.get('/api/specialties', async (req, res) => {
    try {
      const specialties = await storage.getAllSpecialties();
      res.json(specialties);
    } catch (error) {
      res.status(500).json({ message: "Server error fetching specialties" });
    }
  });
  
  // LOCATION ROUTES
  
  // Add location
  app.post('/api/locations', async (req, res) => {
    const auth = await isAuthenticated(req, res);
    if (!auth) return;
    
    try {
      const locationData = insertLocationSchema.parse({
        ...req.body,
        userId: auth.userId
      });
      
      const location = await storage.createLocation(locationData);
      
      res.status(201).json(location);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Server error adding location" });
    }
  });
  
  // Get user locations
  app.get('/api/locations', async (req, res) => {
    const auth = await isAuthenticated(req, res);
    if (!auth) return;
    
    try {
      const locations = await storage.getLocationsByUserId(auth.userId);
      res.json(locations);
    } catch (error) {
      res.status(500).json({ message: "Server error fetching locations" });
    }
  });
  
  // APPOINTMENT ROUTES
  
  // Create appointment
  app.post('/api/appointments', async (req, res) => {
    const auth = await isAuthenticated(req, res);
    if (!auth) return;
    
    try {
      if (auth.userType !== 'patient') {
        return res.status(403).json({ message: "Only patients can create appointments" });
      }
      
      const appointmentData = insertAppointmentSchema.parse({
        ...req.body,
        patientId: auth.userId,
        status: 'scheduled',
        paymentStatus: 'pending'
      });
      
      // Validate doctor exists
      const doctor = await storage.getUser(appointmentData.doctorId);
      if (!doctor || doctor.userType !== 'doctor') {
        return res.status(400).json({ message: "Invalid doctor ID" });
      }
      
      // Validate location exists
      const location = await storage.getLocation(appointmentData.locationId);
      if (!location || location.userId !== auth.userId) {
        return res.status(400).json({ message: "Invalid location ID" });
      }
      
      const appointment = await storage.createAppointment(appointmentData);
      
      // Create a pending payment record
      await storage.createPayment({
        appointmentId: appointment.id,
        amount: appointment.totalAmount,
        status: 'pending',
        currency: 'EUR'
      });
      
      // Send notification to doctor
      await sendNotification(appointmentData.doctorId, {
        type: 'new_appointment',
        message: `New appointment request for ${new Date(appointmentData.appointmentDate).toLocaleString()}`
      });
      
      res.status(201).json(appointment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Server error creating appointment" });
    }
  });
  
  // Get user appointments
  app.get('/api/appointments', async (req, res) => {
    const auth = await isAuthenticated(req, res);
    if (!auth) return;
    
    try {
      let appointments;
      
      if (auth.userType === 'patient') {
        appointments = await storage.getAppointmentsByPatientId(auth.userId);
      } else if (auth.userType === 'doctor') {
        appointments = await storage.getAppointmentsByDoctorId(auth.userId);
      } else {
        return res.status(403).json({ message: "Unauthorized user type" });
      }
      
      // Enrich appointments with related data
      const enrichedAppointments = await Promise.all(appointments.map(async (appointment) => {
        const patient = await storage.getUser(appointment.patientId);
        const doctor = await storage.getUser(appointment.doctorId);
        const location = await storage.getLocation(appointment.locationId);
        const payment = await storage.getPaymentByAppointmentId(appointment.id);
        
        const { password: patientPassword, ...patientData } = patient || {};
        const { password: doctorPassword, ...doctorData } = doctor || {};
        
        return {
          ...appointment,
          patient: patientData,
          doctor: doctorData,
          location,
          payment
        };
      }));
      
      res.json(enrichedAppointments);
    } catch (error) {
      res.status(500).json({ message: "Server error fetching appointments" });
    }
  });
  
  // Update appointment status
  app.patch('/api/appointments/:id/status', async (req, res) => {
    const auth = await isAuthenticated(req, res);
    if (!auth) return;
    
    try {
      const appointmentId = parseInt(req.params.id);
      const { status } = req.body;
      
      // Add real-time tracking status support
      const validStatuses = [
        'scheduled',    // Initial state after booking
        'confirmed',    // Doctor confirmed appointment
        'en_route',     // Doctor is on the way
        'arrived',      // Doctor arrived at patient's location
        'in_progress',  // Consultation in progress
        'completed',    // Appointment completed 
        'canceled'      // Appointment canceled
      ];
      
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ 
          message: "Invalid status value", 
          validValues: validStatuses 
        });
      }
      
      const appointment = await storage.getAppointment(appointmentId);
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      // Check if user is authorized to update this appointment
      if (
        (auth.userType === 'patient' && appointment.patientId !== auth.userId) ||
        (auth.userType === 'doctor' && appointment.doctorId !== auth.userId)
      ) {
        return res.status(403).json({ message: "Not authorized to update this appointment" });
      }
      
      // Check for valid status transitions
      if (auth.userType === 'doctor') {
        // Only doctor can set these statuses
        if (['confirmed', 'en_route', 'arrived', 'in_progress', 'completed'].includes(status)) {
          // Valid transition
        } else if (status === 'canceled') {
          // Both doctor and patient can cancel
        } else {
          return res.status(400).json({ message: "Invalid status transition for doctor" });
        }
      } else if (auth.userType === 'patient') {
        // Patient can only cancel or scheduled (re-schedule) appointments
        if (!['canceled', 'scheduled'].includes(status)) {
          return res.status(400).json({ message: "Invalid status transition for patient" });
        }
      }
      
      const updatedAppointment = await storage.updateAppointment(appointmentId, { status });
      
      // Get patient and doctor information for notification
      const patient = await storage.getUser(appointment.patientId);
      const doctor = await storage.getUser(appointment.doctorId);
      
      if (!patient || !doctor) {
        return res.status(500).json({ message: "Failed to retrieve user information" });
      }
      
      // Prepare notification message based on status
      let notificationMessage = '';
      const doctorFullName = `Dr. ${doctor.firstName} ${doctor.lastName}`;
      const patientFullName = `${patient.firstName} ${patient.lastName}`;
      
      switch (status) {
        case 'confirmed':
          notificationMessage = `${doctorFullName} confirmed your appointment for ${new Date(appointment.appointmentDate).toLocaleString()}`;
          break;
        case 'en_route':
          notificationMessage = `${doctorFullName} is on the way to your location`;
          break;
        case 'arrived':
          notificationMessage = `${doctorFullName} has arrived at your location`;
          break;
        case 'in_progress':
          notificationMessage = `Your appointment with ${doctorFullName} is now in progress`;
          break;
        case 'completed':
          notificationMessage = `Your appointment with ${doctorFullName} has been completed`;
          break;
        case 'canceled':
          const canceledBy = auth.userType === 'patient' ? patientFullName : doctorFullName;
          notificationMessage = `Appointment for ${new Date(appointment.appointmentDate).toLocaleString()} was canceled by ${canceledBy}`;
          break;
        default:
          notificationMessage = `Appointment for ${new Date(appointment.appointmentDate).toLocaleString()} was updated to ${status}`;
      }
      
      // Send notification to the other party
      const recipientId = auth.userType === 'patient' ? appointment.doctorId : appointment.patientId;
      await sendNotification(recipientId, {
        type: 'appointment_status',
        message: notificationMessage,
        appointmentId: appointmentId,
        status: status,
        timestamp: new Date().toISOString()
      });
      
      // The WebSocket notification has already been sent by the sendNotification function above
      // No additional code needed here
      
      res.json(updatedAppointment);
    } catch (error) {
      console.error('Error updating appointment:', error);
      res.status(500).json({ message: "Server error updating appointment" });
    }
  });
  
  // PAYMENT ROUTES
  
  // Process payment
  app.post('/api/payments/:appointmentId/process', async (req, res) => {
    const auth = await isAuthenticated(req, res);
    if (!auth) return;
    
    try {
      const appointmentId = parseInt(req.params.appointmentId);
      const { paymentMethod, cardDetails } = req.body;
      
      // Validate appointment exists and belongs to user
      const appointment = await storage.getAppointment(appointmentId);
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      if (appointment.patientId !== auth.userId) {
        return res.status(403).json({ message: "Not authorized to process payment for this appointment" });
      }
      
      // Get payment record
      const payment = await storage.getPaymentByAppointmentId(appointmentId);
      if (!payment) {
        return res.status(404).json({ message: "Payment record not found" });
      }
      
      if (payment.status !== 'pending') {
        return res.status(400).json({ message: `Payment already ${payment.status}` });
      }
      
      // Simulate payment processing
      // In a real app, this would integrate with a payment gateway
      const success = Math.random() > 0.1; // 90% success rate for demo
      
      if (success) {
        // Update payment record
        const updatedPayment = await storage.updatePayment(payment.id, { 
          status: 'completed',
          paymentMethod,
          transactionId: `tx_${Date.now()}`
        });
        
        // Update appointment payment status
        await storage.updateAppointment(appointmentId, { paymentStatus: 'paid' });
        
        // Send notifications
        await sendNotification(auth.userId, {
          type: 'payment_success',
          message: `Payment of ${payment.amount / 100}€ for your appointment was successful`
        });
        
        await sendNotification(appointment.doctorId, {
          type: 'appointment_paid',
          message: `Patient has paid for the appointment on ${new Date(appointment.appointmentDate).toLocaleString()}`
        });
        
        res.json({ 
          success: true, 
          payment: updatedPayment,
          message: "Payment processed successfully"
        });
      } else {
        // Payment failed
        res.status(400).json({ 
          success: false, 
          message: "Payment processing failed. Please try again or use a different payment method."
        });
      }
    } catch (error) {
      res.status(500).json({ message: "Server error processing payment" });
    }
  });
  
  // REVIEW ROUTES
  
  // Create review
  app.post('/api/reviews', async (req, res) => {
    const auth = await isAuthenticated(req, res);
    if (!auth) return;
    
    try {
      const { appointmentId, rating, comment } = req.body;
      
      // Validate appointment exists
      const appointment = await storage.getAppointment(parseInt(appointmentId));
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      // Check if user is part of the appointment
      if (appointment.patientId !== auth.userId && appointment.doctorId !== auth.userId) {
        return res.status(403).json({ message: "Not authorized to review this appointment" });
      }
      
      // Determine reviewer and reviewee
      const reviewerId = auth.userId;
      const revieweeId = reviewerId === appointment.patientId ? appointment.doctorId : appointment.patientId;
      
      // Create review
      const reviewData = insertReviewSchema.parse({
        appointmentId: parseInt(appointmentId),
        reviewerId,
        revieweeId,
        rating: parseInt(rating),
        comment
      });
      
      const review = await storage.createReview(reviewData);
      
      // If review is for a doctor, update their average rating
      if (revieweeId === appointment.doctorId) {
        // Get doctor profile
        const doctorProfile = await storage.getDoctorProfileByUserId(revieweeId);
        if (doctorProfile) {
          // Get all reviews for this doctor
          const reviews = await storage.getReviewsByRevieweeId(revieweeId);
          
          // Calculate new average
          const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
          const newAverage = sum / reviews.length;
          
          // Update doctor profile
          await storage.updateDoctorProfile(doctorProfile.id, { averageRating: newAverage });
        }
      }
      
      // Send notification to reviewee
      await sendNotification(revieweeId, {
        type: 'new_review',
        message: `You've received a new ${rating}-star review`
      });
      
      res.status(201).json(review);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Server error creating review" });
    }
  });
  
  // NOTIFICATION ROUTES
  
  // Get user notifications
  app.get('/api/notifications', async (req, res) => {
    const auth = await isAuthenticated(req, res);
    if (!auth) return;
    
    try {
      const notifications = await storage.getNotifications(auth.userId);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Server error fetching notifications" });
    }
  });
  
  // Mark notification as read
  app.patch('/api/notifications/:id/read', async (req, res) => {
    const auth = await isAuthenticated(req, res);
    if (!auth) return;
    
    try {
      const notificationId = parseInt(req.params.id);
      
      const updatedNotification = await storage.markNotificationAsRead(notificationId);
      if (!updatedNotification) {
        return res.status(404).json({ message: "Notification not found" });
      }
      
      res.json(updatedNotification);
    } catch (error) {
      res.status(500).json({ message: "Server error updating notification" });
    }
  });
  
  return httpServer;
}
