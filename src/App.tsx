// App.tsx

import React, { Suspense, lazy, useState } from "react";
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
import AgentLogin from "./pages/auth/agent-login";
import FarmersTable from "./pages/agent/farmer-management";
import AddFarm from "./pages/farms/add-farm";
import CoffeeMarketplace from "./pages/marketplace/CoffeeMarketplace";
import FarmerSignupViaAgentPage from "./pages/auth/farmer-signup-via-agent";
import CoffeeListingPagev1 from "./pages/marketplace/CoffeeListingPage";
import MyOrdersPage from "./pages/marketplace/MyOrdersPage";

const Login = lazy(() => import("./pages/auth/Login"));
const Signup = lazy(() => import("./pages/auth/Signup"));
const CreatePassword = lazy(() => import("./pages/auth/CreatePassword"));
const VerifyEmail = lazy(() => import("./pages/auth/VerifyEmail"));
const Welcome = lazy(() => import("./pages/onboarding/Welcome"));
const FarmManagement = lazy(() => import("./pages/farms/FarmManagement"));
const FarmDetails = lazy(() => import("./pages/farms/FarmDetails")); // Step One
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
const userProfile = localStorage.getItem("userProfile");
const parsed = userProfile ? JSON.parse(userProfile) : null;
const currentStep = parsed?.onboardingStage;

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(true);
  const location = useLocation();

  // Uncomment this to enable real JWT auth check
  /*
  useEffect(() => {
    const accessToken = Cookies.get("accessToken");
    if (accessToken) {
      try {
        const decodedToken: any = jwtDecode(accessToken);
        if (decodedToken.exp * 1000 > Date.now()) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.log("Error decoding token:", error);
        setIsAuthenticated(false);
      }
    } else {
      setIsAuthenticated(false);
    }
  }, [location]);
  */

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

// Determine route based on user profile stage
const getStepFromStage = () => {
  const userProfile = localStorage.getItem("userProfile");
  const parsed = userProfile ? JSON.parse(userProfile) : null;
  switch (parsed?.onboardingStage) {
    case "crops_to_sell":
      return "/onboarding/step-two";
    case "crop-specification":
      return "/onboarding/step-three";
    case "crop-history":
      return "/onboarding/step-four";
    case "completed":
      return "/seller-dashboard";
    default:
      return "/onboarding/step-one";
  }
};

function App() {
  return (
    <Router>
      <Suspense fallback={<Loading />}>
        <Routes>
          {/* Auth Routes (Public) */}
          <Route path="/" element={<Hero />} />
          <Route path="/login" element={<Login />} />
          <Route path="/agent/login" element={<AgentLogin />} />
          <Route path="/otp" element={<OTPInputPage />} />
          <Route path="/registration" element={<Signup />} />
          <Route path="/verification" element={<VerifyEmail />} />
          <Route path="/first-time-user" element={<CreatePassword />} />

          {/* Onboarding smart redirect */}
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <Navigate to={getStepFromStage()} replace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/farmer-signup-via-agent"
            element={
              <ProtectedRoute>
                <FarmerSignupViaAgentPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/add-farm"
            element={
              <ProtectedRoute>
                <AddFarm />
              </ProtectedRoute>
            }
          />
          {/* Onboarding Step Routes */}
          <Route
            path="/onboarding/step-one"
            element={
              <ProtectedRoute>
                {currentStep === "completed" ? (
                  <FarmManagement />
                ) : (
                  <FarmDetails />
                )}
              </ProtectedRoute>
            }
          />
          <Route
            path="/onboarding/step-two"
            element={
              <ProtectedRoute>
                {currentStep === "completed" ? <FarmManagement /> : <StepTwo />}
              </ProtectedRoute>
            }
          />
          <Route
            path="/onboarding/step-three"
            element={
              <ProtectedRoute>
                {currentStep === "completed" ? (
                  <FarmManagement />
                ) : (
                  <StepThree />
                )}
              </ProtectedRoute>
            }
          />
          <Route
            path="/onboarding/step-four"
            element={
              <ProtectedRoute>
                {currentStep === "completed" ? (
                  <FarmManagement />
                ) : (
                  <StepFour />
                )}
              </ProtectedRoute>
            }
          />

          {/* Other Protected Routes */}
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                {currentStep !== "completed" ? (
                  <Welcome />
                ) : (
                  <FarmManagement></FarmManagement>
                )}
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
            path="/profile"
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
          <Route
            path="/agent/farmer-management"
            element={
              <ProtectedRoute>
                <FarmersTable />
              </ProtectedRoute>
            }
          />

          <Route
            path="/market-place"
            element={
              <ProtectedRoute>
                <CoffeeMarketplace />
              </ProtectedRoute>
            }
          />

          <Route path="/15" element={<CoffeeListingPagev1 />} />
          <Route path="/16" element={<MyOrdersPage />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
