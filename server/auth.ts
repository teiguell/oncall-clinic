import { Request, Response, NextFunction, Express } from "express";
import session from "express-session";
import memorystore from "memorystore";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User, InsertUser } from "@shared/schema";
import { OAuth2Client } from "google-auth-library";

// Declare session user data type
declare module 'express-session' {
  interface SessionData {
    user: {
      id: number;
      userType: string;
      emailVerified: boolean | null;
    };
  }
}

// Declare global Express User interface to include our User type
declare global {
  namespace Express {
    interface User extends User {}
  }
}

// Helper for password hashing
const scryptAsync = promisify(scrypt);

// Generate a random verification code
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Hash password using scrypt and salt
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

// Compare a password against a hashed version
export async function comparePasswords(
  supplied: string,
  stored: string
): Promise<boolean> {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// Create session store
const MemoryStore = memorystore(session);
export const sessionStore = new MemoryStore({
  checkPeriod: 86400000, // Prune expired entries every 24h
});

// Set up Google OAuth client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Configure authentication middleware and routes
export function setupAuth(app: Express) {
  // Session configuration
  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'oncallclinic_dev_secret',
      resave: false,
      saveUninitialized: false,
      store: sessionStore,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      },
    })
  );

  // Authentication middleware
  app.use((req: Request, res: Response, next: NextFunction) => {
    // Make user available in templates
    res.locals.user = req.session.user;
    next();
  });

  // Protected route middleware
  export function requireAuth(req: Request, res: Response, next: NextFunction) {
    if (!req.session.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  }

  // Role-based access middleware
  export function requireRole(roles: string | string[]) {
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    return (req: Request, res: Response, next: NextFunction) => {
      if (!req.session.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      if (!allowedRoles.includes(req.session.user.userType)) {
        return res.status(403).json({ message: "Forbidden" });
      }

      next();
    };
  }

  // Register a new patient user
  app.post("/api/register/patient", async (req, res) => {
    try {
      const { email, password, firstName, lastName, phoneNumber, address, city, postalCode, dob } = req.body;

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use" });
      }

      // Create a username from email (before the @ symbol)
      const username = email.split("@")[0];
      
      // Hash the password
      const hashedPassword = await hashPassword(password);

      // Create the user
      const newUser: InsertUser = {
        username,
        email,
        password: hashedPassword,
        userType: "patient",
        firstName,
        lastName,
        phoneNumber,
        emailVerified: false,
        twoFactorEnabled: false,
        authProvider: "local",
      };

      const user = await storage.createUser(newUser);

      // Create the patient profile
      if (address && city && postalCode) {
        await storage.createPatientProfile({
          userId: user.id,
          address,
          city,
          postalCode,
          dob: dob ? new Date(dob) : undefined,
        });
      }

      // Generate and store verification code
      const code = generateVerificationCode();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour expiry

      const verificationCode = await storage.createVerificationCode({
        userId: user.id,
        code,
        type: "signup",
        method: "email",
        expiresAt,
      });

      // TODO: Send verification email with code
      console.log(`Verification code for ${email}: ${code}`);

      return res.status(201).json({ 
        userId: user.id, 
        verificationId: verificationCode.id.toString(), 
        message: "User registered successfully. Please verify your email." 
      });
    } catch (error) {
      console.error("Registration error:", error);
      return res.status(500).json({ message: "Error registering user" });
    }
  });

  // Register a new doctor user
  app.post("/api/register/doctor", async (req, res) => {
    try {
      const { 
        email, password, firstName, lastName, phoneNumber,
        licenseNumber, specialtyId, education, experience, bio, basePrice
      } = req.body;

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use" });
      }

      // Create a username from email (before the @ symbol)
      const username = email.split("@")[0];
      
      // Hash the password
      const hashedPassword = await hashPassword(password);

      // Create the user
      const newUser: InsertUser = {
        username,
        email,
        password: hashedPassword,
        userType: "doctor",
        firstName,
        lastName,
        phoneNumber,
        emailVerified: false,
        twoFactorEnabled: false,
        authProvider: "local",
      };

      const user = await storage.createUser(newUser);

      // Handle file uploads
      let profilePicture = req.file ? `/uploads/${req.file.filename}` : undefined;
      let identityDocFront = req.files && Array.isArray(req.files) && req.files[0] ? `/uploads/${req.files[0].filename}` : undefined;
      let identityDocBack = req.files && Array.isArray(req.files) && req.files[1] ? `/uploads/${req.files[1].filename}` : undefined;

      // Create default weekly availability (empty for all days)
      const weeklyAvailability = {
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: [],
        sunday: [],
      };

      // Create the doctor profile
      await storage.createDoctorProfile({
        userId: user.id,
        specialtyId: Number(specialtyId),
        licenseNumber,
        education,
        experience: Number(experience),
        bio,
        basePrice: Number(basePrice) * 100, // Convert to cents
        isAvailable: false, // Default to unavailable until verified
        identityDocFront,
        identityDocBack,
        weeklyAvailability,
      });

      // Update user's profile picture if provided
      if (profilePicture) {
        await storage.updateUser(user.id, { profilePicture });
      }

      // Generate and store verification code
      const code = generateVerificationCode();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour expiry

      const verificationCode = await storage.createVerificationCode({
        userId: user.id,
        code,
        type: "signup",
        method: "email",
        expiresAt,
      });

      // TODO: Send verification email with code
      console.log(`Verification code for ${email}: ${code}`);

      return res.status(201).json({ 
        userId: user.id, 
        verificationId: verificationCode.id.toString(),
        message: "Doctor registered successfully. Please verify your email." 
      });
    } catch (error) {
      console.error("Doctor registration error:", error);
      return res.status(500).json({ message: "Error registering doctor" });
    }
  });

  // Verify email with verification code
  app.post("/api/verify-email", async (req, res) => {
    try {
      const { verificationId, code } = req.body;
      
      if (!verificationId || !code) {
        return res.status(400).json({ message: "Verification ID and code are required" });
      }
      
      // Get the verification code
      const verificationCode = await storage.getVerificationCode(
        parseInt(verificationId),
        code,
        "signup"
      );
      
      if (!verificationCode) {
        return res.status(400).json({ message: "Invalid verification code" });
      }
      
      // Check if the code has expired
      if (new Date() > verificationCode.expiresAt) {
        return res.status(400).json({ message: "Verification code has expired" });
      }
      
      // Check if the code has already been used
      if (verificationCode.usedAt) {
        return res.status(400).json({ message: "Verification code has already been used" });
      }
      
      // Update the user's email verification status
      const user = await storage.getUser(verificationCode.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const updatedUser = await storage.updateUser(user.id, { emailVerified: true });
      
      // Mark the verification code as used
      await storage.markVerificationCodeAsUsed(verificationCode.id);
      
      // Log the user in
      req.session.user = updatedUser;
      
      return res.status(200).json(updatedUser);
    } catch (error) {
      console.error("Email verification error:", error);
      return res.status(500).json({ message: "Error verifying email" });
    }
  });

  // Login route
  app.post("/api/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Get the user by email
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      // Verify the password
      const passwordValid = await comparePasswords(password, user.password);
      if (!passwordValid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      // Check if email is verified
      if (!user.emailVerified) {
        // Generate a new verification code
        const code = generateVerificationCode();
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour expiry
        
        const verificationCode = await storage.createVerificationCode({
          userId: user.id,
          code,
          type: "signup",
          method: "email",
          expiresAt,
        });
        
        // TODO: Send verification email with code
        console.log(`New verification code for ${email}: ${code}`);
        
        return res.status(403).json({ 
          message: "Email not verified", 
          verificationId: verificationCode.id.toString()
        });
      }
      
      // Login successful
      req.session.user = user;
      
      return res.status(200).json(user);
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({ message: "Error during login" });
    }
  });

  // Google OAuth login
  app.post("/api/login/google", async (req, res) => {
    try {
      const { token } = req.body;
      
      // Verify the token
      const ticket = await googleClient.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      
      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        return res.status(400).json({ message: "Invalid token" });
      }
      
      // Check if the user exists
      let user = await storage.getUserByOAuth("google", payload.sub || "");
      
      if (!user) {
        // Check if a user with this email exists (for account linking)
        const existingUser = await storage.getUserByEmail(payload.email);
        
        if (existingUser) {
          // Link the Google account to the existing user
          user = await storage.updateUser(existingUser.id, {
            authProvider: "google",
            authProviderId: payload.sub,
            emailVerified: true, // Google email is already verified
          });
        } else {
          // Create a new user
          const newUser: InsertUser = {
            username: payload.email.split("@")[0],
            email: payload.email,
            password: await hashPassword(randomBytes(16).toString("hex")), // Random password
            userType: "patient", // Default to patient for OAuth users
            firstName: payload.given_name || payload.name || "",
            lastName: payload.family_name || "",
            phoneNumber: "", // Will need to be updated by user
            emailVerified: true, // Google email is already verified
            twoFactorEnabled: false,
            profilePicture: payload.picture,
            authProvider: "google",
            authProviderId: payload.sub,
          };
          
          user = await storage.createUser(newUser);
          
          // Create a basic patient profile
          await storage.createPatientProfile({
            userId: user.id,
            address: "",
            city: "",
            postalCode: "",
          });
        }
      }
      
      // Login the user
      req.session.user = user;
      
      return res.status(200).json(user);
    } catch (error) {
      console.error("Google login error:", error);
      return res.status(500).json({ message: "Error during Google login" });
    }
  });

  // Apple OAuth login
  app.post("/api/login/apple", async (req, res) => {
    try {
      // Implement Apple sign-in verification
      // This would require the Apple Sign-In module and proper configuration
      return res.status(501).json({ message: "Apple login not implemented yet" });
    } catch (error) {
      console.error("Apple login error:", error);
      return res.status(500).json({ message: "Error during Apple login" });
    }
  });

  // Logout route
  app.post("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Error during logout" });
      }
      res.clearCookie("connect.sid");
      return res.status(200).json({ message: "Logged out successfully" });
    });
  });

  // Get current user
  app.get("/api/user", (req, res) => {
    if (!req.session.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    return res.status(200).json(req.session.user);
  });

  // Request password reset
  app.post("/api/request-password-reset", async (req, res) => {
    try {
      const { email } = req.body;
      
      // Check if user exists
      const user = await storage.getUserByEmail(email);
      if (!user) {
        // For security reasons, don't reveal that the email doesn't exist
        return res.status(200).json({ message: "If your email is registered, you will receive a password reset link" });
      }
      
      // Generate a verification code
      const code = generateVerificationCode();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiry
      
      const verificationCode = await storage.createVerificationCode({
        userId: user.id,
        code,
        type: "password_reset",
        method: "email",
        expiresAt,
      });
      
      // TODO: Send password reset email with code
      console.log(`Password reset code for ${email}: ${code}`);
      
      return res.status(200).json({ 
        message: "If your email is registered, you will receive a password reset link",
        verificationId: verificationCode.id.toString() 
      });
    } catch (error) {
      console.error("Password reset request error:", error);
      return res.status(500).json({ message: "Error requesting password reset" });
    }
  });

  // Reset password with verification code
  app.post("/api/reset-password", async (req, res) => {
    try {
      const { verificationId, code, newPassword } = req.body;
      
      if (!verificationId || !code || !newPassword) {
        return res.status(400).json({ message: "All fields are required" });
      }
      
      // Get the verification code
      const verificationCode = await storage.getVerificationCode(
        parseInt(verificationId),
        code,
        "password_reset"
      );
      
      if (!verificationCode) {
        return res.status(400).json({ message: "Invalid verification code" });
      }
      
      // Check if the code has expired
      if (new Date() > verificationCode.expiresAt) {
        return res.status(400).json({ message: "Verification code has expired" });
      }
      
      // Check if the code has already been used
      if (verificationCode.usedAt) {
        return res.status(400).json({ message: "Verification code has already been used" });
      }
      
      // Update the user's password
      const user = await storage.getUser(verificationCode.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const hashedPassword = await hashPassword(newPassword);
      await storage.updateUser(user.id, { password: hashedPassword });
      
      // Mark the verification code as used
      await storage.markVerificationCodeAsUsed(verificationCode.id);
      
      return res.status(200).json({ message: "Password reset successfully" });
    } catch (error) {
      console.error("Password reset error:", error);
      return res.status(500).json({ message: "Error resetting password" });
    }
  });
}