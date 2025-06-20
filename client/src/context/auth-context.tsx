import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { 
  login as authLogin, 
  register as authRegister, 
  logout as authLogout,
  verifyEmail as authVerifyEmail,
  sendVerificationCode as authSendVerificationCode,
  getAuthenticatedUser,
  getStoredSession,
  removeSession
} from "@/lib/auth";
import { 
  User, 
  LoginCredentials, 
  RegistrationData, 
  VerificationData 
} from "@/types";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegistrationData) => Promise<{verificationId: string, verificationCode: string}>;
  logout: () => Promise<void>;
  verifyEmail: (data: VerificationData) => Promise<User>;
  sendVerificationCode: (email: string) => Promise<{message: string}>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in on initial load
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      const sessionData = getStoredSession();
      
      if (sessionData) {
        try {
          const userData = await getAuthenticatedUser();
          setUser(userData);
        } catch (error) {
          console.error("Error retrieving user data:", error);
          removeSession();
        }
      }
      
      setIsLoading(false);
    };
    
    initAuth();
  }, []);

  // Login function
  const login = async (credentials: LoginCredentials) => {
    const { user } = await authLogin(credentials);
    setUser(user);
  };

  // Register function
  const register = async (data: RegistrationData) => {
    return await authRegister(data);
  };

  // Verify email function
  const verifyEmail = async (data: VerificationData) => {
    // Primero verificamos el email
    await authVerifyEmail(data);
    
    // Después obtenemos los datos del usuario actualizado (ahora con emailVerified=true)
    try {
      const userData = await getAuthenticatedUser();
      setUser(userData);
      return userData; // Devolvemos el usuario para poder acceder a su tipo
    } catch (error) {
      console.error("Error retrieving user data after verification:", error);
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    await authLogout();
    setUser(null);
  };

  // Send verification code function
  const sendVerificationCode = async (email: string) => {
    return await authSendVerificationCode(email);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    verifyEmail,
    sendVerificationCode
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
