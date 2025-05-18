"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import Logo from "@/components/layout/Logo";
import { useAuth } from "@/hooks/useAuth";

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
        "fixed top-0 w-full z-50 transition-all duration-300 ease-in-out py-4 px-12",
        scrolled
          ? "bg-background/80 backdrop-blur-md shadow-md"
          : "bg-transparent",
      )}
    >
      <div className="container flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Logo />
        </div>

        {/* Desktop Navigation */}
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink
                className="px-4 py-2 text-sm font-medium hover:text-amber-700 transition-colors"
                href="#marketplace"
              >
                Marketplace
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger className="text-sm font-medium">
                About
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid gap-3 p-4 w-[200px]">
                  <li>
                    <NavigationMenuLink
                      className="block p-2 hover:bg-muted rounded-md text-sm"
                      href="#about"
                    >
                      Our Story
                    </NavigationMenuLink>
                  </li>
                  <li>
                    <NavigationMenuLink
                      className="block p-2 hover:bg-muted rounded-md text-sm"
                      href="#eudr"
                    >
                      EUDR Policy
                    </NavigationMenuLink>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink
                className="px-4 py-2 text-sm font-medium hover:text-amber-700 transition-colors"
                href="#testimonials"
              >
                Testimonials
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink
                className="px-4 py-2 text-sm font-medium hover:text-amber-700 transition-colors"
                href="#contact"
              >
                Contact
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        {/* Desktop Button */}
        <div className="hidden md:flex items-center gap-4">
          <Button
            variant="outline"
            className="border-amber-700 text-amber-700 hover:bg-amber-700 hover:text-white"
            asChild
          >
            <Link to="/market-place">Go to Marketplace</Link>
          </Button>
          <Button className="bg-amber-700 hover:text-amber-700 w-40">
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

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-background/95 backdrop-blur-md shadow-md p-4 md:hidden">
            <nav className="flex flex-col space-y-4">
              <a
                href="#marketplace"
                className="px-4 py-2 text-sm font-medium hover:text-amber-700"
                onClick={toggleMenu}
              >
                Marketplace
              </a>
              <a
                href="#about"
                className="px-4 py-2 text-sm font-medium hover:text-amber-700"
                onClick={toggleMenu}
              >
                Our Story
              </a>
              <a
                href="#eudr"
                className="px-4 py-2 text-sm font-medium hover:text-amber-700"
                onClick={toggleMenu}
              >
                EUDR Policy
              </a>
              <a
                href="#testimonials"
                className="px-4 py-2 text-sm font-medium hover:text-amber-700"
                onClick={toggleMenu}
              >
                Testimonials
              </a>
              <a
                href="#contact"
                className="px-4 py-2 text-sm font-medium hover:text-amber-700"
                onClick={toggleMenu}
              >
                Contact
              </a>
              <div className="flex flex-col space-y-2 pt-2 border-t">
                <Button
                  variant="outline"
                  className="hover:bg-amber-700 text-amber-700 hover:text-white"
                >
                  <Link to="/market-place">Go to Marketplace</Link>
                </Button>
                <Button className="bg-amber-700 hover:text-amber-700">
                  <Link to={buttonLink}>{buttonText}</Link>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
