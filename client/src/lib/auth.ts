import { apiRequest } from "@/lib/queryClient";
import { 
  LoginCredentials, 
  RegistrationData, 
  VerificationData, 
  SessionData,
  PatientProfile,
  DoctorProfile,
  InsertPatientProfile,
  InsertDoctorProfile
} from "@/types";

// Local storage keys
const SESSION_KEY = "medihome_session";

// Store session data in localStorage
export const storeSession = (sessionData: SessionData): void => {
  localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
};

// Get session data from localStorage
export const getStoredSession = (): SessionData | null => {
  const sessionData = localStorage.getItem(SESSION_KEY);
  return sessionData ? JSON.parse(sessionData) : null;
};

// Remove session data from localStorage
export const removeSession = (): void => {
  localStorage.removeItem(SESSION_KEY);
};

// Register a new user
export const register = async (data: RegistrationData): Promise<{ verificationId: string, verificationCode: string }> => {
  const response = await apiRequest("POST", "/api/auth/register", data);
  const result = await response.json();
  return result;
};

// Verify email with code
export const verifyEmail = async (data: VerificationData): Promise<void> => {
  await apiRequest("POST", "/api/auth/verify", data);
};

// Login user
export const login = async (credentials: LoginCredentials): Promise<SessionData> => {
  const response = await apiRequest("POST", "/api/auth/login", credentials);
  const result = await response.json();
  
  const sessionData = {
    sessionId: result.sessionId,
    user: result.user
  };
  
  storeSession(sessionData);
  return sessionData;
};

// Logout user
export const logout = async (): Promise<void> => {
  const sessionData = getStoredSession();
  
  if (sessionData) {
    try {
      await apiRequest("POST", "/api/auth/logout", {}, {
        headers: {
          Authorization: `Bearer ${sessionData.sessionId}`
        }
      });
    } catch (error) {
      console.error("Error during logout:", error);
    }
    
    removeSession();
  }
};

// Get authenticated user
export const getAuthenticatedUser = async (): Promise<any> => {
  const sessionData = getStoredSession();
  
  if (!sessionData) {
    throw new Error("Not authenticated");
  }
  
  const response = await apiRequest("GET", "/api/auth/me", undefined, {
    headers: {
      Authorization: `Bearer ${sessionData.sessionId}`
    }
  });
  
  return response.json();
};

// Create patient profile
export const createPatientProfile = async (data: InsertPatientProfile): Promise<PatientProfile> => {
  const sessionData = getStoredSession();
  
  if (!sessionData) {
    throw new Error("Not authenticated");
  }
  
  const response = await apiRequest("POST", "/api/patients/profile", data, {
    headers: {
      Authorization: `Bearer ${sessionData.sessionId}`
    }
  });
  
  return response.json();
};

// Get patient profile
export const getPatientProfile = async (): Promise<PatientProfile> => {
  const sessionData = getStoredSession();
  
  if (!sessionData) {
    throw new Error("Not authenticated");
  }
  
  const response = await apiRequest("GET", "/api/patients/profile", undefined, {
    headers: {
      Authorization: `Bearer ${sessionData.sessionId}`
    }
  });
  
  return response.json();
};

// Create doctor profile
export const createDoctorProfile = async (data: InsertDoctorProfile): Promise<DoctorProfile> => {
  const sessionData = getStoredSession();
  
  if (!sessionData) {
    throw new Error("Not authenticated");
  }
  
  const response = await apiRequest("POST", "/api/doctors/profile", data, {
    headers: {
      Authorization: `Bearer ${sessionData.sessionId}`
    }
  });
  
  return response.json();
};

// Get doctor profile
export const getDoctorProfile = async (): Promise<DoctorProfile> => {
  const sessionData = getStoredSession();
  
  if (!sessionData) {
    throw new Error("Not authenticated");
  }
  
  const response = await apiRequest("GET", "/api/doctors/profile", undefined, {
    headers: {
      Authorization: `Bearer ${sessionData.sessionId}`
    }
  });
  
  return response.json();
};
