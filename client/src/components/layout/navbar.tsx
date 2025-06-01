import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import Logo from "@/components/common/Logo";
import { 
  Menu, 
  X, 
  User, 
  LogOut, 
  Settings,
  Calendar,
  Search
} from "lucide-react";

export default function Navbar() {
  const [location] = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-lg border-b border-neutral-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/">
              <div className="flex items-center space-x-2 cursor-pointer">
                <Logo className="h-8 w-8" />
                <span className="text-xl font-bold text-neutral-900">OnCall Clinic</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/doctors">
              <Button variant="ghost" className="flex items-center space-x-1">
                <Search className="h-4 w-4" />
                <span>Find Doctors</span>
              </Button>
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-neutral-600">
                  Hello, {user?.name || 'User'}
                </span>

                {user?.userType === 'doctor' ? (
                  <Link href="/dashboard/doctor">
                    <Button variant="ghost" size="sm">
                      <Calendar className="h-4 w-4 mr-1" />
                      Dashboard
                    </Button>
                  </Link>
                ) : (
                  <Link href="/dashboard/patient">
                    <Button variant="ghost" size="sm">
                      <User className="h-4 w-4 mr-1" />
                      Dashboard
                    </Button>
                  </Link>
                )}

                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-1" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link href="/register">
                  <Button>Sign Up</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              <Link href="/doctors">
                <Button variant="ghost" className="w-full justify-start" onClick={() => setIsMenuOpen(false)}>
                  <Search className="h-4 w-4 mr-2" />
                  Find Doctors
                </Button>
              </Link>

              {isAuthenticated ? (
                <>
                  {user?.userType === 'doctor' ? (
                    <Link href="/dashboard/doctor">
                      <Button variant="ghost" className="w-full justify-start" onClick={() => setIsMenuOpen(false)}>
                        <Calendar className="h-4 w-4 mr-2" />
                        Doctor Dashboard
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/dashboard/patient">
                      <Button variant="ghost" className="w-full justify-start" onClick={() => setIsMenuOpen(false)}>
                        <User className="h-4 w-4 mr-2" />
                        My Dashboard
                      </Button>
                    </Link>
                  )}

                  <Button 
                    variant="ghost" 
                    className="w-full justify-start" 
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" className="w-full justify-start" onClick={() => setIsMenuOpen(false)}>
                      Login
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button className="w-full justify-start" onClick={() => setIsMenuOpen(false)}>
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}