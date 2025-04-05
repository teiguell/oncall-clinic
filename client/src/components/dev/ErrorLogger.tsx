import React, { useState, useEffect, useRef } from 'react';
import { logger } from '@/lib/errorLogger';
import { Button } from '@/components/ui/button';
import { X, AlertCircle, AlertTriangle, Info, Bug, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';

/**
 * Componente que muestra un panel flotante con los logs de error
 * Solo disponible en modo SANDBOX para ayudar en desarrollo y QA
 */
export const ErrorLogger: React.FC = () => {
  // Estado
  const [logs, setLogs] = useState<any[]>([]);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(true);
  const logsRef = useRef<HTMLDivElement>(null);
  
  // Filtros de nivel de log
  const [filters, setFilters] = useState({
    error: true,
    warn: true,
    info: false,
    debug: false
  });
  
  // Escuchar nuevos logs
  useEffect(() => {
    // Cargar logs existentes
    setLogs(logger.getLogs());
    
    // Suscribirse a nuevos logs
    const unsubscribe = logger.subscribe((log) => {
      setLogs(currentLogs => [log, ...currentLogs]);
    });
    
    // Limpiar suscripción al desmontar
    return unsubscribe;
  }, []);
  
  // Desplazarse al log más reciente cuando se agregan nuevos
  useEffect(() => {
    if (logsRef.current && isExpanded) {
      logsRef.current.scrollTop = 0;
    }
  }, [logs, isExpanded]);
  
  // Renderizar ícono según nivel de log
  const renderLevelIcon = (level: string) => {
    switch (level) {
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'warn':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'info':
        return <Info className="w-4 h-4 text-blue-500" />;
      case 'debug':
        return <Bug className="w-4 h-4 text-green-500" />;
      default:
        return null;
    }
  };
  
  // Formatear marca de tiempo
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}.${date.getMilliseconds().toString().padStart(3, '0')}`;
  };
  
  // Filtrar logs según los filtros activos
  const filteredLogs = logs.filter(log => filters[log.level as keyof typeof filters]);
  
  // Alternar filtro
  const toggleFilter = (filter: keyof typeof filters) => {
    setFilters(prev => ({
      ...prev,
      [filter]: !prev[filter]
    }));
  };
  
  // Limpiar todos los logs
  const clearLogs = () => {
    logger.clearLogs();
    setLogs([]);
  };
  
  // Si está minimizado, solo mostrar un pequeño indicador
  if (isMinimized) {
    return (
      <div 
        className="fixed bottom-4 right-4 bg-gray-800 text-white p-2 rounded-full shadow-lg cursor-pointer z-50 opacity-75 hover:opacity-100"
        onClick={() => setIsMinimized(false)}
      >
        <AlertCircle className="w-6 h-6" aria-label="Error Logger (Development Only)" />
        {filteredLogs.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
            {filteredLogs.length > 99 ? '99+' : filteredLogs.length}
          </span>
        )}
      </div>
    );
  }
  
  return (
    <div className="fixed bottom-4 right-4 w-96 bg-white rounded-lg shadow-xl z-50 overflow-hidden border border-gray-200">
      {/* Barra superior */}
      <div className="bg-gray-800 text-white p-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <AlertCircle className="w-5 h-5" />
          <h3 className="font-medium text-sm">Error Logger</h3>
          <span className="text-xs bg-gray-700 px-1 rounded">SANDBOX</span>
        </div>
        
        <div className="flex items-center space-x-1">
          {isExpanded ? (
            <ChevronDown 
              className="w-5 h-5 cursor-pointer hover:text-gray-300" 
              onClick={() => setIsExpanded(false)}
            />
          ) : (
            <ChevronUp 
              className="w-5 h-5 cursor-pointer hover:text-gray-300" 
              onClick={() => setIsExpanded(true)}
            />
          )}
          <Trash2 
            className="w-5 h-5 cursor-pointer hover:text-gray-300" 
            onClick={clearLogs}
            aria-label="Clear logs"
          />
          <X 
            className="w-5 h-5 cursor-pointer hover:text-gray-300" 
            onClick={() => setIsMinimized(true)}
          />
        </div>
      </div>
      
      {/* Filtros */}
      <div className="flex justify-between p-2 bg-gray-100 border-b border-gray-200">
        <div className="flex space-x-2">
          <Button 
            size="sm"
            variant={filters.error ? "default" : "outline"}
            className={`text-xs py-0 px-2 h-6 ${filters.error ? 'bg-red-500 hover:bg-red-600' : ''}`}
            onClick={() => toggleFilter('error')}
          >
            Errors
          </Button>
          <Button 
            size="sm"
            variant={filters.warn ? "default" : "outline"}
            className={`text-xs py-0 px-2 h-6 ${filters.warn ? 'bg-yellow-500 hover:bg-yellow-600' : ''}`}
            onClick={() => toggleFilter('warn')}
          >
            Warnings
          </Button>
          <Button 
            size="sm"
            variant={filters.info ? "default" : "outline"}
            className={`text-xs py-0 px-2 h-6 ${filters.info ? 'bg-blue-500 hover:bg-blue-600' : ''}`}
            onClick={() => toggleFilter('info')}
          >
            Info
          </Button>
          <Button 
            size="sm"
            variant={filters.debug ? "default" : "outline"}
            className={`text-xs py-0 px-2 h-6 ${filters.debug ? 'bg-green-500 hover:bg-green-600' : ''}`}
            onClick={() => toggleFilter('debug')}
          >
            Debug
          </Button>
        </div>
      </div>
      
      {/* Panel de logs */}
      {isExpanded && (
        <div 
          ref={logsRef}
          className="overflow-y-auto max-h-96 text-xs"
        >
          {filteredLogs.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No logs to display
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div 
                key={log.id} 
                className="border-b border-gray-100 p-2 hover:bg-gray-50"
              >
                <div className="flex items-start">
                  <div className="mt-1 mr-2">
                    {renderLevelIcon(log.level)}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex justify-between mb-1">
                      <span className="font-mono text-gray-400">
                        {formatTimestamp(log.timestamp)}
                      </span>
                      <span className="uppercase text-[10px] font-bold px-1 rounded" style={{
                        backgroundColor: log.level === 'error' ? '#FEE2E2' : 
                                        log.level === 'warn' ? '#FEF3C7' : 
                                        log.level === 'info' ? '#DBEAFE' : '#D1FAE5',
                        color: log.level === 'error' ? '#DC2626' : 
                               log.level === 'warn' ? '#D97706' : 
                               log.level === 'info' ? '#2563EB' : '#059669'
                      }}>
                        {log.level}
                      </span>
                    </div>
                    <div className="text-gray-800 break-words">
                      {log.message}
                    </div>
                    {log.details && (
                      <div className="mt-1 bg-gray-50 p-1 rounded border border-gray-100 overflow-x-auto">
                        <pre className="text-[10px] text-gray-600">
                          {typeof log.details === 'string' 
                            ? log.details 
                            : JSON.stringify(log.details, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
      
      {/* Barra de estado */}
      <div className="bg-gray-100 border-t border-gray-200 p-1 text-xs text-gray-500 flex justify-between">
        <span>Total logs: {logs.length}</span>
        <span>Showing: {filteredLogs.length}</span>
      </div>
    </div>
  );
};