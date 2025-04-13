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
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getFromLocalStorage } from "@/lib/utils";
import Header from "@/components/layout/header";

// Step item component for each onboarding step
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
  <div className="flex items-start group">
    <div className="flex flex-col items-center mr-6">
      <div
        className={`relative flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${
          isCompleted
            ? "bg-emerald-100 border-emerald-500 text-emerald-600"
            : isActive
            ? "bg-emerald-50 border-emerald-500 text-emerald-600"
            : "bg-white border-slate-200 text-slate-400 group-hover:border-emerald-200 group-hover:text-emerald-500"
        }`}
      >
        {icon}
        {isCompleted && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
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
          className={`w-0.5 h-24 ${
            isCompleted ? "bg-emerald-500" : "bg-slate-200"
          } transition-all duration-300 mt-2`}
        ></div>
      )}
    </div>
    <div className="flex flex-col pt-2.5">
      <span
        className={`text-sm font-medium mb-1 ${
          isActive || isCompleted ? "text-emerald-600" : "text-slate-500"
        }`}
      >
        Step {step}
      </span>
      <h3 className="font-semibold text-slate-800 mb-1.5 text-lg">{title}</h3>
      <p className="text-slate-600 text-sm leading-relaxed max-w-md">
        {description}
      </p>
    </div>
  </div>
);

const WelcomePage: React.FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user: any = getFromLocalStorage("userProfile", {});
  return (
    <div className="min-h-screen bg-primary/5 p-8">
      {/* Header */}
      <Header></Header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Welcome message */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
            <Sparkles className="h-8 w-8 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-3">
            Welcome,{user.firstName}!
          </h1>
          <p className="text-slate-600 text-lg">
            Congratulations on joining AfroValley. Let's set up your account.
          </p>
        </div>

        {/* Onboarding steps */}
        <Card className="bg-white rounded-xl p-8 mb-10 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-slate-800">
              Get Started with AfroValley
            </h2>
            <div className="bg-emerald-50 text-emerald-700 text-sm font-medium px-3 py-1 rounded-full">
              {user.userType === "buyer" ? "1 step" : "4 steps"} to complete
            </div>
          </div>

          <div className="space-y-8">
            {user.userType === "buyer" ? (
              <>
                {" "}
                <StepItem
                  step={1}
                  title="Complete your company detail"
                  description="Fill in remaining information like location,contact information etc.. to start your amazing journey"
                  icon={<Receipt className="h-5 w-5" />}
                  isActive={true}
                />
              </>
            ) : (
              <>
                <StepItem
                  step={1}
                  title="Add Farms to Your Profile"
                  description="Register your coffee farms with key details like location, size, and production capacity to help buyers find your premium coffee."
                  icon={<Farm className="h-5 w-5" />}
                  isActive={true}
                />

                <StepItem
                  step={2}
                  title="Add Your Coffee Crops for Sale"
                  description="Showcase your coffee varieties with detailed information about processing methods, flavor profiles, and available quantities."
                  icon={<Coffee className="h-5 w-5" />}
                />

                <StepItem
                  step={3}
                  title="Set Up Your Banking Information"
                  description="Connect your bank account to receive secure and timely payments when your coffee is purchased by buyers around the world."
                  icon={<BadgeDollarSign className="h-5 w-5" />}
                />

                <StepItem
                  step={4}
                  title="Complete Your Profile"
                  description="Add a professional profile picture and additional details about your farming practices to build trust with potential buyers."
                  icon={<User className="h-5 w-5" />}
                  isLast={true}
                />
              </>
            )}
          </div>
        </Card>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <Link
            to={
              user.userType === "buyer"
                ? "/company-onboarding"
                : "/onboarding/step-one"
            }
          >
            <Button
              size="lg"
              className="  transition-all duration-200 flex items-center text-base"
            >
              Let's Get Started
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>

          <Button
            variant="outline"
            size="lg"
            className="  rounded-lg transition-all duration-200 text-base"
          >
            I'll Do This Later
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 py-6 border-t border-slate-100 text-center text-slate-500 text-sm">
        <div className="max-w-4xl mx-auto px-6">
          <p>
            © 2025 Afrovalley. Connecting Ethiopian coffee farmers with global
            markets.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default WelcomePage;
