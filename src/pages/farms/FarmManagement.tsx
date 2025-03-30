import React from 'react';
import { Link } from 'react-router-dom';

// Define TypeScript interfaces
interface Farm {
  id: string;
  name: string;
  location: string;
  status?: string;
  verificationMessage?: string;
  size?: number;
  capacity?: number;
}

const FarmManagement: React.FC = () => {
  // Sample data for farms
  const farms: Farm[] = [
    {
      id: '1',
      name: 'Adama',
      location: 'Sidama',
      status: 'verification',
      verificationMessage: 'Your farm is on verification. Usually it takes few hours. Please check your email for updates'
    },
    {
      id: '2',
      name: 'City',
      location: 'Oromia',
      size: 25,
      capacity: 25000
    }
  ];

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <header className="flex justify-between items-center mb-8">
          <div className="text-2xl font-bold text-green-800">Afrovalley</div>
          <div className="flex items-center space-x-4">
            <Link to="/dashboard" className="text-green-600 hover:text-green-800 flex items-center">
              <span className="mr-1">My dashboard</span>
            </Link>
            <Link to="/marketplace" className="text-gray-600 hover:text-gray-800 flex items-center">
              <span className="mr-1">Marketplace</span>
            </Link>
            <Link to="/chats" className="text-gray-600 hover:text-gray-800 flex items-center">
              <span className="mr-1">Chats</span>
            </Link>
            <div className="w-8 h-8 rounded-full bg-green-700 overflow-hidden">
              {/* Profile avatar placeholder */}
            </div>
          </div>
        </header>

        <h1 className="text-2xl font-normal text-gray-600 mb-6">Farms list</h1>



        <div className="mb-6">
          <h2 className="text-lg font-medium mb-1">Your farms</h2>
          <p className="text-sm text-gray-500">You can add more farms now or later</p>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Add New Farm Card */}
          <div className="bg-white rounded-md shadow-sm p-6 flex items-center justify-center border border-dashed border-gray-300 hover:border-gray-400 cursor-pointer">
            <div className="text-center">
              <div className="w-6 h-6 rounded-full border border-gray-400 mx-auto mb-2 flex items-center justify-center">
                <span className="text-gray-400">+</span>
              </div>
              <p className="text-sm text-gray-600">Add new farm</p>
            </div>
          </div>

          {/* Existing Farms */}
          {farms.map(farm => (
            <div key={farm.id} className="bg-white rounded-md shadow-sm p-6">
              <div className="flex items-start mb-4">
                <div className="mr-4">
                  <div className="w-10 h-10 bg-green-100 rounded-md flex items-center justify-center">
                    <span className="text-green-700">🏡</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium bg-white text-black" >{farm.name}, {farm.location}</h3>
                  {farm.status === 'verification' ? (
                    <p className="text-sm text-gray-600 mt-1">{farm.verificationMessage}</p>
                  ) : (
                    <>
                      <p className="text-sm text-gray-600 mt-1">Farm size: {farm.size} hectares</p>
                      <p className="text-sm text-gray-600">Capacity: {farm.capacity?.toLocaleString()} kg</p>
                    </>
                  )}
                </div>
              </div>
              <button className="w-full py-2 px-4 border bg-white border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50">
                Edit
              </button>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default FarmManagement;