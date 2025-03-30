import { AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { IS_SANDBOX, SANDBOX_MESSAGES } from "@/lib/sandbox";

export function SandboxBanner() {
  const { t } = useTranslation();
  
  if (!IS_SANDBOX) {
    return null;
  }

  const handleInfoClick = () => {
    toast.info(
      <div className="text-sm">
        <p className="font-semibold mb-2">{t('sandbox.info.title')}</p>
        <ul className="list-disc pl-4 space-y-1">
          <li>{t('sandbox.info.point1')}</li>
          <li>{t('sandbox.info.point2')}</li>
          <li>{t('sandbox.info.point3')}</li>
        </ul>
      </div>,
      {
        autoClose: 10000,
        position: "top-center"
      }
    );
  };

  return (
    <div className="bg-amber-500 text-white px-4 py-3 text-center font-medium flex items-center justify-center gap-3 shadow-md sticky top-0 z-[60]">
      <AlertTriangle className="h-5 w-5 animate-pulse" />
      <span>
        <strong className="tracking-wide">{SANDBOX_MESSAGES.SANDBOX_MODE}</strong>
        <span className="hidden sm:inline"> - {t('sandbox.subtitle')}</span>
      </span>
      <button 
        onClick={handleInfoClick}
        className="underline ml-2 font-bold hover:text-amber-900 transition-colors flex items-center"
      >
        {t('sandbox.moreInfo')}
      </button>
    </div>
  );
}