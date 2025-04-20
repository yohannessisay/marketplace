import React from "react";
import StepOne from "../onboarding/farm-detail/step-one";
import Header from "@/components/layout/header";

const FarmDetailsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-primary/5">
      <Header></Header>
      <main className="container mx-auto p-6 pt-30">
        <StepOne />
      </main>
    </div>
  );
};

export default FarmDetailsPage;
