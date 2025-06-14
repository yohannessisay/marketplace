"use client";

import type React from "react";
import { Link } from "react-router-dom";
import {
  TractorIcon as Farm,
  Coffee,
  User,
  BadgeDollarSign,
  ChevronRight,
  Sparkles,
  Receipt,
  Loader,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Header from "@/components/layout/header";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";

interface StepItemProps {
  step: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  isActive?: boolean;
  isCompleted?: boolean;
  isLast?: boolean;
}

const StepItem: React.FC<StepItemProps> = ({
  step,
  title,
  description,
  icon,
  isActive = false,
  isCompleted = false,
  isLast = false,
}) => (
  <div
    className={`${
      isActive ? "border border-primary rounded-md p-2 sm:p-4 shadow-md" : ""
    } flex items-start group`}
  >
    <div className="flex flex-col items-center mr-4 sm:mr-6">
      <div
        className={`relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 transition-all duration-300 ${
          isCompleted
            ? "bg-emerald-100 border-emerald-500 text-emerald-600"
            : isActive
              ? "bg-emerald-50 border-emerald-500 text-emerald-600"
              : "bg-white border-slate-200 text-slate-400 group-hover:border-emerald-200 group-hover:text-emerald-500"
        }`}
      >
        {icon}
        {isCompleted && (
          <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-emerald-500 rounded-full flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white"
            >
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
        )}
      </div>
      {!isLast && (
        <div
          className={`w-0.5 h-20 sm:h-24 ${
            isCompleted ? "bg-emerald-500" : "bg-slate-200"
          } transition-all duration-300 mt-2`}
        ></div>
      )}
    </div>
    <div className="flex flex-col pt-2 sm:pt-2.5">
      <span
        className={`text-xs sm:text-sm font-medium mb-1 ${
          isActive || isCompleted ? "text-emerald-600" : "text-slate-500"
        }`}
      >
        Step {step}
      </span>
      <h3 className="font-semibold text-slate-800 mb-1.5 text-base sm:text-lg">
        {title}
      </h3>
      <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-xs sm:max-w-md">
        {description}
      </p>
    </div>
  </div>
);

const WelcomePage: React.FC = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleButtonClick = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-primary/5 p-4 sm:p-6 lg:p-8">
      <Header />

      <main className="max-w-full sm:max-w-3xl lg:max-w-4xl mx-auto px-4 sm:px-6 py-20 sm:py-16 lg:py-20">
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-emerald-100 rounded-full mb-4">
            <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-600" />
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800 mb-3">
            Welcome, {user?.first_name}!
          </h1>
          <p className="text-slate-600 text-sm sm:text-base lg:text-lg">
            Congratulations on joining AfroValley. Let's set up your account.
          </p>
        </div>

        {/* Onboarding steps */}
        <Card className="bg-white rounded-xl p-4 sm:p-6 lg:p-8 mb-8 sm:mb-10 shadow-sm border border-slate-100">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-800 mb-4 sm:mb-0">
              Get Started with AfroValley
            </h2>
            <div className="bg-emerald-50 text-emerald-700 text-xs sm:text-sm font-medium px-3 py-1 rounded-full">
              {user?.userType === "buyer" ? "1 step" : "4 steps"} to complete
            </div>
          </div>

          <div className="space-y-6 sm:space-y-8">
            {user?.userType === "buyer" ? (
              <StepItem
                step={1}
                title="Complete your company detail"
                description="Fill in remaining information like location, contact information, etc., to start your amazing journey"
                icon={<Receipt className="h-4 w-4 sm:h-5 sm:w-5" />}
                isActive={true}
              />
            ) : (
              <>
                <StepItem
                  step={1}
                  title="Add Farms to Your Profile"
                  description="Register your coffee farms with key details like location, size, and production capacity to help buyers find your premium coffee."
                  icon={<Farm className="h-4 w-4 sm:h-5 sm:w-5" />}
                  isActive={user?.onboarding_stage === "farm_profile"}
                />
                <StepItem
                  step={2}
                  title="Add Your Coffee Crops for Sale"
                  description="Showcase your coffee varieties with detailed information about processing methods, flavor profiles, and available quantities."
                  icon={<Coffee className="h-4 w-4 sm:h-5 sm:w-5" />}
                  isActive={user?.onboarding_stage === "crops_to_sell"}
                />
                <StepItem
                  step={3}
                  title="Set Up Your Banking Information"
                  description="Connect your bank account to receive secure and timely payments when your coffee is purchased by buyers around the world."
                  icon={<BadgeDollarSign className="h-4 w-4 sm:h-5 sm:w-5" />}
                  isActive={user?.onboarding_stage === "bank_information"}
                />
                <StepItem
                  step={4}
                  title="Complete Your Profile"
                  description="Add a professional profile picture and additional details about your farming practices to build trust with potential buyers."
                  icon={<User className="h-4 w-4 sm:h-5 sm:w-5" />}
                  isActive={user?.onboarding_stage === "avatar_image"}
                  isLast={true}
                />
              </>
            )}
          </div>
        </Card>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <Link
            to={
              user?.userType === "buyer"
                ? "/company-onboarding"
                : user?.onboarding_stage === "farm_profile"
                  ? "/onboarding/step-one"
                  : user?.onboarding_stage === "crops_to_sell"
                    ? "/onboarding/step-two"
                    : user?.onboarding_stage === "bank_information"
                      ? "/onboarding/step-three"
                      : user?.onboarding_stage === "avatar_image"
                        ? "/onboarding/step-four"
                        : "/onboarding/step-one"
            }
          >
            <Button
              size="lg"
              className="w-full sm:w-auto text-sm sm:text-base transition-all duration-200 flex items-center"
              disabled={isLoading}
              onClick={handleButtonClick}
            >
              {isLoading ? (
                <>
                  <Loader className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  Let's Get Started
                  <ChevronRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </>
              )}
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default WelcomePage;
