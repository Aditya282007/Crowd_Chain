import { useState } from "react";
import { Menu, X, User, LogOut, Settings, Crown } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth, useLogout } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const [location] = useLocation();
  const logoutMutation = useLogout();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setIsOpen(false);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const isHomePage = location === "/";

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b-3 border-black">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/">
            <div className="text-2xl font-black tracking-tight cursor-pointer">
              <span className="gradient-text" data-testid="logo">CrowdChain</span>
            </div>
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            {/* Show home navigation only on home page */}
            {isHomePage && !isAuthenticated && (
              <>
                <button 
                  onClick={() => scrollToSection('home')} 
                  className="font-semibold hover:text-primary transition-colors"
                  data-testid="nav-home"
                >
                  Home
                </button>
                <button 
                  onClick={() => scrollToSection('about')} 
                  className="font-semibold hover:text-primary transition-colors"
                  data-testid="nav-about"
                >
                  About
                </button>
                <button 
                  onClick={() => scrollToSection('features')} 
                  className="font-semibold hover:text-primary transition-colors"
                  data-testid="nav-features"
                >
                  Features
                </button>
              </>
            )}

            {/* Authenticated navigation */}
            {isAuthenticated && (
              <>
                <Link href="/">
                  <span className="font-semibold hover:text-primary transition-colors cursor-pointer" data-testid="nav-projects">
                    Projects
                  </span>
                </Link>
                <Link href="/dashboard">
                  <span className="font-semibold hover:text-primary transition-colors cursor-pointer" data-testid="nav-dashboard">
                    Dashboard
                  </span>
                </Link>
                {user?.role === "admin" && (
                  <Link href="/admin">
                    <span className="font-semibold hover:text-primary transition-colors cursor-pointer flex items-center gap-1" data-testid="nav-admin">
                      <Crown className="h-4 w-4" />
                      Admin
                    </span>
                  </Link>
                )}
              </>
            )}

            {/* Auth buttons or user menu */}
            <div className="flex items-center space-x-4">
              {!isAuthenticated ? (
                <>
                  <Button 
                    variant="outline"
                    className="border-2 border-black"
                    data-testid="button-login"
                    asChild
                  >
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button 
                    className="brutalist-button bg-accent text-accent-foreground"
                    data-testid="button-signup"
                    asChild
                  >
                    <Link href="/signup">Sign Up</Link>
                  </Button>
                </>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="border-2 border-black" data-testid="button-user-menu">
                      <User className="h-4 w-4 mr-2" />
                      {user?.username}
                      <Badge variant="secondary" className="ml-2">
                        {user?.role}
                      </Badge>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="border-2 border-black">
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="flex items-center w-full">
                        <Settings className="h-4 w-4 mr-2" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    {user?.role === "admin" && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="flex items-center w-full">
                          <Crown className="h-4 w-4 mr-2" />
                          Admin Panel
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={handleLogout}
                      className="text-red-600 cursor-pointer"
                      data-testid="button-logout"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <button 
            className="md:hidden brutalist-button bg-primary text-primary-foreground p-2 rounded-lg"
            onClick={() => setIsOpen(!isOpen)}
            data-testid="button-mobile-menu"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden mt-4 space-y-4 p-4 brutalist-card bg-card rounded-lg">
            {isHomePage && !isAuthenticated && (
              <>
                <button 
                  onClick={() => scrollToSection('home')} 
                  className="block w-full text-left font-semibold hover:text-primary transition-colors"
                  data-testid="mobile-nav-home"
                >
                  Home
                </button>
                <button 
                  onClick={() => scrollToSection('about')} 
                  className="block w-full text-left font-semibold hover:text-primary transition-colors"
                  data-testid="mobile-nav-about"
                >
                  About
                </button>
                <button 
                  onClick={() => scrollToSection('features')} 
                  className="block w-full text-left font-semibold hover:text-primary transition-colors"
                  data-testid="mobile-nav-features"
                >
                  Features
                </button>
              </>
            )}

            {isAuthenticated && (
              <>
                <Link href="/">
                  <span className="block w-full text-left font-semibold hover:text-primary transition-colors cursor-pointer" data-testid="mobile-nav-projects">
                    Projects
                  </span>
                </Link>
                <Link href="/dashboard">
                  <span className="block w-full text-left font-semibold hover:text-primary transition-colors cursor-pointer" data-testid="mobile-nav-dashboard">
                    Dashboard
                  </span>
                </Link>
                {user?.role === "admin" && (
                  <Link href="/admin">
                    <span className="block w-full text-left font-semibold hover:text-primary transition-colors cursor-pointer" data-testid="mobile-nav-admin">
                      Admin Panel
                    </span>
                  </Link>
                )}
              </>
            )}

            <div className="space-y-2">
              {!isAuthenticated ? (
                <>
                  <Link href="/login">
                    <Button 
                      variant="outline"
                      className="border-2 border-black w-full"
                      data-testid="mobile-button-login"
                    >
                      Login
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button 
                      className="brutalist-button bg-accent text-accent-foreground w-full"
                      data-testid="mobile-button-signup"
                    >
                      Sign Up
                    </Button>
                  </Link>
                </>
              ) : (
                <Button 
                  onClick={handleLogout}
                  variant="destructive"
                  className="w-full border-2 border-black"
                  data-testid="mobile-button-logout"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}