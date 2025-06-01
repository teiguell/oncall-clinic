import { Link, useLocation } from "wouter";
import { 
  Stethoscope,
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Mail, 
  Phone, 
  MapPin,
  Heart,
  Globe
} from "lucide-react";
import { useState } from "react";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [location] = useLocation();
  const [currentLang, setCurrentLang] = useState('es');

  // Detect current language from URL or default to Spanish
  const detectLanguage = () => {
    if (location.includes('-en')) return 'en';
    return 'es';
  };

  const lang = detectLanguage();

  const texts = {
    es: {
      company: "OnCall Clinic conecta pacientes con médicos certificados para servicios médicos domiciliarios de alta calidad, cuando y donde los necesites.",
      navigation: "Navegación",
      home: "Inicio",
      findDoctors: "Buscar Médicos",
      about: "Acerca de",
      signUp: "Registrarse",
      legal: "Legal",
      privacyPolicy: "Política de Privacidad",
      termsOfService: "Términos de Servicio",
      cookiePolicy: "Política de Cookies",
      contact: "Contacto",
      language: "Idioma",
      madeWith: "Hecho con",
      forHealthcare: "para una mejor atención médica",
      allRightsReserved: "Todos los derechos reservados."
    },
    en: {
      company: "OnCall Clinic connects patients with certified doctors for high-quality home medical services, when and where you need them.",
      navigation: "Navigation",
      home: "Home",
      findDoctors: "Find Doctors",
      about: "About",
      signUp: "Sign Up",
      legal: "Legal",
      privacyPolicy: "Privacy Policy",
      termsOfService: "Terms of Service",
      cookiePolicy: "Cookie Policy",
      contact: "Contact",
      language: "Language",
      madeWith: "Made with",
      forHealthcare: "for better healthcare",
      allRightsReserved: "All rights reserved."
    }
  };

  const t = texts[lang];
  
  return (
    <footer className="bg-gradient-to-b from-white to-blue-50 border-t border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-x-8 gap-y-10">
          <div className="col-span-1 md:col-span-2 lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Stethoscope className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">OnCall Clinic</span>
            </div>
            <p className="text-neutral-600 text-sm mb-6 pr-6">
              {t.company}
            </p>
            <div className="mt-6 flex items-center space-x-4">
              <a href="#" className="text-neutral-400 hover:text-blue-600 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-neutral-400 hover:text-blue-600 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-neutral-400 hover:text-blue-600 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-neutral-400 hover:text-blue-600 transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Navigation Column */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider mb-4">
              {t.navigation}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/">
                  <span className="text-neutral-600 hover:text-blue-600 transition-colors text-sm">
                    {t.home}
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/doctors">
                  <span className="text-neutral-600 hover:text-blue-600 transition-colors text-sm">
                    {t.findDoctors}
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/about">
                  <span className="text-neutral-600 hover:text-blue-600 transition-colors text-sm">
                    {t.about}
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/register">
                  <span className="text-neutral-600 hover:text-blue-600 transition-colors text-sm">
                    {t.signUp}
                  </span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider mb-4">
              {t.legal}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href={`/legal/privacy-policy-${lang}`}>
                  <span className="text-neutral-600 hover:text-blue-600 transition-colors text-sm">
                    {t.privacyPolicy}
                  </span>
                </Link>
              </li>
              <li>
                <Link href={`/legal/terms-of-use-${lang}`}>
                  <span className="text-neutral-600 hover:text-blue-600 transition-colors text-sm">
                    {t.termsOfService}
                  </span>
                </Link>
              </li>
              <li>
                <Link href={`/legal/cookies-policy-${lang}`}>
                  <span className="text-neutral-600 hover:text-blue-600 transition-colors text-sm">
                    {t.cookiePolicy}
                  </span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Language & Contact Column */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider mb-4">
              {t.language}
            </h3>
            <div className="space-y-3 mb-6">
              <div className="flex items-center space-x-2">
                <Globe className="h-4 w-4 text-neutral-400" />
                <div className="flex space-x-2">
                  <Link href={location.replace('-en', '-es').replace('/legal/', '/legal/')}>
                    <span className={`text-xs px-2 py-1 rounded transition-colors ${
                      lang === 'es' 
                        ? 'bg-blue-600 text-white' 
                        : 'text-neutral-600 hover:text-blue-600 border border-neutral-300'
                    }`}>
                      ES
                    </span>
                  </Link>
                  <Link href={location.replace('-es', '-en').replace('/legal/', '/legal/')}>
                    <span className={`text-xs px-2 py-1 rounded transition-colors ${
                      lang === 'en' 
                        ? 'bg-blue-600 text-white' 
                        : 'text-neutral-600 hover:text-blue-600 border border-neutral-300'
                    }`}>
                      EN
                    </span>
                  </Link>
                </div>
              </div>
            </div>
            
            <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider mb-4">
              {t.contact}
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-neutral-400" />
                <a href="mailto:support@oncallclinic.com" className="text-neutral-600 hover:text-blue-600 transition-colors text-sm">
                  support@oncallclinic.com
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-neutral-400" />
                <a href="tel:+34900123456" className="text-neutral-600 hover:text-blue-600 transition-colors text-sm">
                  +34 900 123 456
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-neutral-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-neutral-500 text-sm">
              © {currentYear} OnCall Clinic. {t.allRightsReserved}
            </p>
            <div className="mt-4 md:mt-0 flex items-center space-x-1 text-neutral-500 text-sm">
              <span>{t.madeWith}</span>
              <Heart className="h-4 w-4 text-red-500 fill-current" />
              <span>{t.forHealthcare}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}