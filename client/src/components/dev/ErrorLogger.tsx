import { useState } from 'react';
import { useErrorLogger } from '@/hooks/useErrorLogger';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, ChevronDown, ChevronUp, Download, Trash2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

export function ErrorLogger() {
  const { getErrorLogs, clearErrorLogs, exportErrorLogs } = useErrorLogger();
  const [logs, setLogs] = useState(() => getErrorLogs());
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  // La visibilidad ya se controla desde App.tsx

  const refreshLogs = () => {
    setLogs(getErrorLogs());
  };

  const handleClearLogs = () => {
    clearErrorLogs();
    setLogs([]);
    toast({
      title: 'Registros borrados',
      description: 'Todos los registros de errores han sido eliminados.',
      variant: 'default',
    });
  };

  const handleExportLogs = () => {
    exportErrorLogs();
    toast({
      title: 'Registros exportados',
      description: 'El archivo de registros ha sido descargado.',
      variant: 'default',
    });
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className="w-[380px] md:w-[480px]"
      >
        <CollapsibleTrigger asChild>
          <Button 
            variant="default" 
            className="flex items-center gap-2 w-full bg-amber-600 hover:bg-amber-700"
            onClick={refreshLogs}
          >
            <AlertCircle size={16} />
            <span>Debug: Error Logger ({logs.length})</span>
            {isOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex justify-between items-center">
                <span>Registro de Errores Alpha/Sandbox</span>
                <Badge variant="outline" className="ml-2">
                  {logs.length} {logs.length === 1 ? 'error' : 'errores'}
                </Badge>
              </CardTitle>
              <CardDescription>
                Solo visible en modo SANDBOX para depuración
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px] w-full rounded border p-2">
                {logs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No hay errores registrados
                  </div>
                ) : (
                  <div className="space-y-3">
                    {logs.map((log, index) => (
                      <div key={index} className="p-2 text-xs border rounded border-red-200 bg-red-50">
                        <div className="font-mono text-gray-500">
                          {new Date(log.time).toLocaleString()}
                        </div>
                        <div className="font-semibold text-red-700 mt-1">
                          {log.message}
                        </div>
                        <div className="mt-1">
                          <span className="text-gray-700">Origen: </span>
                          <span className="font-mono">{log.source}</span>
                        </div>
                        {(log.line || log.column) && (
                          <div>
                            <span className="text-gray-700">Posición: </span>
                            <span className="font-mono">línea {log.line}, columna {log.column}</span>
                          </div>
                        )}
                        {log.stack && (
                          <Collapsible className="mt-1">
                            <CollapsibleTrigger className="text-blue-600 hover:underline cursor-pointer text-xs flex items-center">
                              <ChevronDown size={12} className="mr-1" />
                              Ver stack trace
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <pre className="mt-1 p-2 bg-gray-100 text-[10px] overflow-x-auto">
                                {log.stack}
                              </pre>
                            </CollapsibleContent>
                          </Collapsible>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleClearLogs}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 size={16} className="mr-2" />
                Borrar registros
              </Button>
              <Button 
                variant="default" 
                size="sm"
                onClick={handleExportLogs}
                disabled={logs.length === 0}
              >
                <Download size={16} className="mr-2" />
                Exportar como JSON
              </Button>
            </CardFooter>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}