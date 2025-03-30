import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/auth-context";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import LanguageSwitcher from "@/components/ui/language-switcher";
import { Logo } from "@/components/common/Logo";
import { 
  Bell,
  Menu,
  X,
  LogOut,
  User,
  Calendar,
  Settings
} from "lucide-react";

export default function Navbar() {
  const [location] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useTranslation();

  // Close mobile menu when location changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);
  
  const getInitials = () => {
    if (!user) return "MH";
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
  };
  
  const handleLogout = async () => {
    await logout();
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/">
                <Logo size="md" />
              </Link>
            </div>
            <div className="hidden sm:ml-10 sm:flex space-x-8">
              <Link href="/">
                <span className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium cursor-pointer ${
                  location === "/" 
                    ? "border-primary-500 text-primary-500" 
                    : "border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700"
                }`}>
                  {t('nav.home')}
                </span>
              </Link>
              <Link href="/doctors">
                <span className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium cursor-pointer ${
                  location.startsWith("/doctors") 
                    ? "border-primary-500 text-primary-500" 
                    : "border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700"
                }`}>
                  {t('nav.doctors')}
                </span>
              </Link>
              <a href="#how-it-works" className="border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                {t('home.features.title')}
              </a>
            </div>
          </div>
          
          <div className="hidden sm:flex items-center">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Notifications"
                  className="relative text-neutral-500"
                >
                  <Bell size={20} />
                  <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-primary-500"></span>
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar>
                        <AvatarImage src={user?.profilePicture} alt={user?.firstName} />
                        <AvatarFallback>{getInitials()}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <Link href={user?.userType === 'patient' ? '/dashboard/patient' : '/dashboard/doctor'}>
                      <DropdownMenuItem className="cursor-pointer">
                        <Calendar className="mr-2 h-4 w-4" />
                        <span>{t('nav.dashboard')}</span>
                      </DropdownMenuItem>
                    </Link>
                    <Link href="/profile">
                      <DropdownMenuItem className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        <span>{t('nav.profile')}</span>
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>{t('nav.logout')}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <>
                <LanguageSwitcher />
                
                <Link href="/register/doctor">
                  <Button
                    variant="ghost"
                    className="text-primary-600 hover:text-primary-800 hover:bg-primary-50 mr-2"
                  >
                    {t('nav.doctors')}
                  </Button>
                </Link>
                
                <Link href="/login">
                  <Button
                    variant="outline"
                    className="text-primary-600 border-primary-500 hover:bg-primary-50 mr-2"
                  >
                    {t('nav.login')}
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-primary-600 hover:bg-primary-700">
                    {t('nav.register')}
                  </Button>
                </Link>
              </>
            )}
          </div>
          
          <div className="flex items-center sm:hidden">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              aria-expanded={mobileMenuOpen}
            >
              <span className="sr-only">{mobileMenuOpen ? 'Close menu' : 'Open menu'}</span>
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${mobileMenuOpen ? 'block' : 'hidden'} sm:hidden`}>
        <div className="pt-2 pb-3 space-y-1">
          <Link href="/">
            <span className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium cursor-pointer ${
              location === "/" 
                ? "bg-primary-50 border-primary-500 text-primary-500" 
                : "border-transparent text-neutral-500 hover:bg-neutral-50 hover:border-neutral-300 hover:text-neutral-700"
            }`}>
              {t('nav.home')}
            </span>
          </Link>
          <Link href="/doctors">
            <span className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium cursor-pointer ${
              location.startsWith("/doctors") 
                ? "bg-primary-50 border-primary-500 text-primary-500" 
                : "border-transparent text-neutral-500 hover:bg-neutral-50 hover:border-neutral-300 hover:text-neutral-700"
            }`}>
              {t('nav.doctors')}
            </span>
          </Link>
          <a href="#how-it-works" className="border-transparent text-neutral-500 hover:bg-neutral-50 hover:border-neutral-300 hover:text-neutral-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
            {t('home.features.title')}
          </a>
          <div className="pl-3 pr-4 py-2 flex items-center">
            <span className="mr-2">{t('nav.language')}:</span>
            <LanguageSwitcher />
          </div>
        </div>
        <div className="pt-4 pb-3 border-t border-neutral-200">
          {isAuthenticated ? (
            <div>
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  <Avatar>
                    <AvatarImage src={user?.profilePicture} alt={user?.firstName} />
                    <AvatarFallback>{getInitials()}</AvatarFallback>
                  </Avatar>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-neutral-800">{user?.firstName} {user?.lastName}</div>
                  <div className="text-sm font-medium text-neutral-500">{user?.email}</div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-auto text-neutral-500"
                  aria-label="Notifications"
                >
                  <Bell size={20} />
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary-500"></span>
                </Button>
              </div>
              <div className="mt-3 space-y-1">
                <Link href={user?.userType === 'patient' ? '/dashboard/patient' : '/dashboard/doctor'}>
                  <span className="block px-4 py-2 text-base font-medium text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 cursor-pointer">
                    {t('nav.dashboard')}
                  </span>
                </Link>
                <Link href="/profile">
                  <span className="block px-4 py-2 text-base font-medium text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 cursor-pointer">
                    {t('nav.profile')}
                  </span>
                </Link>
                <button 
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-base font-medium text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100"
                >
                  {t('nav.logout')}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center px-4 space-y-2">
              <Link href="/register/doctor" className="w-full">
                <Button
                  variant="ghost"
                  className="text-primary-600 hover:text-primary-800 hover:bg-primary-50 w-full"
                >
                  {t('nav.doctors')}
                </Button>
              </Link>
              <Link href="/login" className="w-full">
                <Button
                  variant="outline"
                  className="text-primary-600 border-primary-500 hover:bg-primary-50 w-full"
                >
                  {t('nav.login')}
                </Button>
              </Link>
              <Link href="/register" className="w-full">
                <Button className="w-full bg-primary-600 hover:bg-primary-700">
                  {t('nav.register')}
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}