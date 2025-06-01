import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import path from 'path';
import session from "express-session";
import MemoryStore from "memorystore";

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure session middleware
  const MemoryStoreSession = MemoryStore(session);
  app.use(session({
    secret: process.env.SESSION_SECRET || 'oncallclinic_dev_secret',
    resave: false,
    saveUninitialized: false,
    store: new MemoryStoreSession({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
    cookie: {
      secure: false, // set to true in production with HTTPS
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Serve static HTML files
  app.get('/doctor', (req, res) => {
    res.sendFile(path.resolve(process.cwd(), 'doctor-dashboard.html'));
  });

  app.get('/doctor-login', (req, res) => {
    res.sendFile(path.resolve(process.cwd(), 'doctor-login-simple.html'));
  });

  app.get('/tracking', (req, res) => {
    res.sendFile(path.resolve(process.cwd(), 'patient-tracking.html'));
  });

  // Test endpoint
  app.get('/api/test', (req, res) => {
    res.json({ message: 'API is working properly!' });
  });

  // Doctor login endpoint
  app.post('/api/doctor/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ 
          success: false, 
          message: 'Email and password are required' 
        });
      }

      // Find user by email
      const user = await storage.getUserByEmail(email);
      if (!user || user.userType !== 'doctor') {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid credentials or not a doctor account' 
        });
      }

      // Verify password (simple comparison for testing)
      if (user.password !== password) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid credentials' 
        });
      }

      // Get doctor profile
      const doctorProfile = await storage.getDoctorProfileByUserId(user.id);
      if (!doctorProfile) {
        return res.status(404).json({ 
          success: false, 
          message: 'Doctor profile not found' 
        });
      }

      // Create session
      req.session.user = {
        id: user.id,
        userType: user.userType,
        emailVerified: user.emailVerified
      };

      res.json({
        success: true,
        doctor: {
          id: doctorProfile.id,
          userId: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          isVerified: doctorProfile.isVerified,
          isAvailable: doctorProfile.isAvailable,
          licenseNumber: doctorProfile.licenseNumber
        }
      });

    } catch (error) {
      console.error('Doctor login error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error during login'
      });
    }
  });

  // Doctor logout endpoint
  app.post('/api/doctor/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Could not log out' });
      }
      res.json({ success: true, message: 'Logged out successfully' });
    });
  });

  // Check doctor session endpoint
  app.get('/api/doctor/session', (req, res) => {
    if (!req.session.user || req.session.user.userType !== 'doctor') {
      return res.status(401).json({ success: false, message: 'Not logged in' });
    }
    
    res.json({
      success: true,
      user: req.session.user
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}