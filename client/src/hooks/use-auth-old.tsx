import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { User, LoginData, PatientRegistration, DoctorRegistration, VerifyCodeData } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { safeT } from "@/i18n";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<User, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  patientRegisterMutation: UseMutationResult<{ userId: number, verificationId: string }, Error, PatientRegistration>;
  doctorRegisterMutation: UseMutationResult<{ userId: number, verificationId: string }, Error, FormData>;
  verifyEmailMutation: UseMutationResult<User, Error, VerifyCodeData>;
  googleLoginMutation: UseMutationResult<User, Error, { token: string }>;
  appleLoginMutation: UseMutationResult<User, Error, { token: string }>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();

  // Query to get the current user
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<User | null, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || safeT('login.error'));
      }
      return await res.json();
    },
    onSuccess: (user: User) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: t('login.success'),
        description: t('common.welcome', { name: user.firstName }),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t('login.error'),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Register patient mutation
  const patientRegisterMutation = useMutation({
    mutationFn: async (data: PatientRegistration) => {
      const res = await apiRequest("POST", "/api/register/patient", data);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Error al registrar");
      }
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: t('register.success'),
        description: t('register.verificationSent'),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t('register.error'),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Register doctor mutation (using FormData for file uploads)
  const doctorRegisterMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch("/api/register/doctor", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Error al registrar");
      }
      
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: t('register.success'),
        description: t('register.doctorVerificationSent'),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t('register.error'),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Verify email mutation
  const verifyEmailMutation = useMutation({
    mutationFn: async (data: VerifyCodeData) => {
      const res = await apiRequest("POST", "/api/verify-email", data);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || t('verification.error'));
      }
      return await res.json();
    },
    onSuccess: (user: User) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: t('verification.success'),
        description: t('verification.accountVerified'),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t('verification.error'),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Google login mutation
  const googleLoginMutation = useMutation({
    mutationFn: async (data: { token: string }) => {
      const res = await apiRequest("POST", "/api/login/google", data);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Error al iniciar sesión con Google");
      }
      return await res.json();
    },
    onSuccess: (user: User) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: t('login.success'),
        description: t('common.welcome', { name: user.firstName }),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t('login.error'),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Apple login mutation
  const appleLoginMutation = useMutation({
    mutationFn: async (data: { token: string }) => {
      const res = await apiRequest("POST", "/api/login/apple", data);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Error al iniciar sesión con Apple");
      }
      return await res.json();
    },
    onSuccess: (user: User) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: t('login.success'),
        description: t('common.welcome', { name: user.firstName }),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t('login.error'),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      toast({
        title: t('logout.success'),
        description: t('logout.message'),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t('logout.error'),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        patientRegisterMutation,
        doctorRegisterMutation,
        verifyEmailMutation,
        googleLoginMutation,
        appleLoginMutation
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}