import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logger } from '@/lib/errorLogger';

// Define la interfaz que debe implementar el componente de Fallback
export interface FallbackProps {
  error: Error;
  resetError: () => void;
}

interface Props {
  children: ReactNode;
  FallbackComponent: React.ComponentType<FallbackProps>;
  onReset?: () => void;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Componente que captura errores en sus hijos y muestra un componente fallback
 * Implementa el patrón Error Boundary para React
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Actualiza el estado para que el siguiente renderizado muestre el fallback
    return { 
      hasError: true, 
      error 
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Loggear el error para debugging
    const errorDetails = {
      componentStack: errorInfo.componentStack,
      message: error.message,
      name: error.name,
      stack: error.stack,
    };

    // Registrar en el sistema de log
    logger.error(`Error capturado por ErrorBoundary: ${error.message}`, errorDetails);

    // Si hay un callback de error específico, llamarlo
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  resetError = () => {
    // Limpiar el error
    this.setState({ 
      hasError: false,
      error: null 
    });

    // Si hay un callback de reset específico, llamarlo
    if (this.props.onReset) {
      this.props.onReset();
    }
  }

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, FallbackComponent } = this.props;

    if (hasError && error) {
      // Renderizar el componente de fallback si hay un error
      return <FallbackComponent error={error} resetError={this.resetError} />;
    }

    // Si no hay error, renderizar los hijos normalmente
    return children;
  }
}

export default ErrorBoundary;