import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
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
              <span className="text-primary-500 mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide-medical-kit">
                  <path d="M7.2 22H4a2 2 0 0 1-2-2v-4.76a2 2 0 0 1 .51-1.33L12 4l9.49 9.91a2 2 0 0 1 .51 1.33V20a2 2 0 0 1-2 2h-3.2"/>
                  <path d="M12 10v12"/>
                  <path d="M15 13h-6"/>
                </svg>
              </span>
              <Link href="/">
                <span className="font-bold text-2xl text-primary-500 cursor-pointer">MediHome</span>
              </Link>
            </div>
            <div className="hidden sm:ml-10 sm:flex space-x-8">
              <Link href="/">
                <span className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium cursor-pointer ${
                  location === "/" 
                    ? "border-primary-500 text-primary-500" 
                    : "border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700"
                }`}>
                  Inicio
                </span>
              </Link>
              <Link href="/doctors">
                <span className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium cursor-pointer ${
                  location.startsWith("/doctors") 
                    ? "border-primary-500 text-primary-500" 
                    : "border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700"
                }`}>
                  Doctores
                </span>
              </Link>
              <a href="#how-it-works" className="border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Cómo funciona
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
                        <span>Dashboard</span>
                      </DropdownMenuItem>
                    </Link>
                    <Link href="/profile">
                      <DropdownMenuItem className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        <span>Mi perfil</span>
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Cerrar sesión</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <>
                <Link href="/login">
                  <Button
                    variant="outline"
                    className="text-primary-500 border-primary-500 hover:bg-primary-50 mr-3"
                  >
                    Iniciar sesión
                  </Button>
                </Link>
                <Link href="/register">
                  <Button>
                    Registrarse
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
              Inicio
            </span>
          </Link>
          <Link href="/doctors">
            <span className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium cursor-pointer ${
              location.startsWith("/doctors") 
                ? "bg-primary-50 border-primary-500 text-primary-500" 
                : "border-transparent text-neutral-500 hover:bg-neutral-50 hover:border-neutral-300 hover:text-neutral-700"
            }`}>
              Doctores
            </span>
          </Link>
          <a href="#how-it-works" className="border-transparent text-neutral-500 hover:bg-neutral-50 hover:border-neutral-300 hover:text-neutral-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
            Cómo funciona
          </a>
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
                    Dashboard
                  </span>
                </Link>
                <Link href="/profile">
                  <span className="block px-4 py-2 text-base font-medium text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 cursor-pointer">
                    Mi perfil
                  </span>
                </Link>
                <button 
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-base font-medium text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100"
                >
                  Cerrar sesión
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center px-4">
              <Link href="/login">
                <Button
                  variant="outline"
                  className="text-primary-500 border-primary-500 hover:bg-primary-50 mb-2 w-full"
                >
                  Iniciar sesión
                </Button>
              </Link>
              <Link href="/register">
                <Button className="w-full">
                  Registrarse
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}