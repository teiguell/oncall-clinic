import { useTranslation } from "react-i18next";
import { Clock, Shield, MapPin, BadgeCheck } from "lucide-react";
import HeroSection from "@/components/home/hero-section";
import SearchSection from "@/components/home/search-section";
import DoctorList from "@/components/home/doctor-list";
import HowItWorks from "@/components/home/how-it-works";
import Testimonials from "@/components/home/testimonials";
import FAQSection from "@/components/home/faq-section";
import CallToAction from "@/components/home/call-to-action";

export default function Home() {
  const { t } = useTranslation();
  
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        <HeroSection />
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">{t('benefits.title')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="flex flex-col items-center p-6 text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                  <Clock className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{t('benefits.items.fast')}</h3>
              </div>
              <div className="flex flex-col items-center p-6 text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                  <Shield className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{t('benefits.items.secure')}</h3>
              </div>
              <div className="flex flex-col items-center p-6 text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                  <MapPin className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{t('benefits.items.track')}</h3>
              </div>
              <div className="flex flex-col items-center p-6 text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                  <BadgeCheck className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{t('benefits.items.verified')}</h3>
              </div>
            </div>
          </div>
        </section>
        <SearchSection />
        <DoctorList />
        <HowItWorks />
        <Testimonials />
        <FAQSection />
        <CallToAction />
      </main>
    </div>
  );
}
