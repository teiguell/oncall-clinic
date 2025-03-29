import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Appointment, PaymentFormData } from "@/types";
import { processPayment, formatCurrency, validateCardNumber, validateCardExpiry, validateCardCVC, formatCardNumber, getCardType } from "@/lib/payment";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, CheckCircle, CreditCard } from "lucide-react";
import { FaCcVisa, FaCcMastercard, FaCcAmex } from "react-icons/fa";

const paymentSchema = z.object({
  paymentMethod: z.string({
    required_error: "Selecciona un método de pago",
  }),
  cardDetails: z.object({
    number: z.string()
      .min(1, "El número de tarjeta es requerido")
      .refine(validateCardNumber, "Número de tarjeta inválido"),
    name: z.string().min(1, "El nombre del titular es requerido"),
    expiry: z.string()
      .min(1, "La fecha de expiración es requerida")
      .refine(validateCardExpiry, "Fecha de expiración inválida"),
    cvc: z.string()
      .min(1, "El código de seguridad es requerido")
      .refine(validateCardCVC, "Código de seguridad inválido"),
  }).optional().nullable(),
});

interface PaymentFormProps {
  appointment: Appointment;
  onSuccess?: () => void;
}

export default function PaymentForm({ appointment, onSuccess }: PaymentFormProps) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Form with validation
  const form = useForm<z.infer<typeof paymentSchema>>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      paymentMethod: "credit_card",
      cardDetails: {
        number: "",
        name: "",
        expiry: "",
        cvc: "",
      },
    },
  });

  // Payment mutation
  const paymentMutation = useMutation({
    mutationFn: (data: PaymentFormData) => processPayment(data),
    onSuccess: (data) => {
      if (data.success) {
        setIsSuccess(true);
        queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
        
        toast({
          title: "Pago exitoso",
          description: "Tu pago ha sido procesado correctamente",
        });
        
        if (onSuccess) {
          onSuccess();
        }
        
        // Navigate back to dashboard after 3 seconds
        setTimeout(() => {
          navigate("/dashboard/patient");
        }, 3000);
      } else {
        setError(data.message);
        toast({
          variant: "destructive",
          title: "Error en el pago",
          description: data.message,
        });
      }
    },
    onError: (error) => {
      console.error("Payment error:", error);
      setError("Error al procesar el pago. Por favor, inténtalo de nuevo.");
      
      toast({
        variant: "destructive",
        title: "Error en el pago",
        description: "No se pudo procesar el pago. Inténtalo de nuevo.",
      });
    },
    onSettled: () => {
      setIsProcessing(false);
    }
  });

  const onSubmit = async (values: z.infer<typeof paymentSchema>) => {
    setError(null);
    setIsProcessing(true);
    
    // Create payment data
    const paymentData: PaymentFormData = {
      appointmentId: appointment.id,
      paymentMethod: values.paymentMethod,
      cardDetails: values.cardDetails
    };
    
    paymentMutation.mutate(paymentData);
  };

  // Handle card number formatting
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatCardNumber(e.target.value);
    form.setValue("cardDetails.number", formattedValue);
  };

  // Handle card expiry formatting
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    
    if (value.length > 2) {
      value = value.substr(0, 2) + '/' + value.substr(2, 2);
    }
    
    form.setValue("cardDetails.expiry", value);
  };

  // Get card type icon
  const cardTypeIcon = () => {
    const cardNumber = form.watch("cardDetails.number");
    const type = getCardType(cardNumber);
    
    switch (type) {
      case 'visa':
        return <FaCcVisa className="h-6 w-6 text-blue-600" />;
      case 'mastercard':
        return <FaCcMastercard className="h-6 w-6 text-red-500" />;
      case 'amex':
        return <FaCcAmex className="h-6 w-6 text-blue-400" />;
      default:
        return <CreditCard className="h-5 w-5 text-neutral-400" />;
    }
  };

  // If payment is already completed
  if (appointment.paymentStatus === 'paid') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pago completado</CardTitle>
          <CardDescription>
            El pago para esta cita ya ha sido procesado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6">
            <div className="rounded-full bg-green-100 p-3 mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-neutral-900 mb-2">¡Pago exitoso!</h3>
            <p className="text-neutral-500 text-center mb-4">
              Has pagado {formatCurrency(appointment.totalAmount)} por tu cita médica
            </p>
            <Button onClick={() => navigate("/dashboard/patient")}>
              Ir a mi dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // If payment was just successfully processed
  if (isSuccess) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pago exitoso</CardTitle>
          <CardDescription>
            Tu pago ha sido procesado correctamente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6">
            <div className="rounded-full bg-green-100 p-3 mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-neutral-900 mb-2">¡Pago completado!</h3>
            <p className="text-neutral-500 text-center mb-4">
              Has pagado {formatCurrency(appointment.totalAmount)} por tu cita médica
            </p>
            <p className="text-sm text-neutral-400 mb-4">
              Redirigiendo al dashboard...
            </p>
            <Button onClick={() => navigate("/dashboard/patient")}>
              Ir a mi dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Completar pago</CardTitle>
        <CardDescription>
          Completa el pago para confirmar tu cita médica
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col md:flex-row gap-6 mb-6">
          <div className="w-full md:w-1/3 p-4 bg-primary-50 rounded-lg">
            <h3 className="font-medium text-lg mb-3">Resumen del pago</h3>
            
            <div className="border-b border-neutral-200 pb-3 mb-3">
              <div className="flex justify-between mb-1">
                <span className="text-neutral-600">Cita médica</span>
                <span>{formatCurrency(appointment.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-sm text-neutral-500">
                <span>Consulta médica a domicilio</span>
              </div>
            </div>
            
            <div className="border-b border-neutral-200 pb-3 mb-3">
              <div className="flex justify-between mb-1">
                <span className="text-neutral-600">Impuestos</span>
                <span>Incluidos</span>
              </div>
            </div>
            
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>{formatCurrency(appointment.totalAmount)}</span>
            </div>
          </div>

          <div className="w-full md:w-2/3">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Método de pago</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un método de pago" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="credit_card">Tarjeta de crédito/débito</SelectItem>
                            <SelectItem value="transfer">Transferencia bancaria</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.watch("paymentMethod") === "credit_card" && (
                  <div className="space-y-4 bg-white p-4 border rounded-md">
                    <FormField
                      control={form.control}
                      name="cardDetails.number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número de tarjeta</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                placeholder="1234 5678 9012 3456"
                                {...field}
                                onChange={handleCardNumberChange}
                                maxLength={19}
                              />
                              <div className="absolute right-3 top-2.5">
                                {cardTypeIcon()}
                              </div>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="cardDetails.name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre del titular</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Nombre como aparece en la tarjeta"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="cardDetails.expiry"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fecha de expiración</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="MM/YY"
                                {...field}
                                onChange={handleExpiryChange}
                                maxLength={5}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="cardDetails.cvc"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Código de seguridad (CVC)</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="123"
                                {...field}
                                maxLength={4}
                                type="password"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}

                {form.watch("paymentMethod") === "transfer" && (
                  <div className="bg-white p-4 border rounded-md">
                    <h4 className="font-medium mb-2">Datos para transferencia bancaria</h4>
                    <p className="text-sm text-neutral-600 mb-4">
                      Realiza una transferencia a la siguiente cuenta bancaria:
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium">Beneficiario:</span>
                        <span>MediHome S.L.</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">IBAN:</span>
                        <span>ES12 3456 7890 1234 5678 9012</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Entidad:</span>
                        <span>Banco MediHome</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Concepto:</span>
                        <span>CITA-{appointment.id}</span>
                      </div>
                    </div>
                    <p className="text-xs text-neutral-500 mt-4">
                      Importante: Indica el número de referencia en el concepto de la transferencia.
                      Una vez realizada, enviaremos confirmación a tu correo electrónico.
                    </p>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Procesando pago...
                    </>
                  ) : (
                    `Pagar ${formatCurrency(appointment.totalAmount)}`
                  )}
                </Button>
              </form>
            </Form>
          </div>
        </div>

        <div className="mt-4 text-center text-xs text-neutral-500">
          <p>Al realizar el pago, aceptas nuestros <a href="#" className="text-primary-500 hover:underline">Términos de servicio</a> y <a href="#" className="text-primary-500 hover:underline">Política de privacidad</a>.</p>
          <p className="mt-1">Todos los pagos son procesados de forma segura.</p>
        </div>
      </CardContent>
    </Card>
  );
}
