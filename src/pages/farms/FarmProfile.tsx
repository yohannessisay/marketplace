import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Header component for the farm profile page
const Header: React.FC = () => {
  return (
    <header className="flex items-center justify-between p-4 border-b border-gray-200">
      <div className="text-xl font-semibold text-green-700">Afrovalley</div>
      <div className="flex items-center space-x-4">
        <button className="flex items-center text-sm font-medium text-green-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
          </svg>
          My dashboard
        </button>
        <button className="flex items-center text-sm font-medium">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
          </svg>
          Marketplace
        </button>
        <button className="flex items-center text-sm font-medium">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
          </svg>
          Chats
        </button>
        <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white">
          <span>JD</span>
        </div>
      </div>
    </header>
  );
};

// Progress steps component
const ProgressSteps: React.FC = () => {
  return (
    <div className="grid grid-cols-4 gap-4 my-6 px-8">
      <div className="flex flex-col items-center">
        <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center mb-2">
          1
        </div>
        <p className="text-sm font-medium">Add Farms to your profile</p>
      </div>
      <div className="flex flex-col items-center">
        <div className="w-8 h-8 rounded-full border-2 border-gray-300 text-gray-500 flex items-center justify-center mb-2">
          2
        </div>
        <p className="text-sm font-medium text-gray-500">Add your coffee crops to sell</p>
      </div>
      <div className="flex flex-col items-center">
        <div className="w-8 h-8 rounded-full border-2 border-gray-300 text-gray-500 flex items-center justify-center mb-2">
          3
        </div>
        <p className="text-sm font-medium text-gray-500">Provide your bank information</p>
      </div>
      <div className="flex flex-col items-center">
        <div className="w-8 h-8 rounded-full border-2 border-gray-300 text-gray-500 flex items-center justify-center mb-2">
          4
        </div>
        <p className="text-sm font-medium text-gray-500">Upload your beautiful avatar</p>
      </div>
    </div>
  );
};

// File upload component
interface FileUploadProps {
  title: string;
  maxFiles: number;
}

const FileUpload: React.FC<FileUploadProps> = ({ title, maxFiles }) => {
  const [, setFiles] = useState<File[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles].slice(0, maxFiles));
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      const newFiles = Array.from(e.dataTransfer.files);
      setFiles(prev => [...prev, ...newFiles].slice(0, maxFiles));
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div className="flex-1">
      <h3 className="font-medium mb-4">{title}</h3>
      <div 
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <div className="w-12 h-12 mb-2 text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-sm mb-1">Drop your files here or <label className="text-green-600 cursor-pointer hover:underline">browse</label></p>
          <input 
            type="file" 
            className="hidden" 
            onChange={handleFileChange} 
            multiple={maxFiles > 1}
          />
          <p className="text-xs text-gray-500">Maximum files allowed: {maxFiles}</p>
        </div>
      </div>
    </div>
  );
};

// Farm profile component
const FarmProfile: React.FC = () => {
  const navigate = useNavigate();

  const handleContinue = () => {
    // Navigate to the next step
    navigate('/add-crops');
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-6xl mx-auto">
        <ProgressSteps />
        
        <div className="px-8">
          <div className="border-t border-gray-200 pt-6">
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-800">Step 1</h2>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Upload farm government documents</h1>
              <p className="text-gray-600">Upload a clear farm registration land rights document. Make sure text is readable and high-quality</p>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-8">
              <FileUpload title="Government registration document" maxFiles={5} />
              <FileUpload title="Land rights documents" maxFiles={5} />
            </div>
          </div>

          <div className="border-t border-gray-200 py-6 mb-8">
            <h2 className="text-xl font-medium text-gray-800 mb-2">Check the farm information</h2>
            <p className="text-gray-600">Check and fill in details about your farm's location, size, climate, and crops</p>
            
            {/* Form fields for farm information would go here */}
            {/* This is a placeholder for the form that would be implemented based on requirements */}
            <div className="mt-4">
              {/* Farm information form would be added here */}
            </div>
          </div>

          <div className="flex justify-end mb-8">
            <button 
              onClick={handleContinue}
              className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors"
            >
              Save and continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmProfile;