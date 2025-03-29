import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Appointment } from "@/types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { StatusBadge } from "@/components/ui/status-badge";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { ChevronDown, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Define the status flow
const statusFlow: Record<string, string[]> = {
  scheduled: ["confirmed"],
  confirmed: ["en_route"],
  en_route: ["arrived"],
  arrived: ["in_progress"],
  in_progress: ["completed"],
  completed: [],
  canceled: []
};

// Status descriptions for help text
const statusDescriptions: Record<string, string> = {
  confirmed: "Confirmar que usted atenderá esta cita",
  en_route: "Indicar que está en camino al domicilio del paciente",
  arrived: "Registrar que ha llegado al domicilio del paciente",
  in_progress: "Iniciar la consulta médica",
  completed: "Finalizar la consulta y completar la cita"
};

interface AppointmentStatusControlsProps {
  appointment: Appointment;
}

export default function AppointmentStatusControls({ appointment }: AppointmentStatusControlsProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  
  // Get available next statuses
  const availableStatuses = statusFlow[appointment.status] || [];
  
  // Status update mutation
  const { mutate, isPending } = useMutation({
    mutationFn: async (newStatus: string) => {
      return await apiRequest(
        "PATCH",
        `/api/appointments/${appointment.id}/status`,
        { status: newStatus }
      );
    },
    onSuccess: () => {
      // Invalidate appointments query to refetch data
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
      
      // Show success toast
      toast({
        title: "Estado actualizado",
        description: "El estado de la cita ha sido actualizado correctamente.",
        duration: 3000,
      });
      
      // Close dropdown
      setIsOpen(false);
    },
    onError: (error) => {
      console.error("Error updating appointment status:", error);
      
      // Show error toast
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado de la cita. Inténtalo de nuevo.",
        variant: "destructive",
        duration: 5000,
      });
    }
  });
  
  // Handle status update
  const handleStatusUpdate = (newStatus: string) => {
    mutate(newStatus);
  };
  
  // If there are no available status transitions, just show current status
  if (availableStatuses.length === 0) {
    return (
      <div className="flex items-center">
        <StatusBadge status={appointment.status as any} />
      </div>
    );
  }
  
  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center" disabled={isPending}>
          {isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <StatusBadge status={appointment.status as any} className="mr-2" />
          )}
          Actualizar estado <ChevronDown className="h-4 w-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Cambiar estado</DropdownMenuLabel>
        {availableStatuses.map((status) => (
          <DropdownMenuItem
            key={status}
            onClick={() => handleStatusUpdate(status)}
            disabled={isPending}
          >
            <div className="flex flex-col">
              <div className="flex items-center">
                <StatusBadge status={status as any} className="mr-2" />
              </div>
              <p className="text-xs text-neutral-500 mt-1">
                {statusDescriptions[status]}
              </p>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}