
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// Icons for the step indicators and buttons
const CheckIcon = () => (
  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
);

const CircleNumberIcon = ({ number }: { number: number }) => (
  <div className="flex items-center justify-center w-6 h-6 bg-teal-500 text-white rounded-full text-sm font-semibold">
    {number}
  </div>
);

const AddPhotoIcon = () => (
  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
  </svg>
);

const ProfilePhotoPage = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (file) {
      setSelectedFile(file);
      const fileUrl = URL.createObjectURL(file);
      setPreviewUrl(fileUrl);
    }
  };

  const handleAddPhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleSkip = () => {
    // Navigate to the next page when skipping
    navigate('/dashboard');
  };

  const handleSaveAndContinue = () => {
    // Here you would upload the file to your server
    // For now, we'll just simulate navigation to the next page
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-white text-gray-800">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm px-6 py-4">
        <div className="flex items-center">
          <div className="text-teal-600 text-2xl font-bold">Afrovalley</div>
          <div className="ml-auto flex space-x-4">
            <button className="text-gray-600 bg-white hover:text-teal-600">My dashboard</button>
            <button className="text-gray-600 bg-white hover:text-teal-600">Marketplace</button>
            <button className="text-gray-600 bg-white hover:text-teal-600">Chats</button>
          </div>
        </div>
      </nav>

      {/* Progress Steps */}
      <div className="max-w-4xl mx-auto mt-8 px-4">
        <div className="grid grid-cols-4 gap-2">
          <div className="flex flex-col items-center">
            <div className="w-full flex items-center">
              <div className="flex items-center justify-center w-8 h-8 bg-teal-500 text-white rounded-full">
                <CheckIcon />
              </div>
              <div className="flex-1 h-1 bg-teal-500"></div>
            </div>
            <span className="text-sm mt-2">Provide your Farm information</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-full flex items-center">
              <div className="flex-1 h-1 bg-teal-500"></div>
              <div className="flex items-center justify-center w-8 h-8 bg-teal-500 text-white rounded-full">
                <CheckIcon />
              </div>
              <div className="flex-1 h-1 bg-teal-500"></div>
            </div>
            <span className="text-sm mt-2">Add your coffee crops to sell</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-full flex items-center">
              <div className="flex-1 h-1 bg-teal-500"></div>
              <div className="flex items-center justify-center w-8 h-8 bg-teal-500 text-white rounded-full">
                <CheckIcon />
              </div>
              <div className="flex-1 h-1 bg-teal-500"></div>
            </div>
            <span className="text-sm mt-2">Provide your bank information</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-full flex items-center">
              <div className="flex-1 h-1 bg-teal-500"></div>
              <div className="flex items-center justify-center w-8 h-8 bg-teal-500 text-white rounded-full">
                <CircleNumberIcon number={4} />
              </div>
            </div>
            <span className="text-sm mt-2">Upload your beautiful avatar</span>
          </div>
        </div>
      </div>

      {/* Profile Photo Upload Section */}
      <div className="max-w-4xl mx-auto mt-16 px-4">
        <div className="flex flex-col items-center">
          {/* Profile Placeholder */}
          <div 
            className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden"
            style={previewUrl ? { backgroundImage: `url(${previewUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
          >
            {!previewUrl && (
              <svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            )}
          </div>

          {/* Add Photo Button */}
          <button 
            onClick={handleAddPhotoClick}
            className="mt-4 flex items-center text-gray-600 bg-white hover:text-teal-600"
          >
            <AddPhotoIcon />
            <span>Add photo</span>
          </button>
          <input 
            type="file" 
            ref={fileInputRef}
            className="hidden" 
            accept="image/*"
            onChange={handleFileSelect}
          />
        </div>

        {/* Instructions */}
        <div className="mt-12 max-w-lg mx-auto text-center">
          <h2 className="text-2xl font-semibold text-gray-800">Add a profile photo</h2>
          <p className="mt-2 text-gray-600">
            Upload a clear and high-quality photo of yourself to complete your profile. This helps verify your identity and makes interactions more personal. Make sure the image clearly shows your face.
          </p>
        </div>

        {/* Bottom Buttons */}
        <div className="mt-16 flex justify-end space-x-4">
          <button 
            onClick={handleSkip}
            className="px-6 py-2 border bg-white border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Skip
          </button>
          <button 
            onClick={handleSaveAndContinue}
            className="px-6 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-200"
          >
            Save and continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePhotoPage;