import Logo from "@/components/common/Logo";
import LogoIcon from "@/components/common/LogoIcon";
import { Link } from "wouter";
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Mail, 
  Phone, 
  MapPin,
  Heart
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gradient-to-b from-white to-blue-50 border-t border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10">
          <div className="col-span-1 md:col-span-2 lg:col-span-1">
            <Logo size="md" className="mb-4" />
            <p className="text-neutral-600 text-sm mb-6 pr-6">
              {t('footer.description')}
            </p>
            <div className="mt-6 flex items-center space-x-4">
              <a 
                href="#" 
                className="w-9 h-9 flex items-center justify-center rounded-full bg-primary-50 text-primary-600 hover:bg-primary-100 transition-colors duration-200"
                aria-label="Facebook"
              >
                <Facebook size={18} />
              </a>
              <a 
                href="#" 
                className="w-9 h-9 flex items-center justify-center rounded-full bg-primary-50 text-primary-600 hover:bg-primary-100 transition-colors duration-200"
                aria-label="Twitter"
              >
                <Twitter size={18} />
              </a>
              <a 
                href="#" 
                className="w-9 h-9 flex items-center justify-center rounded-full bg-primary-50 text-primary-600 hover:bg-primary-100 transition-colors duration-200"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </a>
              <a 
                href="#" 
                className="w-9 h-9 flex items-center justify-center rounded-full bg-primary-50 text-primary-600 hover:bg-primary-100 transition-colors duration-200"
                aria-label="LinkedIn"
              >
                <Linkedin size={18} />
              </a>
            </div>
          </div>
          
          <div className="col-span-1">
            <h3 className="text-sm font-medium text-neutral-900 mb-5 uppercase tracking-wider">
              {t('footer.sections.navigation')}
            </h3>
            <ul className="space-y-3.5 text-sm">
              <li>
                <Link href="/">
                  <span className="text-neutral-600 hover:text-primary-600 transition-colors cursor-pointer">{t('nav.home')}</span>
                </Link>
              </li>
              <li>
                <Link href="/doctors">
                  <span className="text-neutral-600 hover:text-primary-600 transition-colors cursor-pointer">{t('nav.findDoctor')}</span>
                </Link>
              </li>
              <li>
                <a href="#how-it-works" className="text-neutral-600 hover:text-primary-600 transition-colors">
                  {t('home.howItWorks.title')}
                </a>
              </li>
              <li>
                <Link href="/register/doctor">
                  <span className="text-neutral-600 hover:text-primary-600 transition-colors cursor-pointer">{t('nav.doctors')}</span>
                </Link>
              </li>
              <li>
                <Link href="/login">
                  <span className="text-neutral-600 hover:text-primary-600 transition-colors cursor-pointer">{t('nav.login')}</span>
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="col-span-1">
            <h3 className="text-sm font-medium text-neutral-900 mb-5 uppercase tracking-wider">
              {t('footer.sections.legal')}
            </h3>
            <ul className="space-y-3.5 text-sm">
              <li>
                <Link href="/aviso-legal">
                  <span className="text-neutral-600 hover:text-primary-600 transition-colors cursor-pointer">{t('legal.aviso-legal')}</span>
                </Link>
              </li>
              <li>
                <Link href="/politica-de-privacidad">
                  <span className="text-neutral-600 hover:text-primary-600 transition-colors cursor-pointer">{t('legal.politica-de-privacidad')}</span>
                </Link>
              </li>
              <li>
                <Link href="/politica-de-cookies">
                  <span className="text-neutral-600 hover:text-primary-600 transition-colors cursor-pointer">{t('legal.politica-de-cookies')}</span>
                </Link>
              </li>
              <li>
                <Link href="/terminos-y-condiciones">
                  <span className="text-neutral-600 hover:text-primary-600 transition-colors cursor-pointer">{t('legal.terminos-y-condiciones')}</span>
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="col-span-1">
            <h3 className="text-sm font-medium text-neutral-900 mb-5 uppercase tracking-wider">
              {t('footer.sections.contact')}
            </h3>
            <ul className="space-y-3.5 text-sm">
              <li className="flex items-start">
                <MapPin size={18} className="text-primary-600 mr-2.5 mt-0.5 shrink-0" />
                <span className="text-neutral-600">
                  Avenida Ignacio Wallis 29, 1º Izquierda<br />
                  07800 Ibiza
                </span>
              </li>
              <li className="flex items-center">
                <Phone size={18} className="text-primary-600 mr-2.5 shrink-0" />
                <a href="tel:+34612249017" className="text-neutral-600 hover:text-primary-600 transition-colors">
                  (+34) 612 249 017
                </a>
              </li>
              <li className="flex items-center">
                <Mail size={18} className="text-primary-600 mr-2.5 shrink-0" />
                <a href="mailto:contacto@oncallclinic.es" className="text-neutral-600 hover:text-primary-600 transition-colors">
                  contacto@oncallclinic.es
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-neutral-200">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <LogoIcon className="h-6 w-6 text-primary-600 mr-2" />
              <p className="text-neutral-500 text-sm">
                © {currentYear} OnCall Clinic. {t('footer.copyright')}
              </p>
            </div>
            <div className="flex items-center text-sm text-neutral-500">
              <span className="flex items-center">
                {t('common.tagline')} <Heart size={14} className="inline-block ml-1.5 mr-1.5 text-red-500" /> 
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}