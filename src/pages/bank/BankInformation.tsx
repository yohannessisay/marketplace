
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Icons
const CheckCircleIcon = () => (
  <svg className="w-6 h-6 text-white bg-green-500 rounded-full" viewBox="0 0 24 24" fill="currentColor">
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
  </svg>
);

const CircleNumberIcon = ({ number }: { number: number }) => (
  <div className="flex items-center justify-center w-6 h-6 text-white bg-teal-500 rounded-full">
    {number}
  </div>
);

const BankInformation: React.FC = () => {
  const navigate = useNavigate();
  const [bankDetails, setBankDetails] = useState({
    bank: 'Ethiopian bank',
    iban: 'ET47383959563945005049',
    name: 'Husein Abadega'
  });

  const handleSkip = () => {
    // Navigate to the next step (avatar upload)
    navigate('/upload-avatar');
  };

  const handleSaveAndContinue = () => {
    // Save the data and navigate to the next step
    // Here you would typically make an API call to save the data 
    navigate('/upload-avatar');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header with Logo and Navigation */}
      <header className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-green-700">Afrovalley</h1>
          </div>
          <nav className="flex items-center space-x-6">
            <a href="/dashboard" className="flex items-center text-sm text-gray-700 hover:text-green-600">
              <span className="mr-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </span>
              My dashboard
            </a>
            <a href="/marketplace" className="flex items-center text-sm text-gray-700 hover:text-green-600">
              <span className="mr-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </span>
              Marketplace
            </a>
            <a href="/chats" className="flex items-center text-sm text-gray-700 hover:text-green-600">
              <span className="mr-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </span>
              Chats
            </a>
          </nav>
          <div className="flex items-center">
            <img 
              src="/profile-icon.jpg" 
              alt="Profile" 
              className="w-8 h-8 rounded-full border border-gray-200" 
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "https://via.placeholder.com/32";
              }}
            />
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="container mx-auto px-4 mt-8">
        <div className="flex items-center">
          <div className="flex flex-col items-center">
            <CheckCircleIcon />
            <span className="text-xs mt-1 text-gray-600">Provide your Farm information</span>
          </div>
          <div className="flex-1 h-px bg-gray-300 mx-2"></div>
          <div className="flex flex-col items-center">
            <CheckCircleIcon />
            <span className="text-xs mt-1 text-gray-600">Add your coffee crops to sell</span>
          </div>
          <div className="flex-1 h-px bg-gray-300 mx-2"></div>
          <div className="flex flex-col items-center">
            <CircleNumberIcon number={3} />
            <span className="text-xs mt-1 text-gray-600">Provide your bank information</span>
          </div>
          <div className="flex-1 h-px bg-gray-300 mx-2"></div>
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center w-6 h-6 text-gray-600 border border-gray-300 rounded-full">
              4
            </div>
            <span className="text-xs mt-1 text-gray-600">Upload your beautiful avatar</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 mt-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800">Your bank information for getting payments</h2>
          <p className="text-gray-600 mt-1">We collect data safe and</p>

          <div className="mt-8 grid grid-cols-3 gap-4">
            <div className="mb-4">
              <label htmlFor="bank" className="block text-sm font-medium text-gray-700 mb-1">Bank</label>
              <input
                type="text"
                id="bank"
                value={bankDetails.bank}
                onChange={(e) => setBankDetails({...bankDetails, bank: e.target.value})}
                className="w-full p-3 border border-gray-200 rounded-md bg-gray-100 text-gray-800"
                readOnly
              />
            </div>
            <div className="mb-4">
              <label htmlFor="iban" className="block text-sm font-medium text-gray-700 mb-1">IBAN</label>
              <input
                type="text"
                id="iban"
                value={bankDetails.iban}
                onChange={(e) => setBankDetails({...bankDetails, iban: e.target.value})}
                className="w-full p-3 border border-gray-200 rounded-md bg-gray-100 text-gray-800"
                readOnly
              />
            </div>
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name Surname</label>
              <input
                type="text"
                id="name"
                value={bankDetails.name}
                onChange={(e) => setBankDetails({...bankDetails, name: e.target.value})}
                className="w-full p-3 border border-gray-200 rounded-md bg-gray-100 text-gray-800"
                readOnly
              />
            </div>
          </div>

          <div className="mt-8 flex justify-end space-x-4">
            <button
              onClick={handleSkip}
              className="px-6 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Skip
            </button>
            <button
              onClick={handleSaveAndContinue}
              className="px-6 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600"
            >
              Save and continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BankInformation;