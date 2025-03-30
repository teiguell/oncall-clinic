import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Stethoscope, Users, Shield } from "lucide-react";
import { Logo } from "@/components/common/Logo";

interface HeroSectionProps {
  className?: string;
}

export default function HeroSection({ className }: HeroSectionProps) {
  const { t } = useTranslation();

  return (
    <div className={`relative overflow-hidden min-h-[50vh] ${className}`}>
      {/* Imagen de fondo con overlay oscuro para mayor contraste */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80"
          alt={t('common.brand')}
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-center h-full py-12 md:py-16 space-y-4">
          <div className="flex flex-col gap-4 max-w-2xl mx-auto text-center">
            {/* Logo centrado */}
            <div className="flex flex-col items-center mb-6">
              <Logo size="lg" className="mb-3" variant="white" />
              
              {/* Slogan debajo del logo */}
              <p className="text-white/90 text-lg italic mt-1">
                {t('common.slogan')}
              </p>
            </div>

            {/* Título y subtítulo */}
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white">
              {t('home.hero.title')}
            </h1>
            <h2 className="text-xl md:text-2xl font-medium text-white/80 mt-3">
              {t('home.hero.subtitle')}
            </h2>

            {/* Botón CTA */}
            <div className="flex justify-center mt-8">
              <Link href="/doctors">
                <span className="px-8 py-4 rounded-md text-white font-medium bg-primary-600 hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-primary-900 inline-block cursor-pointer text-lg">
                  {t('home.hero.cta')}
                </span>
              </Link>
            </div>

            {/* Características en iconos */}
            <div className="grid grid-cols-3 gap-6 mt-10">
              <div className="flex flex-col items-center gap-2 text-white">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-500/20 text-green-400">
                  <Stethoscope size={24} />
                </div>
                <span className="text-sm md:text-base font-medium">{t('home.features.convenience.title')}</span>
              </div>
              <div className="flex flex-col items-center gap-2 text-white">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/20 text-blue-400">
                  <Users size={24} />
                </div>
                <span className="text-sm md:text-base font-medium">{t('home.features.quality.title')}</span>
              </div>
              <div className="flex flex-col items-center gap-2 text-white">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-amber-500/20 text-amber-400">
                  <Shield size={24} />
                </div>
                <span className="text-sm md:text-base font-medium">{t('home.features.safety.title')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
