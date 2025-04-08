
import React from 'react';
import { Link } from 'react-router-dom';

// Import SVG icons or use the appropriate icon components
// These are placeholders that would need to be replaced with actual icons
const FarmIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6 text-green-600" fill="currentColor">
    <path d="M1 22h2v-2h18v2h2v-2h-2v-8.5c0-1.1-.9-2-2-2h-3V8c0-1.1-.9-2-2-2h-6c-1.1 0-2 .9-2 2v1.5H3c-1.1 0-2 .9-2 2V20H1v2zm18-10.5H5v-2h14v2z" />
  </svg>
);

const CoffeeBeansIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6 text-amber-700" fill="currentColor">
    <path d="M2 21v-2h18v2H2zM20 8h-3V5h3v3zm-6-3h-4v3h4V5zM8 5H5v3h3V5zm12 3v3c0 1.1-.9 2-2 2h-4v-3h3V8h3zm-6 0v5H9V8h5zm-6 0v5H4c-1.1 0-2-.9-2-2V8h4z" />
  </svg>
);

const ProfileIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6 text-amber-600" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
  </svg>
);

// Step item component for each onboarding step
interface StepItemProps {
  step: number;
  title: string;
  description: string;
  Icon: React.ComponentType;
  isLast?: boolean;
}

const StepItem: React.FC<StepItemProps> = ({ step, title, description, Icon, isLast = false }) => (
  <div className="flex items-start mb-4">
    <div className="flex flex-col items-center mr-4">
      <div className="bg-white rounded-full p-2 border-2 border-green-200">
        <Icon />
      </div>
      {!isLast && <div className="w-0.5 h-16 bg-gray-300 mt-2"></div>}
    </div>
    <div className="flex flex-col mt-2">
      <span className="text-green-500 text-sm font-medium">Step {step}</span>
      <h3 className="font-semibold text-gray-800 mb-1">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  </div>
);

const WelcomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <header className="flex justify-between items-center mb-12">
          <div className="flex items-center">
            <img src="/logo.png" alt="Afrovalley" className="h-8" />
            <span className="text-green-700 font-bold text-xl ml-2">Afrovalley</span>
          </div>
          <div className="flex items-center space-x-6">
            <Link to="/dashboard" className="text-green-600 hover:text-green-700 text-sm">
              My dashboard
            </Link>
            <Link to="/marketplace" className="text-green-600 hover:text-green-700 text-sm">
              Marketplace
            </Link>
            <Link to="/chats" className="text-green-600 hover:text-green-700 text-sm">
              Chats
            </Link>
            <div className="w-8 h-8 bg-gray-500 rounded-full"></div>
          </div>
        </header>

        {/* Main content */}
        <main className="max-w-xl mx-auto">
          {/* Welcome message */}
          <div className="text-center mb-10">
            <div className="flex justify-center mb-4">
              <span className="text-3xl">👋</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Hello, Husen Abadega</h1>
            <p className="text-gray-600">Congratulations with registration!</p>
          </div>

          {/* Onboarding steps */}
          <div className="bg-white rounded-lg p-8 mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Let's start to sell your crops</h2>
            
            <div className="space-y-2">
              <StepItem 
                step={1} 
                title="Add Farms to your profile" 
                description="Add one or few farms. Share key details to help buyers choose the best coffee crops"
                Icon={FarmIcon}
              />
              
              <StepItem 
                step={2} 
                title="Add your coffee crops for sell" 
                description="Enter details about your coffee crop to ensure accurate and clear information"
                Icon={CoffeeBeansIcon}
              />
              
              <StepItem 
                step={3} 
                title="Upload your beautiful avatar" 
                description="Add a clear profile picture to build trust and make your account easily recognizable"
                Icon={ProfileIcon}
                isLast={true}
              />
            </div>
          </div>

          {/* Action button */}
          <div className="flex justify-center">
            <Link 
              to="/onboarding/step-one" 
              className="bg-teal-500 hover:bg-teal-600 text-white font-medium py-3 px-8 rounded-md transition-colors duration-200"
            >
              Lets do it!
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
};

export default WelcomePage;