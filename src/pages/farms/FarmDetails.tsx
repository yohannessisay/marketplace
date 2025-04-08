import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import StepOne from "./farm-detail/step-one";
import StepTwo from "./farm-detail/step-two";
import StepThree from "./farm-detail/step-three";
import StepFour from "./farm-detail/step-four";

const FarmDetailsPage: React.FC = () => {
  const [userProfile, setUserProfille] = useState(
    localStorage.getItem("userProfile")
      ? JSON.parse(localStorage.getItem("userProfile") || "{}")
      : null
  );
 

  const currentState = userProfile?.onboardingStage || "farm-profile";

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-green-800 text-xl font-bold">Afrovalley</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              to="/dashboard"
              className="text-sm text-green-600 flex items-center"
            >
              <span className="mr-1">🏠</span> My dashboard
            </Link>
            <Link
              to="/marketplace"
              className="text-sm text-gray-600 flex items-center"
            >
              <span className="mr-1">🛒</span> Marketplace
            </Link>
            <Link
              to="/chats"
              className="text-sm text-gray-600 flex items-center"
            >
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
        {currentState === "farm-profile" ? (
          <StepOne></StepOne>
        ) : currentState === "crops_to_sell" ? (
          <StepTwo></StepTwo>
        ) : currentState === "crop-specification" ? (
          <StepThree></StepThree>
        ) : currentState === "crop-history" ? (
          <StepFour></StepFour>
        ) : (
          <div></div>
        )}
      </main>
    </div>
  );
};

export default FarmDetailsPage;
