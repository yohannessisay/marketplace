import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface CompanyDetails {
  name: string;
  country: string;
  position: string;
  website: string;
  address: string;
}

const CompanyVerification: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [companyDetails, setCompanyDetails] = useState<CompanyDetails>({
    name: '',
    country: 'Ethiopia',
    position: 'CEO',
    website: '',
    address: '125 Bensa Road, Aleta Wondo, Sidama, Ethiopia 30510'
  });
  const [currentStep, setCurrentStep] = useState<number>(1);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...selectedFiles].slice(0, 5));
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      setFiles(prev => [...prev, ...droppedFiles].slice(0, 5));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCompanyDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Files:', files);
    console.log('Company Details:', companyDetails);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/" className="text-green-600 font-bold text-xl">
              Afrovalley
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="text-gray-600 hover:text-gray-900 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              My dashboard
            </Link>
            <Link to="/marketplace" className="text-gray-600 hover:text-gray-900 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              Marketplace
            </Link>
            <Link to="/chats" className="text-gray-600 hover:text-gray-900 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Chats
            </Link>
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white">
              <span className="text-sm">JD</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit}>
          {/* Step 1 */}
          <div className="mb-8">
            <div className="mb-2">
              <span className="text-sm font-medium text-gray-500">Step 1</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Company registration document</h2>
            <p className="text-gray-600 mb-6">Upload a clear farm registration land rights document. Make sure text is readable and high-quality</p>
            
            {/* File upload area */}
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center bg-gray-50"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <div className="mb-4">
                <svg className="w-16 h-16 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <rect x="4" y="4" width="16" height="16" rx="2" strokeWidth="1" />
                  <circle cx="12" cy="12" r="3" />
                  <path d="M16.5 7.5v0.001" strokeLinecap="round" />
                </svg>
              </div>
              <p className="text-sm text-gray-600 mb-1">Drop your files here or <label className="text-green-600 cursor-pointer" htmlFor="fileUpload">browse</label></p>
              <input
                id="fileUpload"
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
              <p className="text-xs text-gray-500">Maximum files allowed: 5</p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="mb-8">
            <div className="mb-2">
              <span className="text-sm font-medium text-gray-500">Step 2</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Company details</h2>
            <p className="text-gray-600 mb-6">Check and fill in details about your company, position and website</p>
            
            {/* Company details form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-1">
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
                  Company name<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="companyName"
                  name="name"
                  value={companyDetails.name}
                  onChange={handleInputChange}
                  placeholder="Company"
                  className="w-full bg-white px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-200"
                  required
                />
              </div>
              
              <div className="col-span-1">
                <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                  Country<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  value={companyDetails.country}
                  onChange={handleInputChange}
                  className="w-full bg-white px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-200"
                  required
                />
              </div>

              <div className="col-span-1">
                <label htmlFor="yourPosition" className="block text-sm font-medium text-gray-700 mb-1">
                  Your position in company<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="yourPosition"
                  name="position"
                  value={companyDetails.position}
                  onChange={handleInputChange}
                  className="w-full bg-white px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-200"
                  required
                />
              </div>

              <div className="col-span-1">
                <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                  Website or social media link<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="website"
                  name="website"
                  value={companyDetails.website}
                  onChange={handleInputChange}
                  placeholder="company@email.com"
                  className="w-full bg-white px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-200"
                  required
                />
              </div>

              <div className="col-span-2">
                <label htmlFor="companyAddress" className="block text-sm font-medium text-gray-700 mb-1">
                  Company address
                </label>
                <input
                  type="text"
                  id="companyAddress"
                  name="address"
                  value={companyDetails.address}
                  onChange={handleInputChange}
                  className="w-full bg-white px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-200"
                />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end space-x-4 mt-8">
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Send
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default CompanyVerification;