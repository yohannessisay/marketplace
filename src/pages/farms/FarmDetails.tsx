import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import StepOne from './farm-detail/step-one';


const FarmDetailsPage: React.FC = () => {
  useEffect(() => {
    localStorage.setItem('current-state', 'step-one'); // Set page title for reference
  }, []); // Set the page title when the component mounts
  

  // Handle file upload - placeholder function
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('File selected:', e.target.files);
  };

  // Handle form field changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);
    // Add API call here
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
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
      {/* Main Content */}
      <main className="container mx-auto p-6">
        <StepOne></StepOne>
        </main>
    
    </div>
  );
};

export default FarmDetailsPage;