import { apiRequest } from "@/lib/queryClient";
import { 
  LoginCredentials, 
  RegistrationData, 
  VerificationData, 
  SessionData,
  PatientProfile,
  DoctorProfile
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
  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    credentials: "include"
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Error en el registro");
  }
  
  const result = await response.json();
  return result;
};

// Verify email with code
export const verifyEmail = async (data: VerificationData): Promise<void> => {
  const response = await fetch("/api/auth/verify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    credentials: "include"
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Error en la verificación");
  }
};

// Login user
export const login = async (credentials: LoginCredentials): Promise<SessionData> => {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
    credentials: "include"
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Error al iniciar sesión");
  }
  
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
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${sessionData.sessionId}`
        },
        credentials: "include"
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
  
  const response = await fetch("/api/auth/me", {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${sessionData.sessionId}`
    },
    credentials: "include"
  });
  
  if (!response.ok) {
    removeSession();
    throw new Error("No autenticado");
  }
  
  return response.json();
};

// Create patient profile
export const createPatientProfile = async (data: any): Promise<PatientProfile> => {
  const sessionData = getStoredSession();
  
  if (!sessionData) {
    throw new Error("Not authenticated");
  }
  
  const response = await fetch("/api/patients/profile", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${sessionData.sessionId}`
    },
    body: JSON.stringify(data),
    credentials: "include"
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Error al crear perfil de paciente");
  }
  
  return response.json();
};

// Get patient profile
export const getPatientProfile = async (): Promise<PatientProfile> => {
  const sessionData = getStoredSession();
  
  if (!sessionData) {
    throw new Error("Not authenticated");
  }
  
  const response = await fetch("/api/patients/profile", {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${sessionData.sessionId}`
    },
    credentials: "include"
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Error al obtener perfil de paciente");
  }
  
  return response.json();
};

// Create doctor profile
export const createDoctorProfile = async (data: any): Promise<DoctorProfile> => {
  const sessionData = getStoredSession();
  
  if (!sessionData) {
    throw new Error("Not authenticated");
  }
  
  const response = await fetch("/api/doctors/profile", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${sessionData.sessionId}`
    },
    body: JSON.stringify(data),
    credentials: "include"
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Error al crear perfil de médico");
  }
  
  return response.json();
};

// Get doctor profile
export const getDoctorProfile = async (): Promise<DoctorProfile> => {
  const sessionData = getStoredSession();
  
  if (!sessionData) {
    throw new Error("Not authenticated");
  }
  
  const response = await fetch("/api/doctors/profile", {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${sessionData.sessionId}`
    },
    credentials: "include"
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Error al obtener perfil de médico");
  }
  
  return response.json();
};
