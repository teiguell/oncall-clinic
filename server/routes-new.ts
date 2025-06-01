import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { invoicingService } from "./services/invoicing";
import crypto from 'crypto';
import { z } from 'zod';

// Define basic schemas for validation
const appointmentSchema = z.object({
  patientId: z.number(),
  doctorId: z.number(),
  appointmentDate: z.string(),
  reasonForVisit: z.string(),
  locationId: z.number(),
  totalAmount: z.number()
});

const trackingConfirmSchema = z.object({
  confirmed: z.boolean().optional()
});

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().optional()
});

const complaintSchema = z.object({
  feedbackType: z.enum(['complaint', 'suggestion', 'compliment']),
  message: z.string().min(10)
});

const chatMessageSchema = z.object({
  message: z.string().min(1)
});

export function registerRoutes(app: Express): Server {
  
  // Patient tracking endpoints (public - no authentication required)
  app.get('/api/tracking/:code', async (req: Request, res: Response) => {
    try {
      const { code } = req.params;
      
      // Get tracking session
      const trackingSession = await storage.getPatientTrackingSessionByCode(code);
      if (!trackingSession) {
        return res.status(404).json({ message: 'Código de seguimiento no válido' });
      }

      // Get appointment details
      const appointment = await storage.getAppointment(trackingSession.appointmentId);
      if (!appointment) {
        return res.status(404).json({ message: 'Cita no encontrada' });
      }

      // Get doctor information
      const doctor = await storage.getUser(appointment.doctorId);
      const doctorProfile = await storage.getDoctorProfileByUserId(appointment.doctorId);

      // Get patient information
      const patient = await storage.getUser(appointment.patientId);
      
      // Get location details
      const location = await storage.getLocation(appointment.locationId);

      const response = {
        appointmentId: appointment.id,
        trackingCode: code,
        status: appointment.status,
        appointmentDate: appointment.appointmentDate,
        totalAmount: appointment.totalAmount,
        reasonForVisit: appointment.reasonForVisit,
        doctor: doctor ? {
          firstName: doctor.firstName,
          lastName: doctor.lastName,
          specialty: doctorProfile?.specialtyId
        } : null,
        location: location ? {
          lat: location.latitude,
          lng: location.longitude,
          address: location.address
        } : null,
        patientConfirmed: trackingSession.patientConfirmed,
        doctorConfirmed: trackingSession.doctorConfirmed
      };

      res.json(response);
    } catch (error) {
      console.error('Error getting tracking data:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  });

  app.post('/api/tracking/:code/confirm-patient', async (req: Request, res: Response) => {
    try {
      const { code } = req.params;
      
      const trackingSession = await storage.getPatientTrackingSessionByCode(code);
      if (!trackingSession) {
        return res.status(404).json({ message: 'Código de seguimiento no válido' });
      }

      // Update patient confirmation
      await storage.updatePatientTrackingSession(trackingSession.id, {
        patientConfirmed: true,
        patientConfirmedAt: new Date()
      });

      // Check if both parties confirmed to complete appointment
      if (trackingSession.doctorConfirmed) {
        const appointment = await storage.getAppointment(trackingSession.appointmentId);
        if (appointment) {
          await storage.updateAppointment(appointment.id, { status: 'completed' });
          
          // Trigger automatic invoicing
          try {
            await invoicingService.processAppointmentInvoicing(appointment.id);
          } catch (invoiceError) {
            console.error('Error generating invoices:', invoiceError);
          }
        }
      }

      res.json({ success: true });
    } catch (error) {
      console.error('Error confirming completion:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  });

  app.post('/api/tracking/:code/review', async (req: Request, res: Response) => {
    try {
      const { code } = req.params;
      const validatedData = reviewSchema.parse(req.body);
      
      const trackingSession = await storage.getPatientTrackingSessionByCode(code);
      if (!trackingSession) {
        return res.status(404).json({ message: 'Código de seguimiento no válido' });
      }

      const appointment = await storage.getAppointment(trackingSession.appointmentId);
      if (!appointment) {
        return res.status(404).json({ message: 'Cita no encontrada' });
      }

      // Create review
      await storage.createReview({
        reviewerId: appointment.patientId,
        revieweeId: appointment.doctorId,
        appointmentId: appointment.id,
        rating: validatedData.rating,
        comment: validatedData.comment || '',
        reviewType: 'patient_to_doctor'
      });

      res.json({ success: true });
    } catch (error) {
      console.error('Error submitting review:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  });

  app.post('/api/tracking/:code/complaint', async (req: Request, res: Response) => {
    try {
      const { code } = req.params;
      const validatedData = complaintSchema.parse(req.body);
      
      const trackingSession = await storage.getPatientTrackingSessionByCode(code);
      if (!trackingSession) {
        return res.status(404).json({ message: 'Código de seguimiento no válido' });
      }

      const appointment = await storage.getAppointment(trackingSession.appointmentId);
      if (!appointment) {
        return res.status(404).json({ message: 'Cita no encontrada' });
      }

      // Generate complaint code
      const complaintCode = `COMP-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

      // Create complaint
      await storage.createComplaint({
        patientId: appointment.patientId,
        doctorId: appointment.doctorId,
        appointmentId: appointment.id,
        message: validatedData.message,
        feedbackType: validatedData.feedbackType,
        complaintCode
      });

      res.json({ 
        success: true, 
        complaintCode,
        message: 'Reporte enviado correctamente. Recibirás una respuesta en 48 horas laborables.'
      });
    } catch (error) {
      console.error('Error submitting complaint:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  });

  app.get('/api/tracking/:code/doctor-location', async (req: Request, res: Response) => {
    try {
      const { code } = req.params;
      
      const trackingSession = await storage.getPatientTrackingSessionByCode(code);
      if (!trackingSession) {
        return res.status(404).json({ message: 'Código de seguimiento no válido' });
      }

      const appointment = await storage.getAppointment(trackingSession.appointmentId);
      if (!appointment) {
        return res.status(404).json({ message: 'Cita no encontrada' });
      }

      // Get latest doctor location
      const locations = await storage.getDoctorActiveLocation(appointment.doctorId, appointment.id);
      const latestLocation = locations[0]; // Assuming sorted by most recent

      if (!latestLocation) {
        return res.status(404).json({ message: 'Ubicación no disponible' });
      }

      res.json({
        latitude: latestLocation.latitude,
        longitude: latestLocation.longitude,
        timestamp: latestLocation.timestamp
      });
    } catch (error) {
      console.error('Error getting doctor location:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  });

  // Chat endpoints
  app.get('/api/tracking/:code/chat', async (req: Request, res: Response) => {
    try {
      const { code } = req.params;
      
      // For now, return empty messages - this would integrate with a real chat system
      res.json([]);
    } catch (error) {
      console.error('Error getting chat messages:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  });

  app.post('/api/tracking/:code/chat', async (req: Request, res: Response) => {
    try {
      const { code } = req.params;
      const validatedData = chatMessageSchema.parse(req.body);
      
      // For now, just acknowledge the message - this would integrate with a real chat system
      res.json({ success: true, message: 'Mensaje enviado' });
    } catch (error) {
      console.error('Error sending chat message:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  });

  // Basic appointment endpoints for testing
  app.post('/api/appointments', async (req: Request, res: Response) => {
    try {
      const validatedData = appointmentSchema.parse(req.body);
      
      const appointment = await storage.createAppointment({
        ...validatedData,
        appointmentDate: new Date(validatedData.appointmentDate),
        status: 'scheduled',
        paymentStatus: 'pending',
        duration: 60 // Default 1 hour
      });

      // Create tracking session
      const trackingCode = `TRK-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
      const trackingSession = await storage.createPatientTrackingSession({
        appointmentId: appointment.id,
        trackingCode,
        patientConfirmed: false,
        doctorConfirmed: false
      });

      res.status(201).json({
        appointment,
        trackingCode: trackingSession.trackingCode,
        trackingUrl: `/patient-tracking-dashboard.html?code=${trackingSession.trackingCode}`
      });
    } catch (error) {
      console.error('Error creating appointment:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  });

  // Legal pages routes
  app.get('/legal/privacy-policy-es', (req: Request, res: Response) => {
    res.sendFile('client/src/pages/legal/privacy-policy-es.tsx', { root: '.' });
  });

  app.get('/legal/terms-of-use-es', (req: Request, res: Response) => {
    res.sendFile('client/src/pages/legal/terms-of-use-es.tsx', { root: '.' });
  });

  // Test endpoint for creating sample data
  app.post('/api/test/create-sample-appointment', async (req: Request, res: Response) => {
    try {
      // Create test users and appointment for demonstration
      const patient = await storage.createUser({
        firstName: 'Ana',
        lastName: 'García',
        email: 'ana.garcia@test.com',
        username: 'ana.garcia',
        password: 'hashedpassword',
        role: 'patient'
      });

      const doctor = await storage.createUser({
        firstName: 'Dr. Carlos',
        lastName: 'Martínez',
        email: 'carlos.martinez@test.com',
        username: 'dr.carlos',
        password: 'hashedpassword',
        role: 'doctor'
      });

      const location = await storage.createLocation({
        userId: patient.id,
        address: 'Calle de Alcalá, 123',
        city: 'Madrid',
        postalCode: '28009',
        country: 'España',
        latitude: 40.4168,
        longitude: -3.7038
      });

      const appointment = await storage.createAppointment({
        patientId: patient.id,
        doctorId: doctor.id,
        appointmentDate: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
        duration: 60,
        status: 'confirmed',
        reasonForVisit: 'Consulta general',
        locationId: location.id,
        totalAmount: 8000, // 80€ in cents
        paymentStatus: 'completed'
      });

      // Create tracking session
      const trackingCode = `TRK-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
      const trackingSession = await storage.createPatientTrackingSession({
        appointmentId: appointment.id,
        trackingCode,
        patientConfirmed: false,
        doctorConfirmed: false
      });

      res.json({
        success: true,
        trackingCode: trackingSession.trackingCode,
        trackingUrl: `/patient-tracking-dashboard.html?code=${trackingSession.trackingCode}`,
        appointment,
        message: 'Datos de prueba creados correctamente'
      });
    } catch (error) {
      console.error('Error creating sample data:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}