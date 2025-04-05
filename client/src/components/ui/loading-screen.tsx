import React from 'react';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface LoadingScreenProps {
  message?: string;
  fullScreen?: boolean;
}

/**
 * Componente para mostrar una pantalla de carga
 * Se puede usar como pantalla completa o como un contenedor
 */
const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message,
  fullScreen = true
}) => {
  const { t } = useTranslation();
  const defaultMessage = t('common.loading', 'Cargando...');
  
  const content = (
    <div className="flex flex-col items-center justify-center space-y-4">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="text-lg font-medium text-muted-foreground">
        {message || defaultMessage}
      </p>
    </div>
  );
  
  if (fullScreen) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-background">
        {content}
      </div>
    );
  }
  
  return (
    <div className="w-full h-full min-h-[200px] flex items-center justify-center">
      {content}
    </div>
  );
};

export default LoadingScreen;