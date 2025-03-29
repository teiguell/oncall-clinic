import { Search, Calendar, Home } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function HowItWorks() {
  const { t } = useTranslation();

  return (
    <div className="bg-primary-50 py-16" id="how-it-works">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-primary-500 font-semibold tracking-wide uppercase">
            {t('common.brand')}
          </h2>
          <p className="mt-2 text-3xl leading-8 font-bold tracking-tight text-neutral-900 sm:text-4xl">
            {t('home.howItWorks.title')}
          </p>
          <p className="mt-4 max-w-2xl text-xl text-neutral-500 lg:mx-auto">
            {t('common.tagline')}
          </p>
        </div>

        <div className="mt-10">
          <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10">
            <div className="relative">
              <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                <Search className="h-6 w-6" />
              </div>
              <div className="ml-16">
                <h3 className="text-lg leading-6 font-medium text-neutral-900">1. {t('home.howItWorks.step1.title')}</h3>
                <p className="mt-2 text-base text-neutral-500">
                  {t('home.howItWorks.step1.description')}
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                <Calendar className="h-6 w-6" />
              </div>
              <div className="ml-16">
                <h3 className="text-lg leading-6 font-medium text-neutral-900">2. {t('home.howItWorks.step2.title')}</h3>
                <p className="mt-2 text-base text-neutral-500">
                  {t('home.howItWorks.step2.description')}
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                <Home className="h-6 w-6" />
              </div>
              <div className="ml-16">
                <h3 className="text-lg leading-6 font-medium text-neutral-900">3. {t('home.howItWorks.step4.title')}</h3>
                <p className="mt-2 text-base text-neutral-500">
                  {t('home.howItWorks.step4.description')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
