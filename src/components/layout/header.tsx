"use client";

import { useState, useEffect } from "react";
import {
  Home,
  Receipt,
  ShoppingBagIcon,
  LogOut,
  User,
  LucideShoppingBag,
  Send,
  User2,
  Menu,
  Settings,
  UserCheck,
  LogIn,
  List,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import clsx from "clsx";
import Cookies from "js-cookie";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Logo from "./Logo";
import { useAuth } from "@/hooks/useAuth";
import { useMobile } from "@/hooks/useMobile";
import { chatService } from "@/services/chatService";
import { getFromLocalStorage } from "@/lib/utils";
import {
  ACCESS_TOKEN_KEY,
  FARMER_PROFILE_KEY,
  REFRESH_TOKEN_KEY,
} from "@/types/constants";

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems = {
  agentOnly: [
    { to: "/agent/farmer-management", label: "Farmer Management", icon: List },
    { to: "/chats", label: "Chats", icon: Send },
  ] as NavItem[],
  seller: [
    {
      to: "/seller-dashboard",
      label: "My Dashboard",
      icon: Home,
    },
    { to: "/market-place", label: "Marketplace", icon: LucideShoppingBag },
    { to: "/orders", label: "Orders", icon: Receipt },
    { to: "/chats", label: "Chats", icon: Send },
  ] as NavItem[],
  buyerOnly: [
    { to: "/my-orders", label: "My Orders", icon: ShoppingBagIcon },
    { to: "/market-place", label: "Marketplace", icon: LucideShoppingBag },
    { to: "/chats", label: "Chats", icon: Send },
  ] as NavItem[],
};

export default function Header() {
  const { user } = useAuth();
  const farmerProfile: any = getFromLocalStorage(FARMER_PROFILE_KEY, {});
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;
  const isMobile = useMobile();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    if (isMenuOpen && isMobile) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen, isMobile]);

  const linkClasses = (to: string) =>
    clsx(
      "text-sm flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors",
      path.startsWith(to)
        ? "text-green-700 font-semibold bg-gray-100"
        : "text-gray-600",
      isMobile && "text-base",
    );

  const handleLogout = () => {
    const userType = user?.userType;
    localStorage.clear();
    Cookies.remove(ACCESS_TOKEN_KEY);
    Cookies.remove(REFRESH_TOKEN_KEY);
    navigate(userType === "agent" ? "/agent/login" : "/login");
    setIsMenuOpen(false);
    if (chatService().isConnected()) {
      chatService().disconnect();
    }
  };

  const loginUrl = `/login?redirectTo=${encodeURIComponent(location.pathname)}`;

  const isAgentWithFarmerProfile =
    user?.userType === "agent" && Object.keys(farmerProfile).length > 0;
  const getNavItems = () => {
    if (!user) {
      return [
        { to: "/market-place", label: "Marketplace", icon: LucideShoppingBag },
      ] as NavItem[];
    }
    if (user.userType === "agent") {
      if (isAgentWithFarmerProfile) {
        const combinedNavItems = [
          ...navItems.seller.map((item) => ({
            ...item,
            label:
              item.to === "/seller-dashboard" &&
              farmerProfile?.onboarding_stage !== "completed"
                ? "Onboarding"
                : item.label,
          })),
          ...navItems.agentOnly.filter(
            (agentItem) =>
              !navItems.seller.some(
                (sellerItem) => sellerItem.to === agentItem.to,
              ),
          ),
        ];
        return combinedNavItems;
      }
      return navItems.agentOnly;
    }
    if (user.userType === "buyer") {
      return navItems.buyerOnly;
    }
    if (user.userType === "seller") {
      const sellerItems = navItems.seller
        .filter(
          (item) =>
            item.to !== "/orders" || user.onboarding_stage === "completed",
        )
        .map((item) => ({
          ...item,
          label:
            item.to === "/seller-dashboard" &&
            user.onboarding_stage !== "completed"
              ? "Onboarding"
              : item.label,
        }));
      return sellerItems;
    }
    return [] as NavItem[];
  };

  const currentNavItems = getNavItems();

  return (
    <header
      className={clsx(
        "bg-white border-b border-gray-200 shadow-md fixed top-0 left-0 right-0 z-50 transition-transform duration-300",
        isVisible ? "translate-y-0" : "-translate-y-full",
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-5 flex justify-between items-center">
        <Logo />

        {!isMobile && (
          <nav className="flex items-center space-x-2">
            {user ? (
              <>
                {currentNavItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={linkClasses(item.to)}
                  >
                    <item.icon className="h-4 w-4 text-green-400" />
                    {item.label}
                  </Link>
                ))}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full ml-2 border-2 border-primary/40 hover:bg-gray-100"
                    >
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt="AU"
                          className="rounded-full h-8 w-8 object-cover"
                        />
                      ) : (
                        <User className="h-5 w-5 text-slate-700" />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="p-4 w-64">
                    <div className="flex flex-col gap-1 mb-3">
                      <div className="flex items-center gap-2">
                        {user.avatar_url ? (
                          <img
                            src={user.avatar_url}
                            alt="AU"
                            className="rounded-full h-5 w-5 object-cover"
                          />
                        ) : (
                          <User2 className="text-green-400 h-5 w-5" />
                        )}
                        <span className="font-medium">
                          {user.first_name} {user.last_name}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 pl-7">
                        {user.email}
                      </span>
                      <Separator className="my-2" />
                      {isAgentWithFarmerProfile && (
                        <div className="flex flex-col">
                          <div className="pl-7 mt-1 flex gap-2">
                            <span className="text-sm text-green-600 font-extrabold">
                              Farmer:
                            </span>
                            <div className="text-sm font-medium text-gray-500">
                              {farmerProfile.first_name}{" "}
                              {farmerProfile.last_name}
                            </div>
                          </div>
                          <div className="pl-7 mt-1 text-sm font-medium text-gray-500">
                            <span className="text-sm text-green-600 font-extrabold mr-3">
                              Email:
                            </span>
                            {farmerProfile.email}
                          </div>
                        </div>
                      )}
                    </div>
                    <Separator className="my-2" />
                    {user.userType === "agent" && !isAgentWithFarmerProfile && (
                      <Link
                        to="/agent/profile"
                        className={linkClasses("/agent/profile")}
                      >
                        <UserCheck className="h-4 w-4 text-green-400" />
                        Profile
                      </Link>
                    )}
                    {user.userType === "buyer" && (
                      <Link to="/settings" className={linkClasses("/settings")}>
                        <Settings className="h-4 w-4 text-green-400" />
                        Settings
                      </Link>
                    )}
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="cursor-pointer flex items-center gap-2"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex gap-2">
                <Button asChild variant="outline">
                  <Link to={loginUrl}>Login</Link>
                </Button>
                <Button asChild>
                  <Link to="/registration">Sign Up</Link>
                </Button>
              </div>
            )}
          </nav>
        )}

        {isMobile && (
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={isMenuOpen}
                className="hover:bg-gray-100"
              >
                <Menu className="h-6 w-6 text-slate-700" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="bg-white w-[300px] sm:w-[400px] p-6 flex flex-col"
            >
              <SheetHeader className="mb-6">
                <SheetTitle className="flex items-center gap-2">
                  <Logo />
                </SheetTitle>
                {user && (
                  <div className="flex flex-col gap-1 mt-4">
                    <div className="flex items-center gap-2">
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt="AU"
                          className="rounded-full h-5 w-5 object-cover"
                        />
                      ) : (
                        <User2 className="text-green-400 h-5 w-5" />
                      )}
                      <span className="font-medium text-base">
                        {user.first_name} {user.last_name}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 pl-7">
                      {user.email}
                    </span>
                    <Separator className="flex-1" />
                    {isAgentWithFarmerProfile && (
                      <div className="flex flex-col mt-2 w-full">
                        <div className="flex items-center gap-2 w-full">
                          <div className="flex flex-col pl-7">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-green-600 font-extrabold">
                                Farmer:
                              </span>
                              <span className="text-sm font-medium text-gray-500">
                                {farmerProfile.first_name}{" "}
                                {farmerProfile.last_name}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-sm text-green-600 font-extrabold">
                                Email:
                              </span>
                              <span className="text-sm font-medium text-gray-500">
                                {farmerProfile.email}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <Separator className="my-2" />
              </SheetHeader>

              <nav className="flex flex-col space-y-3 flex-grow">
                {user ? (
                  <>
                    {currentNavItems.map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        className={linkClasses(item.to)}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <item.icon className="h-4 w-4 text-green-400" />
                        {item.label}
                      </Link>
                    ))}

                    {user.userType === "agent" && !isAgentWithFarmerProfile && (
                      <Link
                        to="/agent/profile"
                        className={linkClasses("/agent/profile")}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <UserCheck className="h-4 w-4 text-green-400" />
                        Profile
                      </Link>
                    )}
                    {user.userType === "buyer" && (
                      <Link
                        to="/settings"
                        className={linkClasses("/settings")}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Settings className="h-4 w-4 text-green-400" />
                        Settings
                      </Link>
                    )}

                    <Separator className="my-3" />

                    <button
                      onClick={handleLogout}
                      className="flex items-center cursor-pointer gap-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors text-gray-600 text-base"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/market-place"
                      className={linkClasses("/market-place")}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <LucideShoppingBag className="h-4 w-4 text-green-400" />
                      MarketplaceA
                    </Link>
                    <Link
                      to={loginUrl}
                      className={linkClasses("/login")}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <LogIn className="h-4 w-4 text-green-400" />
                      Login
                    </Link>
                    <Link
                      to="/registration"
                      className={linkClasses("/registration")}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User2 className="h-4 w-4 text-green-400" />
                      Sign Up
                    </Link>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        )}
      </div>
    </header>
  );
}
