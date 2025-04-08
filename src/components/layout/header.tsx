import { Link } from "react-router-dom";

export default function Header() {
    return (
        <header className="bg-white border-b border-gray-200 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-green-800 text-xl font-bold">Afrovalley</h1>
        </div>
        <div className="flex items-center space-x-4">
          <Link to="/dashboard" className="text-sm text-green-600 flex items-center">
            <span className="mr-1">🏠</span> My dashboard
          </Link>
          <Link to="/marketplace" className="text-sm text-gray-600 flex items-center">
            <span className="mr-1">🛒</span> Marketplace
          </Link>
          <Link to="/chats" className="text-sm text-gray-600 flex items-center">
            <span className="mr-1">💬</span> Chats
          </Link>
          <div className="w-8 h-8 rounded-full bg-green-700 text-white flex items-center justify-center">
            <span>👤</span>
          </div>
        </div>
      </div>
    </header>
    )
    }