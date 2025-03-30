import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home, Frown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { Logo } from "@/components/common/Logo";

export default function NotFound() {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
      <Card className="w-full max-w-md mx-4 shadow-lg border-t-4 border-t-primary">
        <CardContent className="pt-8 pb-8">
          <div className="flex flex-col items-center text-center mb-8">
            <Logo size="md" className="mb-6" />
            
            <div className="bg-red-50 p-4 rounded-full mb-6">
              <Frown className="h-16 w-16 text-red-500" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              404
            </h1>
            
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              {t('errors.notFound.title')}
            </h2>
            
            <p className="mt-2 text-gray-600 max-w-sm">
              {t('errors.notFound.message')}
            </p>
          </div>
          
          <div className="flex justify-center">
            <Button asChild size="lg" className="px-8 py-6 h-auto">
              <Link href="/">
                <Home className="mr-2 h-5 w-5" />
                {t('errors.notFound.button')}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
