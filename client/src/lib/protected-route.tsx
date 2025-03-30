import { useAuth } from "@/context/auth-context";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

export function ProtectedRoute({
  path,
  component: Component,
  userType,
}: {
  path: string;
  component: () => React.JSX.Element;
  userType?: string | string[]; // Optional userType for role-based protection
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Route>
    );
  }

  if (!user) {
    // No user logged in, redirect to login page
    return (
      <Route path={path}>
        <Redirect to="/login" />
      </Route>
    );
  }

  // Si el usuario aún no ha verificado su correo, redirigirlo a la página de verificación
  if (user && !user.emailVerified) {
    return (
      <Route path={path}>
        <Redirect to={`/verify?email=${encodeURIComponent(user.email)}`} />
      </Route>
    );
  }

  // If userType is specified, check if user has the required type
  if (userType) {
    const requiredTypes = Array.isArray(userType) ? userType : [userType];
    
    if (!requiredTypes.includes(user.userType)) {
      // User doesn't have the required type, redirect to dashboard
      const dashboardPath = user.userType === 'doctor' 
        ? '/dashboard/doctor' 
        : '/dashboard/patient';
      
      return (
        <Route path={path}>
          <Redirect to={dashboardPath} />
        </Route>
      );
    }
  }

  // User is authenticated, verified, and has the required type (if specified)
  return <Route path={path} component={Component} />;
}