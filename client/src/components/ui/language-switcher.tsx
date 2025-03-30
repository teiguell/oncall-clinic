import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Check, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState("es"); // Default to Spanish

  // Set initial language from localStorage or browser preference
  useEffect(() => {
    const savedLanguage = localStorage.getItem("i18nextLng");
    if (savedLanguage) {
      setCurrentLanguage(savedLanguage.slice(0, 2)); // Only take first two chars (e.g., "es" from "es-ES")
    }
  }, []);

  // Update current language state when i18n language changes
  useEffect(() => {
    if (i18n.language) {
      setCurrentLanguage(i18n.language.slice(0, 2));
    }
  }, [i18n.language]);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setCurrentLanguage(lng);
    localStorage.setItem("i18nextLng", lng);
  };

  // Language options with their display names
  const languages = [
    { code: "es", name: "Español", flag: "🇪🇸" },
    { code: "en", name: "English", flag: "🇺🇸" },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex items-center gap-2 px-3 py-2 rounded-full transition-all hover:bg-primary-50 hover:text-primary-600"
          aria-label={t('nav.language')}
        >
          <Globe size={18} className="text-primary-600" />
          <span className="hidden md:inline-block font-medium">
            {currentLanguage === "es" ? "Español" : "English"}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px] p-1.5">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className={cn(
              "flex items-center justify-between gap-2 py-2.5 px-3 rounded-md cursor-pointer transition-colors",
              currentLanguage === lang.code 
                ? "bg-primary-50 text-primary-700" 
                : "hover:bg-muted"
            )}
          >
            <div className="flex items-center gap-2">
              <span className="text-base">{lang.flag}</span>
              <span className="font-medium">{lang.name}</span>
            </div>
            {currentLanguage === lang.code && (
              <Check size={16} className="text-primary-600" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;