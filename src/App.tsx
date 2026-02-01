import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import LandingPage from './pages/LandingPage';
import Marketplace from './pages/Marketplace';
import ListingDetail from './pages/ListingDetail';
import SellerOnboarding from './pages/SellerOnboarding';
import NewListing from './pages/NewListing';
import SellerDashboard from './pages/SellerDashboard';
import BuyerDashboard from './pages/BuyerDashboard';
import AdminPanel from './pages/AdminPanel';
import { MOCK_USERS } from './data/mockData';
import { User as UserType } from './types/types';

// Simple Context Mock for Auth
const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserType | null>(MOCK_USERS[0]); // Default to seller for demo

  return (
    <Router>
      <div className="min-h-screen flex flex-col font-sans">
        <Navbar currentUser={currentUser} />

        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/listings" element={<Marketplace />} />
            <Route path="/listing/:id" element={<ListingDetail />} />
            <Route path="/seller/onboarding" element={<SellerOnboarding />} />
            <Route path="/seller/new-listing" element={<NewListing />} />
            <Route path="/dashboard/seller" element={<SellerDashboard user={currentUser} />} />
            <Route path="/dashboard/buyer" element={<BuyerDashboard user={currentUser} />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="*" element={<div className="p-10 text-center text-slate-500">Page under construction...</div>} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
};

export default App;
