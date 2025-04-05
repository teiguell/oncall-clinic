import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, AlertTriangle, Play, Bug } from 'lucide-react';
import { logger } from '@/lib/errorLogger';

// Definición de errores simulados
type ErrorType = 
  | 'client_component' 
  | 'client_async' 
  | 'client_render' 
  | 'boundary_test' 
  | 'fetch_error' 
  | 'server_500' 
  | 'syntax_error'
  | 'log_test';

const errorOptions = [
  { value: 'client_component', label: 'Component Error' },
  { value: 'client_async', label: 'Async Error' },
  { value: 'client_render', label: 'Render Error' },
  { value: 'boundary_test', label: 'Error Boundary Test' },
  { value: 'fetch_error', label: 'Fetch API Error' },
  { value: 'server_500', label: 'Simulate 500 Error' },
  { value: 'log_test', label: 'Log Test (No Error)' },
];

/**
 * Componente que permite generar errores controlados para pruebas
 * Solo disponible en modo SANDBOX para ayudar en desarrollo y QA
 */
export const ErrorGenerator: React.FC = () => {
  const [selectedError, setSelectedError] = useState<ErrorType>('client_component');
  const [isMinimized, setIsMinimized] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  
  // Generar el error seleccionado
  const generateError = () => {
    setIsGenerating(true);
    
    try {
      setTimeout(() => {
        setIsGenerating(false);
      }, 1000);
      
      switch (selectedError) {
        case 'client_component':
          // Error en un manejador de eventos
          throw new Error('Error simulado: Error en componente de cliente');
          
        case 'client_async':
          // Error en una promesa
          Promise.reject(new Error('Error simulado: Error asíncrono no capturado'));
          break;
          
        case 'client_render':
          // Forzar un error de renderizado estableciendo un estado inválido
          // @ts-ignore - Ignoramos el error de tipos para forzar un error en tiempo de ejecución
          document.body.style = null;
          break;
          
        case 'boundary_test':
          // Llamar a una función que no existe para probar el error boundary
          // @ts-ignore - Ignoramos el error de tipos para forzar un error en tiempo de ejecución
          const nonExistentFunction = window.nonExistentFunction;
          nonExistentFunction();
          break;
          
        case 'fetch_error':
          // Petición a endpoint inexistente
          fetch('/api/non-existent-endpoint')
            .then(res => {
              if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
              return res.json();
            })
            .then(data => console.log(data))
            .catch(err => {
              logger.error('Error en fetch API', err);
              throw err;
            });
          break;
          
        case 'server_500':
          // Simular error 500 del servidor
          fetch('/api/test-500')
            .then(res => {
              if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
              return res.json();
            })
            .catch(err => {
              logger.error('Error 500 simulado', err);
              throw err;
            });
          break;
          
        case 'log_test':
          // Generación de logs de prueba sin errores
          logger.debug('Mensaje de debug de prueba', { timestamp: new Date() });
          logger.info('Mensaje de información de prueba', { user: 'test@example.com' });
          logger.warn('Advertencia de prueba', { component: 'ErrorGenerator' });
          logger.error('Error simulado para pruebas', { 
            code: 'TEST_ERROR',
            stack: new Error().stack
          });
          break;
          
        default:
          logger.error('Tipo de error no reconocido', { type: selectedError });
      }
      
    } catch (error) {
      // Registrar el error generado
      logger.error(`Error generado manualmente (${selectedError})`, error);
      throw error; // Re-lanzar para que lo capture el error boundary
    }
  };
  
  // Si está minimizado, mostrar solo el ícono flotante
  if (isMinimized) {
    return (
      <div 
        className="fixed bottom-4 left-4 bg-yellow-600 text-white p-2 rounded-full shadow-lg cursor-pointer z-50 opacity-75 hover:opacity-100"
        onClick={() => setIsMinimized(false)}
      >
        <Bug className="w-6 h-6" aria-label="Error Generator (Development Only)" />
      </div>
    );
  }
  
  return (
    <div className="fixed bottom-4 left-4 w-72 bg-white rounded-lg shadow-xl z-50 overflow-hidden border border-gray-200">
      {/* Barra superior */}
      <div className="bg-yellow-600 text-white p-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5" />
          <h3 className="font-medium text-sm">Error Generator</h3>
          <span className="text-xs bg-yellow-700 px-1 rounded">SANDBOX</span>
        </div>
        
        <X 
          className="w-5 h-5 cursor-pointer hover:text-gray-200" 
          onClick={() => setIsMinimized(true)}
        />
      </div>
      
      {/* Contenido */}
      <div className="p-3 space-y-3">
        <div className="space-y-2">
          <label className="text-sm text-gray-600">Error type:</label>
          <Select 
            value={selectedError} 
            onValueChange={(value) => setSelectedError(value as ErrorType)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select error type" />
            </SelectTrigger>
            <SelectContent>
              {errorOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="pt-2">
          <Button 
            className="w-full flex items-center justify-center space-x-2"
            disabled={isGenerating}
            onClick={generateError}
            variant="destructive"
          >
            {isGenerating ? (
              <>
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Generate Error</span>
              </>
            )}
          </Button>
        </div>
      </div>
      
      {/* Pie */}
      <div className="bg-gray-100 border-t border-gray-200 p-2 text-xs text-gray-500">
        <p>Use this tool to test error handling.</p>
      </div>
    </div>
  );
};