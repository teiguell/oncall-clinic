import React from 'react';
import { Redirect, Route } from 'wouter';
import LoadingScreen from '@/components/ui/loading-screen';
import { logger } from './errorLogger';

// Tipo para usuarios
type UserType = 'patient' | 'doctor' | 'admin';

// Usuario con tipo fuertemente tipado
interface User {
  id: number | string;
  userType: UserType;
  emailVerified?: boolean;
}

// Props para la ruta protegida
interface ProtectedRouteProps {
  path: string;
  component: React.ComponentType<any>;
  userType?: UserType;
  redirectTo?: string;
  isAllowed?: boolean;
}

/**
 * Componente que protege rutas basado en autenticación y tipo de usuario
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  path,
  component: Component,
  userType,
  redirectTo = '/login',
  isAllowed = true
}) => {
  // Datos de autenticación (mock por ahora, luego vendrán de un contexto)
  const isLoading = false;
  const isAuthenticated = false;
  
  // Necesitamos tipo explícito aquí
  const user = null as User | null;
  
  // Validar el tipo de usuario
  const checkUserTypeAccess = (): boolean => {
    // Si no se requiere tipo específico, permitir acceso
    if (!userType) return true;
    
    // Si no hay usuario, denegar acceso
    if (!user) return false;
    
    // Comparar tipos (con verificación de tipo fuerte)
    return user.userType === userType as UserType;
  };
  
  // Verificar si se permite acceso
  const hasAccess = isAuthenticated && checkUserTypeAccess() && isAllowed;
  
  // Log de acceso para debugging
  React.useEffect(() => {
    logger.debug(`Protected route check: ${path}`, {
      authenticated: isAuthenticated,
      userTypeRequired: userType || 'any',
      hasAccess
    });
  }, [path, isAuthenticated, userType, hasAccess]);
  
  // Renderizar ruta condicionalmente
  return (
    <Route path={path}>
      {(params) => {
        if (isLoading) {
          return <LoadingScreen />;
        }
        
        if (!hasAccess) {
          logger.info(`Access denied to ${path}, redirecting to ${redirectTo}`);
          return <Redirect to={redirectTo} />;
        }
        
        return <Component params={params} />;
      }}
    </Route>
  );
};

export default ProtectedRoute;