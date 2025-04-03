
import { AlertTriangle, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { IS_SANDBOX, SANDBOX_MESSAGES } from "@/lib/sandbox";

export function SandboxBanner() {
  const { t } = useTranslation();

  if (!IS_SANDBOX) {
    return null;
  }

  return (
    <>
      <div className="bg-amber-500 text-white px-4 py-3 text-center font-medium flex items-center justify-center gap-3 shadow-md sticky top-0 z-[60]">
        <AlertTriangle className="h-5 w-5 animate-pulse" />
        <span>
          <strong className="tracking-wide">{SANDBOX_MESSAGES.SANDBOX_MODE}</strong>
          <span className="hidden sm:inline"> - {t('sandbox.subtitle')}</span>
        </span>
      </div>
      <Alert variant="warning" className="fixed bottom-0 left-0 right-0 z-50">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {t('sandbox.testing_version_warning')}
        </AlertDescription>
      </Alert>
    </>
  );
}
