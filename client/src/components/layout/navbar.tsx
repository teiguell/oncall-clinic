import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/auth-context";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import LanguageSwitcher from "@/components/ui/language-switcher";
import { Logo } from "@/components/common/Logo";
import { cn } from "@/lib/utils";
import { 
  Bell,
  Menu,
  X,
  LogOut,
  User,
  Calendar,
  Settings,
  Stethoscope,
  Home,
  Search,
  ChevronRight,
  HelpCircle
} from "lucide-react";

export default function Navbar() {
  const [location] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { t } = useTranslation();

  // Close mobile menu when location changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);
  
  // Add shadow to navbar when scrolled
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const getInitials = () => {
    if (!user) return "OC";
    return `${user.firstName?.charAt(0) || ""}${user.lastName?.charAt(0) || ""}`;
  };
  
  const handleLogout = async () => {
    await logout();
  };

  return (
    <nav className={cn(
      "bg-white sticky top-0 z-50 transition-all duration-200",
      scrolled ? "shadow-md" : "shadow-sm"
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Logo 
                size="sm" 
                className="transition-transform duration-200 hover:scale-105" 
                useImage={true} 
                linkTo="/" 
              />
            </div>
            <div className="hidden md:ml-10 md:flex space-x-1 lg:space-x-2">
              <Link href="/">
                <a className={cn(
                  "px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer flex items-center",
                  location === "/" 
                    ? "text-primary-600 bg-primary-50" 
                    : "text-neutral-600 hover:text-primary-600 hover:bg-neutral-50"
                )}>
                  <Home size={18} className="mr-1.5 lg:mr-2" />
                  <span>{t('nav.home')}</span>
                </a>
              </Link>
              <Link href="/doctors">
                <a className={cn(
                  "px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer flex items-center",
                  location.startsWith("/doctors") 
                    ? "text-primary-600 bg-primary-50" 
                    : "text-neutral-600 hover:text-primary-600 hover:bg-neutral-50"
                )}>
                  <Search size={18} className="mr-1.5 lg:mr-2" />
                  <span>{t('nav.findDoctor')}</span>
                </a>
              </Link>
              <Link href="/about">
                <a className={cn(
                  "px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer flex items-center",
                  location === "/about" 
                    ? "text-primary-600 bg-primary-50" 
                    : "text-neutral-600 hover:text-primary-600 hover:bg-neutral-50"
                )}>
                  <HelpCircle size={18} className="mr-1.5 lg:mr-2" />
                  <span>{t('nav.about')}</span>
                </a>
              </Link>
              <a 
                href="#how-it-works" 
                className={cn(
                  "px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer flex items-center",
                  "text-neutral-600 hover:text-primary-600 hover:bg-neutral-50"
                )}
              >
                <span>{t('home.howItWorks.title')}</span>
              </a>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-1.5">
            <LanguageSwitcher />
            
            {isAuthenticated ? (
              <div className="flex items-center ml-2 space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Notifications"
                  className="relative text-neutral-600 hover:text-primary-600 hover:bg-neutral-50 rounded-full"
                >
                  <Bell size={20} />
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary-500 animate-pulse"></span>
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full overflow-hidden border border-neutral-200 p-0">
                      <Avatar className="h-full w-full">
                        <AvatarImage src={user?.profilePicture} alt={user?.firstName} />
                        <AvatarFallback className="bg-primary-50 text-primary-700 font-medium">{getInitials()}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-2.5 border-b">
                      <div className="font-medium">{user?.firstName} {user?.lastName}</div>
                      <div className="text-xs text-neutral-500 mt-0.5">{user?.email}</div>
                    </div>
                    
                    <Link href={user?.userType === 'patient' ? '/dashboard/patient' : '/dashboard/doctor'}>
                      <DropdownMenuItem className="cursor-pointer py-2.5">
                        <Calendar className="mr-2.5 h-4 w-4 text-primary-500" />
                        <span>{t('nav.dashboard')}</span>
                      </DropdownMenuItem>
                    </Link>
                    <Link href="/profile">
                      <DropdownMenuItem className="cursor-pointer py-2.5">
                        <User className="mr-2.5 h-4 w-4 text-primary-500" />
                        <span>{t('nav.profile')}</span>
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer py-2.5 text-red-600 focus:text-red-700">
                      <LogOut className="mr-2.5 h-4 w-4" />
                      <span>{t('nav.logout')}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <>
                <Link href="/register/doctor">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 hover:text-amber-800 font-medium flex items-center gap-1 py-2"
                  >
                    <Stethoscope size={17} />
                    <span>{t('nav.doctors')}</span>
                  </Button>
                </Link>
                
                <Link href="/login">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-primary-600 border-primary-200 hover:border-primary-300 hover:bg-primary-50 font-medium ml-1"
                  >
                    {t('nav.login')}
                  </Button>
                </Link>
                <Link href="/register">
                  <Button 
                    size="sm" 
                    className="bg-primary-600 hover:bg-primary-700 font-medium ml-1"
                  >
                    {t('nav.register')}
                  </Button>
                </Link>
              </>
            )}
          </div>
          
          <div className="flex items-center md:hidden">
            <LanguageSwitcher />
          
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center ml-2 p-2 rounded-full text-neutral-500 hover:text-primary-600 hover:bg-neutral-100 focus:outline-none"
              aria-expanded={mobileMenuOpen}
            >
              <span className="sr-only">{mobileMenuOpen ? 'Close menu' : 'Open menu'}</span>
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={cn(
        "fixed inset-0 bg-white z-50 transform transition-transform duration-300 ease-in-out md:hidden",
        mobileMenuOpen ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="flex justify-between items-center h-16 px-4 border-b">
          <Logo size="sm" useImage={true} linkTo="/" />
          <button 
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 rounded-full text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 focus:outline-none"
          >
            <X size={22} />
          </button>
        </div>
        
        <div className="overflow-y-auto h-full pb-32">
          <div className="px-4 py-6 space-y-1.5">
            <Link href="/" onClick={() => setMobileMenuOpen(false)}>
              <a className={cn(
                "flex items-center justify-between py-3 px-4 rounded-lg",
                location === "/" 
                  ? "bg-primary-50 text-primary-600"
                  : "text-neutral-700 hover:bg-neutral-50"
              )}>
                <div className="flex items-center">
                  <Home size={20} className="mr-3" />
                  <span className="font-medium">{t('nav.home')}</span>
                </div>
                <ChevronRight size={18} className="text-neutral-400" />
              </a>
            </Link>
            
            <Link href="/doctors" onClick={() => setMobileMenuOpen(false)}>
              <a className={cn(
                "flex items-center justify-between py-3 px-4 rounded-lg",
                location.startsWith("/doctors") 
                  ? "bg-primary-50 text-primary-600"
                  : "text-neutral-700 hover:bg-neutral-50"
              )}>
                <div className="flex items-center">
                  <Search size={20} className="mr-3" />
                  <span className="font-medium">{t('nav.findDoctor')}</span>
                </div>
                <ChevronRight size={18} className="text-neutral-400" />
              </a>
            </Link>
            
            <Link href="/about" onClick={() => setMobileMenuOpen(false)}>
              <a className={cn(
                "flex items-center justify-between py-3 px-4 rounded-lg",
                location === "/about" 
                  ? "bg-primary-50 text-primary-600"
                  : "text-neutral-700 hover:bg-neutral-50"
              )}>
                <div className="flex items-center">
                  <HelpCircle size={20} className="mr-3" />
                  <span className="font-medium">{t('nav.about')}</span>
                </div>
                <ChevronRight size={18} className="text-neutral-400" />
              </a>
            </Link>
            
            <a 
              href="#how-it-works" 
              className="flex items-center justify-between py-3 px-4 rounded-lg text-neutral-700 hover:bg-neutral-50"
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="flex items-center">
                <Calendar size={20} className="mr-3" />
                <span className="font-medium">{t('home.howItWorks.title')}</span>
              </div>
              <ChevronRight size={18} className="text-neutral-400" />
            </a>
          </div>
          
          <div className="border-t border-neutral-100 pt-5 pb-3">
            {isAuthenticated ? (
              <div>
                <div className="flex items-center px-6 py-3">
                  <div className="flex-shrink-0">
                    <Avatar>
                      <AvatarImage src={user?.profilePicture} alt={user?.firstName} />
                      <AvatarFallback className="bg-primary-50 text-primary-700">{getInitials()}</AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-neutral-800">{user?.firstName} {user?.lastName}</div>
                    <div className="text-sm text-neutral-500 mt-0.5">{user?.email}</div>
                  </div>
                </div>
                
                <div className="mt-3 px-4 space-y-1.5">
                  <Link href={user?.userType === 'patient' ? '/dashboard/patient' : '/dashboard/doctor'} onClick={() => setMobileMenuOpen(false)}>
                    <a className="flex items-center py-3 px-4 rounded-lg text-neutral-700 hover:bg-neutral-50">
                      <Calendar size={20} className="mr-3 text-primary-500" />
                      <span className="font-medium">{t('nav.dashboard')}</span>
                    </a>
                  </Link>
                  
                  <Link href="/profile" onClick={() => setMobileMenuOpen(false)}>
                    <a className="flex items-center py-3 px-4 rounded-lg text-neutral-700 hover:bg-neutral-50">
                      <User size={20} className="mr-3 text-primary-500" />
                      <span className="font-medium">{t('nav.profile')}</span>
                    </a>
                  </Link>
                  
                  <button 
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left flex items-center py-3 px-4 rounded-lg text-red-600 hover:bg-red-50"
                  >
                    <LogOut size={20} className="mr-3" />
                    <span className="font-medium">{t('nav.logout')}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="px-4 space-y-3">
                <Link href="/register/doctor" className="w-full" onClick={() => setMobileMenuOpen(false)}>
                  <a className="flex items-center py-3 px-4 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100">
                    <Stethoscope size={20} className="mr-3" />
                    <span className="font-medium">{t('nav.doctors')}</span>
                  </a>
                </Link>
                
                <div className="flex items-center gap-3 px-4 pt-2">
                  <Link href="/login" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                    <Button
                      variant="outline"
                      className="w-full text-primary-600 border-primary-200 hover:bg-primary-50"
                    >
                      {t('nav.login')}
                    </Button>
                  </Link>
                  
                  <Link href="/register" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full bg-primary-600 hover:bg-primary-700">
                      {t('nav.register')}
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}