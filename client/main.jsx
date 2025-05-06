import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './style/index.css'

import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import DashboardLayout from './layout/DashboardLayout.jsx';
import PublicLayout from './layout/PublicLayout.jsx';
import LandingPage from './pages/LandingPage.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Reports from './pages/Reports.jsx';
import Settings from './pages/Settings.jsx';
import Home from './pages/Home.jsx';
import Search from './pages/Search.jsx';
import ErrorPage from './pages/ErrorPage.jsx';
import PaymentSuccess from './pages/PaymentSuccess.jsx';
import Stocktake from './pages/Stocktake.jsx';
import Locations from './pages/Locations.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
          </Route>
          
          {/* Protected routes - only accessible when authenticated */}
          <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/stocktake" element={<Stocktake />} />
            <Route path="/locations" element={<Locations />} />
          </Route>
          
          <Route path="*" element={<ErrorPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);