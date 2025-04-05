import { useTranslation } from "react-i18next";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import LoginForm from "@/components/auth/login-form";

export default function LoginPage() {
  const { t } = useTranslation();

  return (
    <div className="container max-w-md mx-auto py-8 px-4">
      <Card>
        <CardContent className="pt-8">
          <LoginForm />
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-center">
            {t('login.noAccount')}{' '}
            <a href="/register" className="text-primary font-semibold hover:underline">
              {t('login.createAccount')}
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}