// pages/farms/FarmDetails.tsx

import React from "react";
import StepOne from "./farm-detail/step-one";
import Header from "@/components/layout/header";

const FarmDetailsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header></Header>

      {/* Step One */}
      <main className="container mx-auto p-6">
        <StepOne />
      </main>
    </div>
  );
};

export default FarmDetailsPage;
