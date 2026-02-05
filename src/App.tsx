import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuth } from './contexts/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ScrollToTop from './components/layout/ScrollToTop';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ProfilePage from './pages/ProfilePage';
import Marketplace from './pages/Marketplace';
import ListingDetail from './pages/ListingDetail';
import SellerOnboarding from './pages/SellerOnboarding';
import NewListing from './pages/NewListing';
import SellerDashboard from './pages/SellerDashboard';
import BuyerDashboard from './pages/BuyerDashboard';
import AdminPanel from './pages/AdminPanel';

const Toast: React.FC = () => {
  const { message } = useAuth();
  if (!message) return null;

  const bgClass =
    message.type === 'success'
      ? 'bg-emerald-600'
      : message.type === 'error'
        ? 'bg-red-600'
        : 'bg-slate-800';

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className={`${bgClass} text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10`}>
        <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
        <span className="text-sm font-bold tracking-tight">{message.text}</span>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <ScrollToTop />
        <Toast />
        <div className="min-h-screen flex flex-col font-sans">
          <Navbar />

          <main className="flex-grow">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } />
              <Route path="/listings" element={<Marketplace />} />
              <Route path="/listing/:id" element={<ListingDetail />} />

              {/* Protected routes - Seller only */}
              <Route
                path="/seller/onboarding"
                element={
                  <ProtectedRoute requireRole="seller">
                    <SellerOnboarding />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/seller/new-listing"
                element={
                  <ProtectedRoute requireRole="seller">
                    <NewListing />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/seller"
                element={
                  <ProtectedRoute requireRole="seller">
                    <SellerDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Protected routes - Buyer only */}
              <Route
                path="/dashboard/buyer"
                element={
                  <ProtectedRoute requireRole="buyer">
                    <BuyerDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Protected routes - Admin only */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requireRole="admin">
                    <AdminPanel />
                  </ProtectedRoute>
                }
              />

              {/* 404 */}
              <Route
                path="*"
                element={
                  <div className="min-h-screen flex items-center justify-center bg-slate-50">
                    <div className="text-center">
                      <h1 className="text-6xl font-bold text-slate-900 mb-4">404</h1>
                      <p className="text-slate-500 mb-6">Page not found</p>
                      <a
                        href="/"
                        className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors inline-block"
                      >
                        Go Home
                      </a>
                    </div>
                  </div>
                }
              />
            </Routes>
          </main>

          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
};

export default App;

