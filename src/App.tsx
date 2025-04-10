import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import FarmerManagement from './pages/agent/FarmerManagement';
import CoffeeMarketplace from './pages/marketplace/CoffeeMarketplace';
import CoffeeListingPage from './pages/marketplace/CoffeeListingPage';
import MyOrdersPage from './pages/marketplace/MyOrdersPage';

const Login = lazy(() => import('./pages/auth/Login'));
const Signup = lazy(() => import('./pages/auth/Signup'));
const CreatePassword = lazy(() => import('./pages/auth/CreatePassword'));
const VerifyEmail = lazy(() => import('./pages/auth/VerifyEmail'));
const Welcome = lazy(() => import('./pages/onboarding/Welcome'));
const FarmManagement = lazy(() => import('./pages/farms/FarmManagement'));
const FarmDetails = lazy(() => import('./pages/farms/FarmDetails'));
const CoffeeListing = lazy(() => import('./pages/crops/CoffeeListing'));

const BankInformation = lazy(() => import('./pages/bank/BankInformation'));
const ProfilePhoto = lazy(() => import('./pages/profile/ProfilePhoto'));
const UserProfile = lazy(() => import('./pages/profile/UserProfile'));
const Dashboard = lazy(() => import('./pages/seller/Dashboard'));
const CompanyVerification = lazy(() => import('./pages/company/CompanyVerification'));

// Fallback loading component
const Loading = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);

function App() {
  return (
    <Router>
      <Suspense fallback={<Loading />}>
        <Routes>
          {/* Auth Routes */}
          <Route path="/" element={<Login />} />
          <Route path="/1" element={<Signup />} />
          <Route path="/2" element={<CreatePassword />} />
          <Route path="/3" element={<VerifyEmail />} />
          
          {/* Onboarding Routes */}
          <Route path="/4" element={<Welcome />} />
          
          {/* Farm Routes */}
          <Route path="/5" element={<FarmDetails />} />
          
          {/* Coffee Crop Routes */}
          <Route path="/6" element={<CoffeeListing />} />
          
          {/* Bank Routes */}
          <Route path="/7" element={<BankInformation />} />
          
          {/* Profile Routes */}
          <Route path="/8" element={<ProfilePhoto />} />
          
          {/* Dashboard */}
          <Route path="/9" element={<FarmManagement />} />
          <Route path="/10" element={<Dashboard />} />
          <Route path="/11" element={<UserProfile />} />
            {/* Buyer onboarding */}
          <Route path="/12" element={<CompanyVerification />} />

          <Route path="/13" element={<FarmerManagement />} />

          <Route path="/14" element={<CoffeeMarketplace />} />

          <Route path="/15" element={<CoffeeListingPage />} />
          <Route path="/16" element={<MyOrdersPage />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;