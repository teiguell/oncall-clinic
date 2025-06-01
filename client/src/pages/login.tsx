import { Card, CardContent, CardFooter } from "@/components/ui/card";
import LoginForm from "@/components/auth/login-form";
import { Link } from "wouter";

export default function LoginPage() {
  return (
    <div className="container max-w-md mx-auto py-8 px-4">
      <Card>
        <CardContent className="pt-8">
          <LoginForm />
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-center">
            ¿No tienes cuenta?{' '}
            <Link href="/register" className="text-primary font-semibold hover:underline">
              Crear cuenta
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}