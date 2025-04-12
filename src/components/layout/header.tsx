import { getFromLocalStorage } from "@/lib/utils";
import {
  BeanIcon,
  Home,
  List,
  MessageCircle,
  Receipt,
  ShoppingBagIcon,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import clsx from "clsx";

export default function Header() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user: any = getFromLocalStorage("userProfile", {});
  const location = useLocation();
  const path = location.pathname;

  const linkClasses = (to: string) =>
    clsx(
      "text-sm flex items-center cursor-pointer",
      path.startsWith(to) ? "text-green-700 font-semibold" : "text-gray-600"
    );

  return (
    <header className="bg-white border-b border-gray-200 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-green-800 text-xl font-bold">Afrovalley</h1>
        </div>
        <div className="flex items-center space-x-4">
          {user.userType !== "agent" && (
            <Link to="/seller-dashboard" className={linkClasses("/seller-dashboard")}>
              <Home className="mr-1" /> My dashboard
            </Link>
          )}
          <Link to="/market-place" className={linkClasses("/market-place")}>
            <ShoppingBagIcon className="mr-1" /> Marketplace
          </Link>
          <Link to="/my-orders" className={linkClasses("/my-orders")}>
            <Receipt className="mr-1" /> My Orders
          </Link>
          {user.userType === "agent" && (
            <Link to="/agent/farmer-management" className={linkClasses("/agent/farmer-management")}>
              <List className="mr-1" /> Farmer Management
            </Link>
          )}
          {user.userType === "seller" && (
            <Link to="/coffee-listing-seller" className={linkClasses("/coffee-listing-seller")}>
              <BeanIcon className="mr-1" /> Coffee Listing
            </Link>
          )}
          <Link to="/chats" className={linkClasses("/chats")}>
            <MessageCircle className="mr-1" /> Chats
          </Link>
        </div>
      </div>
    </header>
  );
}
