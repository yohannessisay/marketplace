import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../../components/layout/Logo';

const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Logo />
          
          <div className="flex items-center">
            <nav className="hidden md:flex items-center space-x-6 mr-6">
              <Link to="/dashboard" className="text-sm font-medium text-primary">
                My dashboard
              </Link>
              <Link to="/marketplace" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                Marketplace
              </Link>
              <Link to="/chats" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                Chats
              </Link>
            </nav>
            
            <div className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden">
              <img src="/assets/images/avatar-placeholder.png" alt="Profile" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">👋 Hello, Husen Abadega</h1>
          <p className="text-sm text-gray-600">Congratulations with registration!</p>
        </div>
        
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Let's start to sell your crops</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className={`p-4 border border-gray-200 rounded-lg flex flex-col items-center bg-primary/5`}>
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <h3 className="text-sm font-medium mb-1">Step 1</h3>
              <p className="text-sm text-center text-gray-600 mb-2">Add Farms to your profile</p>
              <Link to="/farm-profile" className="text-xs text-primary font-medium hover:underline">
                Add farms
              </Link>
            </div>
            
            <div className={`p-4 border border-gray-200 rounded-lg flex flex-col items-center`}>
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="text-sm font-medium mb-1">Step 2</h3>
              <p className="text-sm text-center text-gray-600 mb-2">Add your coffee crops to sell</p>
              <Link to="/coffee-crops" className="text-xs text-primary font-medium hover:underline">
                Add crops
              </Link>
            </div>
            
            <div className={`p-4 border border-gray-200 rounded-lg flex flex-col items-center`}>
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className="text-sm font-medium mb-1">Step 3</h3>
              <p className="text-sm text-center text-gray-600 mb-2">Provide your bank information</p>
              <Link to="/bank-information" className="text-xs text-primary font-medium hover:underline">
                Add bank details
              </Link>
            </div>
            
            <div className={`p-4 border border-gray-200 rounded-lg flex flex-col items-center`}>
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-sm font-medium mb-1">Step 4</h3>
              <p className="text-sm text-center text-gray-600 mb-2">Upload your beautiful avatar</p>
              <Link to="/profile-photo" className="text-xs text-primary font-medium hover:underline">
                Add photo
              </Link>
            </div>
          </div>
        </div>
        
        {/* Your crops section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Your crops</h2>
          <p className="text-sm text-gray-600 mb-4">You can add more farms now or later</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-6 rounded-lg flex items-center justify-center border border-dashed border-gray-300">
              <Link to="/coffee-crops" className="flex flex-col items-center text-gray-500 hover:text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className="text-sm">Add new crop</span>
              </Link>
            </div>
            
            {/* This would be populated with actual crops once they're added */}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;