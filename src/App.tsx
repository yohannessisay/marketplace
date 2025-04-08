// App.tsx

import React, { Suspense, lazy, useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { initializeApiService } from "./services/apiService";
import Hero from "./pages/landing/Hero";
import OTPInputPage from "./pages/auth/OTP";
import StepFour from "./pages/farms/farm-detail/step-four";
import StepThree from "./pages/farms/farm-detail/step-three";
import StepTwo from "./pages/farms/farm-detail/step-two";

const Login = lazy(() => import("./pages/auth/Login"));
const Signup = lazy(() => import("./pages/auth/Signup"));
const CreatePassword = lazy(() => import("./pages/auth/CreatePassword"));
const VerifyEmail = lazy(() => import("./pages/auth/VerifyEmail"));
const Welcome = lazy(() => import("./pages/onboarding/Welcome"));
const FarmManagement = lazy(() => import("./pages/farms/FarmManagement"));
const FarmDetails = lazy(() => import("./pages/farms/FarmDetails"));
const CoffeeListing = lazy(() => import("./pages/crops/CoffeeListing"));
const BankInformation = lazy(() => import("./pages/bank/BankInformation"));
const ProfilePhoto = lazy(() => import("./pages/profile/ProfilePhoto"));
const UserProfile = lazy(() => import("./pages/profile/UserProfile"));
const Dashboard = lazy(() => import("./pages/seller/Dashboard"));
const CompanyVerification = lazy(
  () => import("./pages/company/CompanyVerification")
);

const baseURL = import.meta.env.VITE_API_BASE_URL;

if (!baseURL) {
  console.error("Internal error has occurred. Please view logs.");
} else {
  initializeApiService(baseURL);
}

const Loading = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(true);
  const location = useLocation();

  // useEffect(() => {
  //     const accessToken = Cookies.get("accessToken");
  //     console.log(accessToken);

  //     if (accessToken) {
  //         try {
  //             // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //             const decodedToken: any = jwtDecode(accessToken);
  //             if (decodedToken.exp * 1000 > Date.now()) {
  //                 setIsAuthenticated(true);
  //             } else {
  //                 setIsAuthenticated(false);
  //             }
  //         } catch (error) {
  //             console.log("Error decoding token:", error);
  //             setIsAuthenticated(false);
  //         }
  //     } else {
  //         setIsAuthenticated(false);
  //     }
  // }, [location]); // Rerun effect when the location changes.

  // if (isAuthenticated === null) {
  //     return <Loading />;
  // }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Suspense fallback={<Loading />}>
        <Routes>
          {/* Auth Routes (Public) */}
          <Route path="/" element={<Hero />} />
          <Route path="/login" element={<Login />} />
          <Route path="/otp" element={<OTPInputPage />} />
          <Route path="/registration" element={<Signup />} />
          <Route path="/verification" element={<VerifyEmail />} />
          <Route path="/first-time-user" element={<CreatePassword />} />

          {/* Protected Routes */}

          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Welcome />
              </ProtectedRoute>
            }
          />
          <Route
            path="/onboarding/step-one"
            element={
              <ProtectedRoute>
                <FarmDetails />
              </ProtectedRoute>
            }
          />
           <Route
            path="/onboarding/step-two"
            element={
              <ProtectedRoute>
                <StepTwo />
              </ProtectedRoute>
            }
          />
           <Route
            path="/onboarding/step-three"
            element={
              <ProtectedRoute>
                <StepThree />
              </ProtectedRoute>
            }
          />
           <Route
            path="/onboarding/step-four"
            element={
              <ProtectedRoute>
                <StepFour />
              </ProtectedRoute>
            }
          />
          <Route
            path="/6"
            element={
              <ProtectedRoute>
                <CoffeeListing />
              </ProtectedRoute>
            }
          />
          <Route
            path="/7"
            element={
              <ProtectedRoute>
                <BankInformation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/8"
            element={
              <ProtectedRoute>
                <ProfilePhoto />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller-dashboard"
            element={
              <ProtectedRoute>
                <FarmManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/10"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/11"
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/12"
            element={
              <ProtectedRoute>
                <CompanyVerification />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
