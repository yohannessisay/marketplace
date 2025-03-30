import React, { useState } from 'react';

interface ProfileItemProps {
  label: string;
  value: string;
  editable?: boolean;
  onEdit?: () => void;
}

const ProfileItem: React.FC<ProfileItemProps> = ({ label, value, editable = false, onEdit }) => {
  return (
    <div className="border rounded-lg p-4 mb-4">
      <div className="flex justify-between items-center">
        <div>
          <div className="text-gray-600 text-sm">{label}</div>
          <div className="font-medium">{value}</div>
        </div>
        {editable && (
          <button 
            onClick={onEdit} 
            className="bg-transparent text-gray-600 hover:text-gray-800 px-2 py-1 rounded"
          >
            Edit
          </button>
        )}
      </div>
    </div>
  );
};

const UserProfile: React.FC = () => {
  const [profile, setProfile] = useState({
    name: 'John Wick',
    phone: '+66 (081) *** **36',
    email: 'Email****@.com',
    verification: 25, // Percentage of verification progress
  });

  const handleEdit = (field: string) => {
    // Implement edit functionality
    console.log(`Editing ${field}`);
    // In a real app, you would show a modal or form for editing
  };

  const handleLogout = () => {
    // Implement logout functionality
    console.log('Logging out');
  };

  return (
    <div className=" bg-white p-4">
      <h1 className="text-xl font-bold mb-4">Your profile</h1>
      
      {/* Profile Photo */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative">
          <img 
            src="/path/to/profile-image.jpg" 
            alt="Profile" 
            className="w-24 h-24 rounded-full object-cover bg-blue-100"
          />
          <button 
            className="absolute bottom-0 right-0 text-xs border rounded-full px-2 py-1"
            onClick={() => handleEdit('photo')}
          >
            Edit
          </button>
        </div>
        <h2 className="text-lg font-semibold mt-3">{profile.name}</h2>
      </div>

      {/* Verification Status */}
      <div className="border rounded-lg p-4 mb-4">
        <div className="text-gray-600 text-sm mb-2">Your profile is on verification</div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-green-500 h-2.5 rounded-full" 
            style={{ width: `${profile.verification}%` }}
          ></div>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Usually it takes few hours. Please check your email for updates
        </div>
      </div>

      {/* Profile Information */}
      <ProfileItem 
        label="Phone number" 
        value={profile.phone} 
        editable 
        onEdit={() => handleEdit('phone')}
      />
      
      <ProfileItem 
        label="Email address" 
        value={profile.email} 
        editable 
        onEdit={() => handleEdit('email')}
      />
      
      <ProfileItem 
        label="Legal name" 
        value={profile.name} 
        editable 
        onEdit={() => handleEdit('name')}
      />
      
      <ProfileItem 
        label="Password" 
        value="Change password" 
        editable 
        onEdit={() => handleEdit('password')}
      />

      {/* Logout Button */}
      <button 
        onClick={handleLogout}
        className="flex items-center text-gray-600 mt-4 bg-white"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        Log out
      </button>
    </div>
  );
};

export default UserProfile;