import React from 'react';
import { IS_SANDBOX, SANDBOX_BANNER_MESSAGE } from '@/lib/sandbox';

/**
 * Banner que muestra información sobre el modo SANDBOX
 * Solo visible cuando la aplicación se ejecuta en este modo
 */
export const SandboxBanner: React.FC = () => {
  const currentLang = i18n.language || 'es';
  
  // Si no estamos en modo SANDBOX, no renderizar nada
  if (!IS_SANDBOX) return null;
  
  // Obtener el mensaje en el idioma actual, o español por defecto
  const message = SANDBOX_BANNER_MESSAGE[currentLang as keyof typeof SANDBOX_BANNER_MESSAGE] || 
                  SANDBOX_BANNER_MESSAGE.es;
  
  return (
    <div className="bg-yellow-100 border-yellow-300 border-b text-yellow-800 py-2 px-4 text-center text-sm font-medium">
      {message}
    </div>
  );
};