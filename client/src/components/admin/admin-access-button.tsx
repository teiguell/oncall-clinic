import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Shield, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminAccessButton() {
  const [, navigate] = useLocation();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleAdminAccess = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password === "Pepillo2727#") {
      setIsOpen(false);
      setPassword("");
      navigate("/admin");
      toast({
        title: "Acceso concedido",
        description: "Bienvenido al panel de administración",
      });
    } else {
      toast({
        title: "Acceso denegado",
        description: "Contraseña incorrecta",
        variant: "destructive",
      });
      setPassword("");
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12 rounded-full shadow-lg bg-white/90 backdrop-blur-sm border-gray-200 hover:bg-gray-50"
          >
            <Shield className="h-5 w-5 text-gray-600" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Acceso Administrativo</DialogTitle>
            <DialogDescription className="text-center">
              Ingrese la contraseña de administrador para acceder al panel de control
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAdminAccess} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingrese contraseña"
                  className="pr-10"
                  autoComplete="current-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setIsOpen(false);
                  setPassword("");
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" className="flex-1">
                Acceder
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}