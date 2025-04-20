"use client";

import React, { Suspense, lazy } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import { initializeApiService } from "./services/apiService";
import Hero from "./pages/landing/Hero";
import OTPInputPage from "./pages/auth/OTP";
import StepFour from "./pages/onboarding/farm-detail/step-four";
import StepThree from "./pages/onboarding/farm-detail/step-three";
import StepTwo from "./pages/onboarding/farm-detail/step-two";
import AgentLogin from "./pages/auth/agent-login";
import FarmersTable from "./pages/agent/farmer-management";
import AddFarm from "./pages/farms/add-farm";
import CoffeeMarketplace from "./pages/marketplace/coffee-marketplace";
import FarmerSignupViaAgentPage from "./pages/auth/farmer-signup-via-agent";
import MyOrdersPage from "./pages/marketplace/my-orders";
import CoffeeListingPage from "./pages/marketplace/coffee-listing/CoffeeListingPage";
import CoffeeListingSellerView from "./pages/marketplace/coffee-listing-seller/coffee-listing-seller";
import AddCrop from "./pages/farms/add-crop";
import { initializeChatService } from "./services/chatService";
import EditBank from "./pages/bank/edit-bank";
import OrdersPage from "./pages/seller/orders";

const Login = lazy(() => import("./pages/auth/Login"));
const Signup = lazy(() => import("./pages/auth/Signup"));
const CreatePassword = lazy(() => import("./pages/auth/CreatePassword"));
const VerifyEmail = lazy(() => import("./pages/auth/VerifyEmail"));
const Welcome = lazy(() => import("./pages/onboarding/Welcome"));
const FarmManagement = lazy(() => import("./pages/farms/FarmManagement"));
const FarmDetails = lazy(() => import("./pages/farms/FarmDetails"));
const UserProfile = lazy(() => import("./pages/profile/UserProfile"));
const ChatsPage = lazy(() => import("./pages/chats/ChatsPage"));
const SettingsPage = lazy(() => import("./pages/buyers/settings/SettingsPage"));
const CompanyOnboarding = lazy(
  () => import("./pages/company/company-onboarding"),
);

const baseURL = import.meta.env.VITE_API_BASE_URL;
const socketURL = import.meta.env.VITE_SOCKET_URL;

if (!baseURL || !socketURL) {
  console.error(
    "VITE_API_BASE_URL or VITE_SOCKET_URL are missing from the environment",
  );
} else {
  initializeApiService(baseURL);
  initializeChatService(socketURL);
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
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loading />;
  }

  return isAuthenticated ? (
    <>{children}</>
  ) : (
    <Navigate to="/login" state={{ from: location }} />
  );
};

const getStepFromStage = (onboarding_stage?: string, userType?: string) => {
  if (userType === "buyer") {
    return onboarding_stage === "completed"
      ? "/market-place"
      : "/company-verification";
  }

  switch (onboarding_stage) {
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

const RouterContent: React.FC = () => {
  const { user } = useAuth();
  const currentStep = user?.onboarding_stage;
  const userType = user?.userType;

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Hero />} />
      <Route path="/login" element={<Login />} />
      <Route path="/agent/login" element={<AgentLogin />} />
      <Route path="/otp" element={<OTPInputPage />} />
      <Route path="/registration" element={<Signup />} />
      <Route path="/verification" element={<VerifyEmail />} />
      <Route path="/first-time-user" element={<CreatePassword />} />
      <Route path="/market-place" element={<CoffeeMarketplace />} />
      <Route path="/listing/:id" element={<CoffeeListingPage />} />

      {/* Protected Routes */}
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            {userType === "buyer" ? (
              <Navigate to="/market-place" replace />
            ) : currentStep !== "completed" ? (
              <Welcome />
            ) : (
              <FarmManagement />
            )}
          </ProtectedRoute>
        }
      />
      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <Navigate to={getStepFromStage(currentStep, userType)} replace />
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
      <Route
        path="/edit-farm/:id"
        element={
          <ProtectedRoute>
            <AddFarm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/add-crop"
        element={
          <ProtectedRoute>
            <AddCrop />
          </ProtectedRoute>
        }
      />
      <Route
        path="/edit-crop/:id"
        element={
          <ProtectedRoute>
            <AddCrop />
          </ProtectedRoute>
        }
      />
      <Route
        path="/edit-bank/:id"
        element={
          <ProtectedRoute>
            <EditBank />
          </ProtectedRoute>
        }
      />
      <Route
        path="/onboarding/step-one"
        element={
          <ProtectedRoute>
            {currentStep === "completed" ? <FarmManagement /> : <FarmDetails />}
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
            {currentStep === "completed" ? <FarmManagement /> : <StepThree />}
          </ProtectedRoute>
        }
      />
      <Route
        path="/onboarding/step-four"
        element={
          <ProtectedRoute>
            {currentStep === "completed" ? <FarmManagement /> : <StepFour />}
          </ProtectedRoute>
        }
      />
      <Route
        path="/company-verification"
        element={
          <ProtectedRoute>
            <CompanyOnboarding />
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
        path="/profile"
        element={
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/company-onboarding"
        element={
          <ProtectedRoute>
            <CompanyOnboarding />
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
        path="/my-orders"
        element={
          <ProtectedRoute>
            <MyOrdersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <OrdersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manage-listing/:id"
        element={
          <ProtectedRoute>
            <CoffeeListingSellerView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/chats"
        element={
          <ProtectedRoute>
            <ChatsPage />
          </ProtectedRoute>
        }
      />
      {/* Catch-All Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <Suspense fallback={<Loading />}>
        <RouterContent />
      </Suspense>
    </Router>
  );
}

export default App;
