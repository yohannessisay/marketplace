import { getFromLocalStorage } from "@/lib/utils";
import { Home, List, MessageCircle, Receipt, ShoppingBagIcon } from "lucide-react";
import { Link } from "react-router-dom";

export default function Header() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user: any = getFromLocalStorage("userProfile", {});
  return (
    <header className="bg-white border-b border-gray-200 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-green-800 text-xl font-bold">Afrovalley</h1>
        </div>
        <div className="flex items-center space-x-4">
          {user.userType != "agent" ? (
            <Link
              to="/seller-dashboard"
              className="text-sm text-green-600 flex items-center cursor-pointer"
            >
            <Home></Home> My dashboard
            </Link>
          ) : (
            ""
          )}
          <Link
            to="/market-place"
            className="text-sm text-gray-600 flex items-center cursor-pointer"
          >
           <ShoppingBagIcon></ShoppingBagIcon> Marketplace
          </Link>
          <Link
            to="/my-orders"
            className="text-sm text-gray-600 flex items-center cursor-pointer"
          >
            <Receipt></Receipt> My Orders
          </Link>
          {user.userType === "agent" ? (
            <Link
              to="/agent/farmer-management"
              className="text-sm text-gray-600 flex items-center cursor-pointer"
            >
             <List></List> Farmer Management
            </Link>
          ) : (
            ""
          )}
          <Link to="/chats" className="text-sm text-gray-600 flex items-center cursor-pointer">
          <MessageCircle></MessageCircle>Chats
          </Link>
         
        </div>
      </div>
    </header>
  );
}
