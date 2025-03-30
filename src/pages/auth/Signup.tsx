
import { useState } from "react";

export default function SignupPage() {
  const [role, setRole] = useState("seller");

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Left Side - Image */}
      <div className="hidden md:flex w-1/2 h-screen">
        <img
          src="/your-image-path.jpg"
          alt="Ethiopian Coffee Farms"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Right Side - Form */}
      <div className="flex w-full md:w-1/2 items-center justify-center bg-white p-8">
        <div className="max-w-md w-full">
          {/* Logo */}
          <div className="mb-6 text-center">
            <h2 className="text-3xl font-bold text-gray-800">
              <span className="text-green-600">Afro</span>valley
            </h2>
          </div>

          {/* Role Selection */}
          <div className="flex mb-4 space-x-2">
            <button
              className={`flex-1 py-2 rounded-lg border ${
                role === "buyer"
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
              onClick={() => setRole("buyer")}
            >
              Sign up as Buyer
            </button>
            <button
              className={`flex-1 py-2 rounded-lg border ${
                role === "seller"
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
              onClick={() => setRole("seller")}
            >
              Sign up as Seller
            </button>
          </div>

          {/* Form Fields */}
          <form className="space-y-4">
            <input
              type="text"
              placeholder="First name*"
              className="w-full p-3 border bg-white rounded-lg focus:ring-2 focus:ring-green-500"
            />
            <input
              type="text"
              placeholder="Last name*"
              className="w-full p-3 border bg-white rounded-lg focus:ring-2 focus:ring-green-500"
            />
            <input
              type="tel"
              placeholder="Phone*"
              className="w-full p-3 border bg-white rounded-lg focus:ring-2 focus:ring-green-500"
            />
            <input
              type="email"
              placeholder="Email*"
              className="w-full p-3 border bg-white rounded-lg focus:ring-2 focus:ring-green-500"
            />

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Create account
            </button>
          </form>

          {/* Sign-in Option */}
          <p className="mt-4 text-center text-gray-600">
            Already have an account?{" "}
            <a href="/" className="text-green-600 font-semibold">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
