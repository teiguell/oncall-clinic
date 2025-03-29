import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { SiGoogle, SiApple } from 'react-icons/si';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

type OAuthProvider = 'google' | 'apple';

interface OAuthButtonProps {
  provider: OAuthProvider;
  onSuccess?: (response: any) => void;
  onError?: (error: Error) => void;
  isDisabled?: boolean;
  className?: string;
  userType?: 'patient' | 'doctor';
}

// Extender el objeto Window para incluir el objeto de Google
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: any) => void;
          prompt: (notification?: any) => void;
          renderButton: (element: HTMLElement, options: any) => void;
          disableAutoSelect: () => void;
        };
      };
    };
  }
}

export function OAuthButton({ 
  provider, 
  onSuccess, 
  onError,
  isDisabled = false,
  className = '',
  userType = 'patient'
}: OAuthButtonProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);
  
  // Función para manejar la respuesta de Google
  const handleGoogleResponse = useCallback(async (response: any) => {
    try {
      setIsLoading(true);
      console.log('Google response:', response);
      
      // Validar el token con nuestro backend
      const apiResponse = await apiRequest('POST', '/api/auth/oauth-login', {
        provider: 'google',
        credential: response.credential, // El ID token
        userType: userType
      });
      
      const data = await apiResponse.json();
      
      if (apiResponse.ok) {
        // Guardamos el token de sesión
        localStorage.setItem('sessionId', data.sessionId);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Llamar al callback de éxito
        if (onSuccess) {
          onSuccess(data);
        }
        
        toast({
          title: "Inicio de sesión exitoso",
          description: "Has iniciado sesión correctamente con Google",
        });
      } else {
        throw new Error(data.message || 'Error al iniciar sesión con Google');
      }
    } catch (error) {
      console.error('OAuth error:', error);
      if (onError && error instanceof Error) {
        onError(error);
      }
      
      toast({
        title: "Error de autenticación",
        description: error instanceof Error ? error.message : 'Error al iniciar sesión con Google',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [onSuccess, onError, toast, userType]);
  
  // Inicializar Google Sign-In cuando el componente se monta
  useEffect(() => {
    // Solo inicializar Google Sign-In si estamos usando ese proveedor
    if (provider === 'google') {
      // Verificar si la API de Google Sign-In está disponible
      const loadGoogleSignIn = () => {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = initializeGoogleSignIn;
        document.body.appendChild(script);
      };
      
      const initializeGoogleSignIn = () => {
        if (window.google && window.google.accounts) {
          window.google.accounts.id.initialize({
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
            callback: handleGoogleResponse,
            auto_select: false,
            cancel_on_tap_outside: true
          });
          
          // Renderizar botón de Google si se proporciona una referencia
          if (buttonRef.current) {
            window.google.accounts.id.renderButton(buttonRef.current, {
              theme: 'outline',
              size: 'large',
              type: 'standard',
              shape: 'rectangular',
              text: 'continue_with',
              logo_alignment: 'left'
            });
          }
          
          // window.google.accounts.id.prompt(); // No solicitar automáticamente
        }
      };
      
      // Cargar Google Sign-In
      if (!window.google) {
        loadGoogleSignIn();
      } else {
        initializeGoogleSignIn();
      }
      
      // Limpiar
      return () => {
        const scriptElement = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
        if (scriptElement) {
          document.body.removeChild(scriptElement);
        }
      };
    }
  }, [provider, handleGoogleResponse]);
  
  // Para proveedores donde implementamos nuestro propio botón (como Apple)
  const handleCustomProviderSignIn = async () => {
    try {
      setIsLoading(true);
      
      if (provider === 'apple') {
        // Implementar la lógica para Sign in with Apple aquí
        toast({
          title: "No implementado",
          description: "Sign in with Apple aún no está implementado",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('OAuth error:', error);
      if (onError && error instanceof Error) {
        onError(error);
      }
      
      toast({
        title: "Error de autenticación",
        description: error instanceof Error ? error.message : 'Error de autenticación',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Renderizar diferentes botones según el proveedor
  if (provider === 'google') {
    return (
      <div 
        ref={buttonRef} 
        className={`w-full ${className}`} 
        style={{ 
          opacity: isDisabled ? 0.6 : 1,
          pointerEvents: isDisabled ? 'none' : 'auto'
        }}
      ></div>
    );
  }
  
  // Para Apple u otros proveedores, usamos nuestro propio botón personalizado
  return (
    <Button
      type="button"
      variant="outline"
      className={`w-full flex items-center justify-center gap-2 ${className}`}
      onClick={handleCustomProviderSignIn}
      disabled={isDisabled || isLoading}
    >
      {provider === 'apple' ? <SiApple className="h-5 w-5" /> : null}
      {isLoading ? 'Cargando...' : `Continuar con ${provider === 'apple' ? 'Apple' : provider}`}
    </Button>
  );
}