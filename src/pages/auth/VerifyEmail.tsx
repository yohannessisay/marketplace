import { Button } from "@/components/ui/button";
import React from "react";
import { useNavigate } from "react-router-dom";

const VerifyEmail: React.FC = () => {
  const navigate = useNavigate();

  const handleOkayClick = () => {
    navigate("/otp");
  };

  return (
    <div className="flex h-screen w-full bg-white">
      <div
        className="hidden md:flex w-1/2 bg-cover bg-center border rounded-md border-green-200 m-2 shadow-2xl"
        style={{
          backgroundImage: "url('images/email.svg')",
        }}
      ></div>

      {/* Right Section - Verification Message */}
      <div className="w-1/2 h-full flex flex-col items-center justify-center bg-gray-50 px-8">
        <div className="max-w-md w-full flex flex-col items-center">
          {/* Email Icon */}
          <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#10B981"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          </div>

          {/* Verification Text */}
          <h2 className="text-xl font-semibold text-center text-gray-800 mb-2">
            We have sent a verification email.
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Please use the OTP to complete registration.
          </p>

          {/* Okay Button */}
          <Button
            onClick={handleOkayClick}
            className="w-ful"
            variant={"default"}
          >
            I have received my OTP
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
