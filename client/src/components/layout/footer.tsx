import { Link } from "wouter";
import { 
  Stethoscope,
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Mail, 
  Phone, 
  MapPin,
  Heart
} from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gradient-to-b from-white to-blue-50 border-t border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10">
          <div className="col-span-1 md:col-span-2 lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <Stethoscope className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">OnCall Clinic</span>
            </div>
            <p className="text-neutral-600 text-sm mb-6 pr-6">
              OnCall Clinic connects patients with certified doctors for high-quality home medical services, when and where you need them.
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
              Navigation
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/">
                  <span className="text-neutral-600 hover:text-blue-600 transition-colors text-sm">
                    Home
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/doctors">
                  <span className="text-neutral-600 hover:text-blue-600 transition-colors text-sm">
                    Find Doctors
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/about">
                  <span className="text-neutral-600 hover:text-blue-600 transition-colors text-sm">
                    About
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/register">
                  <span className="text-neutral-600 hover:text-blue-600 transition-colors text-sm">
                    Sign Up
                  </span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider mb-4">
              Legal
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/legal/privacy">
                  <span className="text-neutral-600 hover:text-blue-600 transition-colors text-sm">
                    Privacy Policy
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/legal/terms">
                  <span className="text-neutral-600 hover:text-blue-600 transition-colors text-sm">
                    Terms of Service
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/legal/cookies">
                  <span className="text-neutral-600 hover:text-blue-600 transition-colors text-sm">
                    Cookie Policy
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/legal/notice">
                  <span className="text-neutral-600 hover:text-blue-600 transition-colors text-sm">
                    Legal Notice
                  </span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider mb-4">
              Contact
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-neutral-400" />
                <a href="mailto:support@oncall.clinic" className="text-neutral-600 hover:text-blue-600 transition-colors text-sm">
                  support@oncall.clinic
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-neutral-400" />
                <a href="tel:+34900123456" className="text-neutral-600 hover:text-blue-600 transition-colors text-sm">
                  +34 900 123 456
                </a>
              </li>
              <li className="flex items-start space-x-3">
                <MapPin className="h-4 w-4 text-neutral-400 mt-0.5" />
                <span className="text-neutral-600 text-sm">
                  123 Health Street<br />
                  28001, Madrid, Spain
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-neutral-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-neutral-500 text-sm">
              © {currentYear} OnCall Clinic. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0 flex items-center space-x-1 text-neutral-500 text-sm">
              <span>Made with</span>
              <Heart className="h-4 w-4 text-red-500 fill-current" />
              <span>for better healthcare</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}