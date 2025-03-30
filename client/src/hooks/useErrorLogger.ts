import { useEffect } from "react";

type ErrorLog = {
  time: string;
  message: string;
  source: string;
  line: number;
  column: number;
  stack?: string;
};

export function useErrorLogger() {
  useEffect(() => {
    const errorHandler = (event: ErrorEvent) => {
      const errorLog: ErrorLog = {
        time: new Date().toISOString(),
        message: event.message || 'Unknown error',
        source: event.filename || 'Unknown source',
        line: event.lineno || 0,
        column: event.colno || 0,
        stack: event.error?.stack
      };

      const existingLogs = JSON.parse(localStorage.getItem("oncall_error_log") || "[]");
      localStorage.setItem("oncall_error_log", JSON.stringify([...existingLogs, errorLog]));

      console.error("Error capturado:", errorLog);
    };

    const rejectionHandler = (event: PromiseRejectionEvent) => {
      const errorLog: ErrorLog = {
        time: new Date().toISOString(),
        message: event.reason?.message || String(event.reason) || 'Unhandled Promise Rejection',
        source: 'Promise Rejection',
        line: 0,
        column: 0,
        stack: event.reason?.stack
      };

      const existingLogs = JSON.parse(localStorage.getItem("oncall_error_log") || "[]");
      localStorage.setItem("oncall_error_log", JSON.stringify([...existingLogs, errorLog]));

      console.error("Promise rejection capturada:", errorLog);
    };

    window.addEventListener("error", errorHandler);
    window.addEventListener("unhandledrejection", rejectionHandler);
    
    return () => {
      window.removeEventListener("error", errorHandler);
      window.removeEventListener("unhandledrejection", rejectionHandler);
    };
  }, []);
  
  // Función para limpiar los registros de errores
  const clearErrorLogs = () => {
    localStorage.removeItem("oncall_error_log");
  };
  
  // Función para obtener los registros de errores
  const getErrorLogs = (): ErrorLog[] => {
    return JSON.parse(localStorage.getItem("oncall_error_log") || "[]");
  };
  
  // Función para exportar los registros de errores como un archivo JSON
  const exportErrorLogs = () => {
    const logs = getErrorLogs();
    const dataStr = JSON.stringify(logs, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportFileDefaultName = `oncall_error_logs_${new Date().toISOString().slice(0, 10)}.json`;
    
    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };
  
  return {
    getErrorLogs,
    clearErrorLogs,
    exportErrorLogs
  };
}