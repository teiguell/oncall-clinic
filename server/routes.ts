import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { invoicingService } from "./services/invoicing";
import { logEvent, logError, getEventsByTrackingCode, getEventsByUser, getAllEvents, initializeEventLogTable } from "./supabase";
import { requireAuth } from "./auth";
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
  
  // Initialize Supabase event log table
  initializeEventLogTable().catch(error => {
    console.error('Failed to initialize event log table:', error);
  });
  
  // Patient tracking endpoints (public - no authentication required)
  app.get('/api/tracking/:code', async (req: Request, res: Response) => {
    try {
      const { code } = req.params;
      
      // Log tracking access event
      await logEvent({
        tracking_code: code,
        event_type: 'tracking_access',
        event_payload: {
          user_agent: req.headers['user-agent'],
          ip: req.ip,
          timestamp: new Date().toISOString()
        }
      });
      
      // Get tracking session
      const trackingSession = await storage.getPatientTrackingSessionByCode(code);
      if (!trackingSession) {
        await logEvent({
          tracking_code: code,
          event_type: 'tracking_access_failed',
          event_payload: {
            reason: 'invalid_code',
            user_agent: req.headers['user-agent'],
            ip: req.ip
          }
        });
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
        await logEvent({
          tracking_code: code,
          event_type: 'patient_confirmation_failed',
          event_payload: {
            reason: 'invalid_tracking_code',
            ip: req.ip
          }
        });
        return res.status(404).json({ message: 'Código de seguimiento no válido' });
      }

      // Log patient confirmation event
      const appointment = await storage.getAppointment(trackingSession.appointmentId);
      await logEvent({
        tracking_code: code,
        user_id: appointment?.patientId?.toString(),
        user_role: 'patient',
        event_type: 'patient_visit_confirmed',
        event_payload: {
          appointment_id: trackingSession.appointmentId,
          confirmed_at: new Date().toISOString()
        }
      });

      // Update patient confirmation
      await storage.updatePatientTrackingSession(trackingSession.id, {
        patientConfirmed: true,
        patientConfirmedAt: new Date()
      });

      // Check if both parties confirmed to complete appointment
      if (trackingSession.doctorConfirmed) {
        if (appointment) {
          await storage.updateAppointment(appointment.id, { status: 'completed' });
          
          // Log appointment completion
          await logEvent({
            tracking_code: code,
            user_id: appointment.patientId.toString(),
            user_role: 'patient',
            event_type: 'appointment_completed',
            event_payload: {
              appointment_id: appointment.id,
              completed_at: new Date().toISOString(),
              both_parties_confirmed: true
            }
          });
          
          // Trigger automatic invoicing
          try {
            await invoicingService.processAppointmentInvoicing(appointment.id);
            await logEvent({
              tracking_code: code,
              event_type: 'invoicing_triggered',
              event_payload: {
                appointment_id: appointment.id,
                triggered_at: new Date().toISOString()
              }
            });
          } catch (invoiceError) {
            console.error('Error generating invoices:', invoiceError);
            await logError(invoiceError, 'invoicing_process', {
              tracking_code: code,
              appointment_id: appointment.id
            });
          }
        }
      }

      res.json({ success: true });
    } catch (error) {
      console.error('Error confirming completion:', error);
      await logError(error, 'patient_confirmation', {
        tracking_code: code
      });
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  });

  app.post('/api/tracking/:code/review', async (req: Request, res: Response) => {
    try {
      const { code } = req.params;
      const validatedData = reviewSchema.parse(req.body);
      
      // Log review submission event
      await logEvent({
        tracking_code: code,
        event_type: 'patient_review_submitted',
        event_payload: {
          rating: validatedData.rating,
          has_comment: !!validatedData.comment,
          submitted_at: new Date().toISOString()
        }
      });
      
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
      
      // Log complaint submission event
      await logEvent({
        tracking_code: code,
        event_type: 'patient_complaint_submitted',
        event_payload: {
          feedback_type: validatedData.feedbackType,
          message_length: validatedData.message.length,
          submitted_at: new Date().toISOString()
        }
      });
      
      const trackingSession = await storage.getPatientTrackingSessionByCode(code);
      if (!trackingSession) {
        await logEvent({
          tracking_code: code,
          event_type: 'complaint_submission_failed',
          event_payload: {
            reason: 'invalid_tracking_code'
          }
        });
        return res.status(404).json({ message: 'Código de seguimiento no válido' });
      }

      const appointment = await storage.getAppointment(trackingSession.appointmentId);
      if (!appointment) {
        await logEvent({
          tracking_code: code,
          event_type: 'complaint_submission_failed',
          event_payload: {
            reason: 'appointment_not_found',
            tracking_session_id: trackingSession.id
          }
        });
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

      // Log successful complaint creation
      await logEvent({
        tracking_code: code,
        user_id: appointment.patientId.toString(),
        user_role: 'patient',
        event_type: 'complaint_created',
        event_payload: {
          complaint_code: complaintCode,
          appointment_id: appointment.id,
          feedback_type: validatedData.feedbackType,
          created_at: new Date().toISOString()
        }
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

      // Log appointment creation event
      await logEvent({
        tracking_code: trackingCode,
        user_id: validatedData.patientId.toString(),
        user_role: 'patient',
        event_type: 'appointment_created',
        event_payload: {
          appointment_id: appointment.id,
          doctor_id: validatedData.doctorId,
          service_type: validatedData.serviceType || 'consultation',
          total_amount: validatedData.totalAmount,
          appointment_date: validatedData.appointmentDate,
          created_at: new Date().toISOString()
        }
      });

      res.status(201).json({
        appointment,
        trackingCode: trackingSession.trackingCode,
        trackingUrl: `/patient-tracking-dashboard.html?code=${trackingSession.trackingCode}`
      });
    } catch (error) {
      console.error('Error creating appointment:', error);
      await logError(error, 'appointment_creation', {
        patient_id: validatedData?.patientId
      });
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

  // Admin routes for event traceability system (require authentication)
  app.get('/api/admin/events', requireAuth, async (req: Request, res: Response) => {
    try {
      const { limit = 100, offset = 0, tracking_code, user_id, event_type } = req.query;
      
      let events;
      if (tracking_code) {
        events = await getEventsByTrackingCode(tracking_code as string);
      } else if (user_id) {
        events = await getEventsByUser(user_id as string);
      } else {
        events = await getAllEvents(Number(limit), Number(offset));
      }

      // Filter by event type if provided
      if (event_type && events) {
        events = events.filter(event => event.event_type === event_type);
      }

      res.json({
        events: events || [],
        total: events?.length || 0,
        filters: {
          tracking_code: tracking_code || null,
          user_id: user_id || null,
          event_type: event_type || null,
          limit: Number(limit),
          offset: Number(offset)
        }
      });
    } catch (error) {
      console.error('Error fetching events:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  });

  app.get('/api/admin/events/stats', requireAuth, async (req: Request, res: Response) => {
    try {
      const allEvents = await getAllEvents(1000); // Get recent events for stats
      
      if (!allEvents) {
        return res.json({ message: 'No events found' });
      }

      // Calculate statistics
      const stats = {
        total_events: allEvents.length,
        event_types: {},
        user_activity: {},
        tracking_codes: new Set(),
        date_range: {
          oldest: null,
          newest: null
        }
      };

      allEvents.forEach(event => {
        // Event type counts
        stats.event_types[event.event_type] = (stats.event_types[event.event_type] || 0) + 1;
        
        // User activity counts
        if (event.user_id) {
          stats.user_activity[event.user_id] = (stats.user_activity[event.user_id] || 0) + 1;
        }
        
        // Tracking codes
        if (event.tracking_code) {
          stats.tracking_codes.add(event.tracking_code);
        }

        // Date range
        const eventDate = new Date(event.timestamp);
        if (!stats.date_range.oldest || eventDate < new Date(stats.date_range.oldest)) {
          stats.date_range.oldest = event.timestamp;
        }
        if (!stats.date_range.newest || eventDate > new Date(stats.date_range.newest)) {
          stats.date_range.newest = event.timestamp;
        }
      });

      stats.tracking_codes = stats.tracking_codes.size;

      res.json(stats);
    } catch (error) {
      console.error('Error calculating event stats:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  });

  app.post('/api/admin/events/export', requireAuth, async (req: Request, res: Response) => {
    try {
      const { tracking_code, user_id, event_type, date_from, date_to } = req.body;
      
      let events = await getAllEvents(10000); // Get more events for export
      
      if (!events) {
        return res.json({ events: [], message: 'No events found' });
      }

      // Apply filters
      if (tracking_code) {
        events = events.filter(event => event.tracking_code === tracking_code);
      }
      if (user_id) {
        events = events.filter(event => event.user_id === user_id);
      }
      if (event_type) {
        events = events.filter(event => event.event_type === event_type);
      }
      if (date_from) {
        events = events.filter(event => new Date(event.timestamp) >= new Date(date_from));
      }
      if (date_to) {
        events = events.filter(event => new Date(event.timestamp) <= new Date(date_to));
      }

      // Log export action
      await logEvent({
        user_id: req.user?.id?.toString(),
        user_role: 'admin',
        event_type: 'event_log_exported',
        event_payload: {
          exported_count: events.length,
          filters: { tracking_code, user_id, event_type, date_from, date_to },
          exported_at: new Date().toISOString()
        }
      });

      res.json({
        events,
        exported_count: events.length,
        exported_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error exporting events:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}