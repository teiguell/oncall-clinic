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
    <div className={`relative overflow-hidden h-[40vh] min-h-[400px] md:min-h-[450px] ${className}`}>
      {/* Imagen de fondo con overlay semitransparente */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80"
          alt={t('common.brand')}
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-center h-full py-12">
          <div className="flex flex-col gap-3 max-w-2xl mx-auto text-center lg:text-left lg:mx-0">
            {/* Logo y tagline */}
            <div className="flex flex-col items-center lg:items-start mb-2">
              <Logo size="md" className="mb-1" variant="white" />
              <p className="text-sm text-primary-200 font-medium">
                {t('common.tagline')}
              </p>
            </div>

            {/* Título y subtítulo */}
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
              {t('home.hero.title')}
            </h1>
            <h2 className="text-xl md:text-3xl font-semibold text-primary-300">
              {t('home.hero.subtitle')}
            </h2>

            {/* Descripción */}
            <p className="text-md md:text-xl text-white/90 mt-2">
              {t('home.features.convenience.description')}
            </p>

            {/* Botones CTA */}
            <div className="flex flex-col sm:flex-row gap-3 mt-6 sm:items-center justify-center lg:justify-start">
              <Link href="/doctors">
                <span className="w-full sm:w-auto px-6 py-3 rounded-md text-white font-medium bg-primary-600 hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-primary-900 inline-block cursor-pointer">
                  {t('home.hero.cta')}
                </span>
              </Link>
              <Link href="/register">
                <span className="w-full sm:w-auto px-6 py-3 rounded-md text-white font-medium bg-primary-800/60 hover:bg-primary-800/80 border border-primary-500 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-primary-900 inline-block cursor-pointer">
                  {t('nav.register')}
                </span>
              </Link>
            </div>

            {/* Características en iconos */}
            <div className="hidden md:grid grid-cols-3 gap-6 mt-8">
              <div className="flex items-center gap-2 text-white">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500/20 text-green-400">
                  <Stethoscope size={16} />
                </div>
                <span className="text-sm font-medium">{t('home.features.convenience.title')}</span>
              </div>
              <div className="flex items-center gap-2 text-white">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/20 text-blue-400">
                  <Users size={16} />
                </div>
                <span className="text-sm font-medium">{t('home.features.quality.title')}</span>
              </div>
              <div className="flex items-center gap-2 text-white">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/20 text-amber-400">
                  <Shield size={16} />
                </div>
                <span className="text-sm font-medium">{t('home.features.safety.title')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
