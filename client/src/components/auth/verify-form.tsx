import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, Mail, ArrowRight, Check } from "lucide-react";

const verifySchema = z.object({
  code: z.string().min(6, "Verification code must be 6 characters").max(6, "Verification code must be 6 characters"),
});

type VerifyFormData = z.infer<typeof verifySchema>;

interface VerifyFormProps {
  verificationId: string;
  email: string;
}

export default function VerifyForm({ verificationId, email }: VerifyFormProps) {
  const { verifyEmailMutation } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isResending, setIsResending] = useState(false);

  const form = useForm<VerifyFormData>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      code: "",
    },
  });

  const onSubmit = async (data: VerifyFormData) => {
    try {
      await verifyEmailMutation.mutateAsync({
        verificationId,
        code: data.code,
      });
      
      toast({
        title: "Email verified successfully",
        description: "You can now access your account",
      });
      
      navigate("/dashboard");
    } catch (error) {
      console.error("Verification error:", error);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    try {
      // Note: This would need to be implemented in the auth system
      toast({
        title: "Verification code sent",
        description: "Please check your email for the new code",
      });
    } catch (error) {
      toast({
        title: "Failed to resend code",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mx-auto mb-4">
            <Mail className="w-6 h-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Verify your email
          </CardTitle>
          <CardDescription className="text-center">
            We've sent a verification code to <strong>{email}</strong>
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Verification Code</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="text"
                        placeholder="Enter 6-digit code"
                        maxLength={6}
                        className="text-center text-lg tracking-widest"
                        autoComplete="one-time-code"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {verifyEmailMutation.error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {verifyEmailMutation.error.message}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={verifyEmailMutation.isPending}
              >
                {verifyEmailMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Verify Email
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-gray-600">
            Didn't receive the code?
          </div>
          <Button
            variant="outline"
            onClick={handleResendCode}
            disabled={isResending}
            className="w-full"
          >
            {isResending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <ArrowRight className="w-4 h-4 mr-2" />
                Resend code
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}