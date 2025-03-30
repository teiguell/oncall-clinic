import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Stethoscope, Users, Shield } from "lucide-react";

export default function HeroSection() {
  const { t } = useTranslation();
  
  return (
    <div className="relative bg-gradient-to-br from-white via-blue-50 to-cyan-50 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
          <svg 
            className="hidden lg:block absolute right-0 inset-y-0 h-full w-48 text-cyan-50 transform translate-x-1/2" 
            fill="currentColor" 
            viewBox="0 0 100 100" 
            preserveAspectRatio="none" 
            aria-hidden="true"
          >
            <polygon points="50,0 100,0 50,100 0,100" />
          </svg>

          <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
            <div className="sm:text-center lg:text-left">
              <div className="flex items-center mb-4 lg:mb-6">
                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-100 text-primary-600 mr-3">
                  <Stethoscope size={20} />
                </span>
                <div>
                  <h2 className="font-bold text-xl text-primary-600">{t('common.brand')}</h2>
                  <p className="text-sm text-neutral-600">{t('common.tagline')}</p>
                </div>
              </div>
              
              <h1 className="text-4xl tracking-tight font-bold text-neutral-900 sm:text-5xl md:text-6xl">
                <span className="block">{t('home.hero.title')}</span>
                <span className="block text-primary-600 mt-2">{t('home.hero.subtitle')}</span>
              </h1>
              
              <p className="mt-3 text-base text-neutral-600 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                {t('home.features.convenience.description')}
              </p>
              
              <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                <div className="rounded-md shadow">
                  <Link href="/doctors">
                    <span className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 md:py-4 md:text-lg md:px-10 cursor-pointer transition-colors">
                      {t('home.hero.cta')}
                    </span>
                  </Link>
                </div>
                <div className="mt-3 sm:mt-0 sm:ml-3">
                  <Link href="/register">
                    <span className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 md:py-4 md:text-lg md:px-10 cursor-pointer transition-colors">
                      {t('nav.register')}
                    </span>
                  </Link>
                </div>
              </div>
              
              <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center sm:text-left">
                <div className="flex flex-col items-center sm:items-start">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 text-green-600 mb-3">
                    <Stethoscope size={20} />
                  </div>
                  <h3 className="text-sm font-semibold">{t('home.features.convenience.title')}</h3>
                </div>
                <div className="flex flex-col items-center sm:items-start">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 mb-3">
                    <Users size={20} />
                  </div>
                  <h3 className="text-sm font-semibold">{t('home.features.quality.title')}</h3>
                </div>
                <div className="flex flex-col items-center sm:items-start">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-100 text-amber-600 mb-3">
                    <Shield size={20} />
                  </div>
                  <h3 className="text-sm font-semibold">{t('home.features.safety.title')}</h3>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
      <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
        <img 
          className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full" 
          src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80" 
          alt={t('common.brand')} 
        />
      </div>
    </div>
  );
}
