import { useTranslation } from "react-i18next";
import { Logo } from "@/components/common/Logo";
import { Link } from "wouter";
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Mail, 
  Phone, 
  MapPin 
} from "lucide-react";

export default function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white border-t border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <Logo size="md" className="mb-4" />
            <p className="text-neutral-600 text-sm mb-6">
              {t('footer.description')}
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-neutral-500 hover:text-primary-600 transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-neutral-500 hover:text-primary-600 transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-neutral-500 hover:text-primary-600 transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-neutral-500 hover:text-primary-600 transition-colors">
                <Linkedin size={20} />
              </a>
            </div>
          </div>
          
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-neutral-900 tracking-wider uppercase mb-4">
              {t('footer.sections.navigation')}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/">
                  <span className="text-neutral-600 hover:text-primary-600 transition-colors cursor-pointer">{t('nav.home')}</span>
                </Link>
              </li>
              <li>
                <Link href="/doctors">
                  <span className="text-neutral-600 hover:text-primary-600 transition-colors cursor-pointer">{t('nav.doctors')}</span>
                </Link>
              </li>
              <li>
                <a href="#how-it-works" className="text-neutral-600 hover:text-primary-600 transition-colors">
                  {t('home.features.title')}
                </a>
              </li>
              <li>
                <Link href="/register/doctor">
                  <span className="text-neutral-600 hover:text-primary-600 transition-colors cursor-pointer">{t('auth.doctor')}</span>
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-neutral-900 tracking-wider uppercase mb-4">
              {t('footer.sections.legal')}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/terms">
                  <span className="text-neutral-600 hover:text-primary-600 transition-colors cursor-pointer">{t('footer.terms')}</span>
                </Link>
              </li>
              <li>
                <Link href="/privacy">
                  <span className="text-neutral-600 hover:text-primary-600 transition-colors cursor-pointer">{t('footer.privacy')}</span>
                </Link>
              </li>
              <li>
                <Link href="/cookies">
                  <span className="text-neutral-600 hover:text-primary-600 transition-colors cursor-pointer">{t('footer.cookies')}</span>
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-neutral-900 tracking-wider uppercase mb-4">
              {t('footer.sections.contact')}
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin size={18} className="text-primary-600 mr-2 mt-0.5" />
                <span className="text-neutral-600">{t('footer.address')}</span>
              </li>
              <li className="flex items-center">
                <Phone size={18} className="text-primary-600 mr-2" />
                <a href="tel:+34900123456" className="text-neutral-600 hover:text-primary-600 transition-colors">
                  +34 900 123 456
                </a>
              </li>
              <li className="flex items-center">
                <Mail size={18} className="text-primary-600 mr-2" />
                <a href="mailto:info@oncall.clinic" className="text-neutral-600 hover:text-primary-600 transition-colors">
                  info@oncall.clinic
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-neutral-100">
          <p className="text-neutral-500 text-sm text-center">
            © {currentYear} OnCall Clinic. {t('footer.copyright')}
          </p>
        </div>
      </div>
    </footer>
  );
}