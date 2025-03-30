import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Bug } from 'lucide-react';

export function ErrorGenerator() {
  const [isOpen, setIsOpen] = useState(false);
  
  // La visibilidad ya se controla desde App.tsx

  const generateRuntimeError = () => {
    // Error de tiempo de ejecución
    // @ts-ignore - ignorar el error de TypeScript intencionalmente, ya que queremos causar un error
    const obj = null;
    // @ts-ignore - ignorar el error de TypeScript intencionalmente, ya que queremos causar un error
    obj.nonExistentMethod();
  };

  const generateSyntaxError = () => {
    // Simulamos un error de sintaxis usando eval()
    try {
      // @ts-ignore
      eval('const x = {');
    } catch (error) {
      throw error;
    }
  };

  const generatePromiseRejection = () => {
    // Error de promesa rechazada no manejada
    const promise = new Promise((resolve, reject) => {
      setTimeout(() => {
        reject(new Error('Promesa rechazada para pruebas'));
      }, 100);
    });
    
    // Intencionalmente no manejamos el error
    promise.then(() => {
      console.log('Esto no se ejecutará');
    });
  };

  const generateNetworkError = () => {
    // Error de red
    fetch('https://non-existent-domain-for-testing-12345.com')
      .then(response => response.json());
  };

  const generateCustomError = () => {
    // Error personalizado
    throw new Error('Error personalizado para pruebas');
  };

  return (
    <div className="fixed bottom-4 left-4 z-50">
      {isOpen ? (
        <Card className="w-[350px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center">
              <Bug className="mr-2" size={18} />
              Generador de Errores (Sandbox)
            </CardTitle>
            <CardDescription>
              Genera errores para probar el sistema de registro
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="runtime">
              <TabsList className="grid grid-cols-3 mb-2">
                <TabsTrigger value="runtime">Runtime</TabsTrigger>
                <TabsTrigger value="syntax">Syntax</TabsTrigger>
                <TabsTrigger value="network">Network</TabsTrigger>
              </TabsList>
              <TabsContent value="runtime" className="space-y-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full" 
                  onClick={generateRuntimeError}
                >
                  Generar Error de Null
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full" 
                  onClick={generateCustomError}
                >
                  Error Personalizado
                </Button>
              </TabsContent>
              <TabsContent value="syntax" className="space-y-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full" 
                  onClick={generateSyntaxError}
                >
                  Error de Sintaxis
                </Button>
              </TabsContent>
              <TabsContent value="network" className="space-y-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full" 
                  onClick={generateNetworkError}
                >
                  Error de Red
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full" 
                  onClick={generatePromiseRejection}
                >
                  Promesa Rechazada
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="text-xs text-amber-600 flex items-center">
              <AlertTriangle size={14} className="mr-1" />
              Solo usar para pruebas
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              Cerrar
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <Button
          variant="default"
          size="sm"
          className="bg-amber-600 hover:bg-amber-700"
          onClick={() => setIsOpen(true)}
        >
          <Bug size={16} className="mr-2" />
          Generador de Errores
        </Button>
      )}
    </div>
  );
}