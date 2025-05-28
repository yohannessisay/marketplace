"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import Logo from "@/components/layout/Logo";
import { useAuth } from "@/hooks/useAuth";
import { Menu, X } from "lucide-react";

interface HeaderProps {
  scrolled: boolean;
}

export function Header({ scrolled }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const buttonText = user ? "Dashboard" : "Log In";
  const buttonLink = user
    ? user.userType === "farmer"
      ? "/seller-dashboard"
      : "/market-place"
    : "/login";

  return (
    <header
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300 ease-in-out py-3 sm:py-4 px-4 sm:px-6 lg:px-12",
        scrolled
          ? "bg-background/80 backdrop-blur-md shadow-md"
          : "bg-transparent",
      )}
    >
      <div className="container flex items-center justify-between mx-auto">
        <div className="flex items-center gap-4">
          <Logo />
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-3 lg:gap-4">
          <Button
            variant="outline"
            className="px-3 py-1.5 text-sm lg:px-4 lg:py-2 lg:text-base"
            asChild
          >
            <Link to="/market-place">Go to Marketplace</Link>
          </Button>
          <Button
            className="w-32 lg:w-40 px-3 py-1.5 text-sm lg:px-4 lg:py-2 lg:text-base"
            asChild
          >
            <Link to={buttonLink}>{buttonText}</Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={toggleMenu}
        >
          {isMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </Button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-background/95 backdrop-blur-md py-4 px-4 sm:px-6">
          <div className="flex flex-col gap-3">
            <Button variant="outline" className="w-full py-2 text-base" asChild>
              <Link to="/market-place" onClick={() => setIsMenuOpen(false)}>
                Go to Marketplace
              </Link>
            </Button>
            <Button className="w-full py-2 text-base" asChild>
              <Link to={buttonLink} onClick={() => setIsMenuOpen(false)}>
                {buttonText}
              </Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
