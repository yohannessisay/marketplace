import { getFromLocalStorage } from "@/lib/utils";
import {
  Home,
  List,
  Receipt,
  ShoppingBagIcon,
  LogOut,
  User,
  ListOrderedIcon,
  LucideShoppingBag,
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
import { Separator } from "../ui/separator";

export default function Header() {
  const user: any = getFromLocalStorage("userProfile", {});
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;

  const linkClasses = (to: string) =>
    clsx(
      "text-sm flex items-center cursor-pointer",
      path.startsWith(to) ? "text-green-700 font-semibold" : "text-gray-600"
    );

  const handleLogout = () => {
    localStorage.clear();
    Cookies.remove("accessToken");
    Cookies.remove("refreshToken");
    navigate("/login");
  };

  return (
    <header className="bg-white border-b border-gray-200 p-4 rounded-md shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-green-800 text-xl font-bold">AfroValley</h1>
        </div>

        <div className="flex items-center space-x-4">
          {user.userType === "seller" && (
            <>
              <Link
                to="/seller-dashboard"
                className={linkClasses("/seller-dashboard")}
              >
                <Home className="mr-1" /> My dashboard
              </Link>
              <Link to="/orders" className={linkClasses("/orders")}>
                <Receipt className="mr-1" />Orders
              </Link>
            </>
          )}
          {user.onboardingStage === "completed" ? (
            <>
              {" "}
              <Link to="/market-place" className={linkClasses("/market-place")}>
                <ShoppingBagIcon className="mr-1" /> Marketplace
              </Link>
              <Link to="/my-orders" className={linkClasses("/my-orders")}>
                <Receipt className="mr-1" /> My Orders
              </Link>
            </>
          ) : (
            <></>
          )}

          {user.userType === "agent" && (
            <Link
              to="/agent/farmer-management"
              className={linkClasses("/agent/farmer-management")}
            >
              <List className="mr-1" /> Farmer Management
            </Link>
          )}

          <Link
            to="/market-place"
            className={linkClasses("/coffee-listing-seller")}
          >
            <LucideShoppingBag className="mr-1" /> Marketplace
          </Link>

          {user.userType === "buyer" && (
            <Link
              to="/my-orders"
              className={linkClasses("/coffee-listing-seller")}
            >
              <ListOrderedIcon className="mr-1" /> My Orders
            </Link>
          )}

          {/* User Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full border-2 border-primary/40"
              >
                <User className="h-5 w-5 text-slate-700 border rounded-full" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="p-4">
              <span className="flex gap-4">
                {user.firstName} {user.lastName}
              </span>
              <Separator></Separator>

              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
