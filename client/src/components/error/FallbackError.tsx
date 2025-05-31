import React from 'react';
import { Button } from '@/components/ui/button';
import { IS_SANDBOX } from '@/lib/sandbox';
import { XCircle, ArrowRight, Home, RefreshCcw } from 'lucide-react';
import { FallbackProps } from './ErrorBoundary';

/**
 * Componente visual que se muestra cuando se captura un error
 * Proporciona información sobre el error y opciones para recuperarse
 */
const FallbackError: React.FC<FallbackProps> = ({ error, resetError }) => {
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 space-y-4">
        <div className="flex items-center space-x-3 text-red-500">
          <XCircle size={32} />
          <h2 className="text-2xl font-bold">{safeT('error.title')}</h2>
        </div>
        
        <div className="border-t border-gray-200 pt-4">
          <p className="text-gray-600 mb-2">
            {safeT('error.message')}
          </p>
          
          {/* Si estamos en modo SANDBOX, mostrar detalles del error para debugging */}
          {IS_SANDBOX && (
            <div className="mt-4 p-3 bg-gray-100 rounded text-sm font-mono overflow-x-auto">
              <p className="font-bold text-red-600">{error.name}</p>
              <p className="text-gray-800">{error.message}</p>
              {error.stack && (
                <pre className="mt-2 text-xs text-gray-600 max-h-32 overflow-y-auto">
                  {error.stack}
                </pre>
              )}
            </div>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 pt-4">
          <Button
            variant="outline"
            onClick={() => window.location.href = '/'}
            className="flex items-center justify-center space-x-2"
          >
            <Home size={16} />
            <span>{safeT('error.goHome')}</span>
          </Button>
          
          <Button 
            onClick={resetError}
            className="flex items-center justify-center space-x-2"
          >
            <RefreshCcw size={16} />
            <span>{safeT('error.tryAgain')}</span>
          </Button>
        </div>
      </div>
      
      {/* Información adicional */}
      <p className="mt-8 text-gray-500 text-sm text-center max-w-md">
        {safeT('error.supportMessage')}
        <a 
          href="mailto:support@oncall.clinic" 
          className="text-blue-500 hover:text-blue-700 ml-1"
        >
          support@oncall.clinic
          <ArrowRight size={12} className="inline ml-1" />
        </a>
      </p>
    </div>
  );
};

export default FallbackError;