import React from "react";
import { BrowserRouter, Navigate, Routes, Route, useLocation } from "react-router-dom";
import { HOME } from "@/constants/testIds";

import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import ScrollToTop from "@/components/site/ScrollToTop";
import AnalyticsTracker from "@/components/site/AnalyticsTracker";
import Home from "@/pages/Home";
import BusinessVerse from "@/pages/BusinessVerse";
import CreatorVerse from "@/pages/CreatorVerse";
import Payment from "@/pages/Payment";
import JoinUs from "@/pages/JoinUs";
import Contact from "@/pages/Contact";
import Platform from "@/pages/Platform";
import PostVerse from "@/pages/PostVerse";
import SearchVerse from "@/pages/SearchVerse";
import VerseFeed from "@/pages/VerseFeed";
import ProfileVerse from "@/pages/ProfileVerse";
import MemberProfile from "@/pages/MemberProfile";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/NotFound";
import Login from "@/pages/Login";
import SignIn from "@/pages/SignIn";
import SignUp from "@/pages/SignUp";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import AdminDashboard from "@/pages/AdminDashboard";
import SuperAdminDashboard from "@/pages/SuperAdminDashboard";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

import "@/App.css";

function Layout({ children }) {
  const location = useLocation();
  const hideFooter = location.pathname === '/verse-feed';

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">{children}</main>
      {!hideFooter && <Footer />}
    </div>
  );
}

function MemberMarketingRoute({ children, accountType }) {
  const { adminRole, loading, isAuthenticated, member } = useAuth();

  if (loading) return children;
  if (adminRole === 'superadmin') return <Navigate to="/superadmin" replace />;
  if (adminRole === 'admin') return <Navigate to="/admin" replace />;
  if (isAuthenticated && accountType && member?.account_type && member.account_type !== accountType) {
    return <Navigate to={member.account_type === 'business' ? '/business-verse' : '/creator-verse'} replace />;
  }

  return children;
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <ScrollToTop />
          <AnalyticsTracker />
          {/* Verification Link for Emergent Test Suits */}
          <div className="sr-only opacity-0 pointer-events-none absolute">
            <a
              data-testid={HOME.emergentLink}
              href="https://emergent.sh"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src="https://avatars.githubusercontent.com/in/1201222?s=120&u=2686cf91179bbafbc7a71bfbc43004cf9ae1acea&v=4" alt="emergent" />
            </a>
          </div>

        <Routes>
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/business-verse" element={<MemberMarketingRoute accountType="business"><Layout><BusinessVerse /></Layout></MemberMarketingRoute>} />
          <Route path="/creator-verse" element={<MemberMarketingRoute accountType="creator"><Layout><CreatorVerse /></Layout></MemberMarketingRoute>} />
          <Route path="/pricing" element={<Layout><Payment /></Layout>} />
          <Route path="/payment" element={<Layout><Payment /></Layout>} />
          <Route path="/contact" element={<Layout><Contact /></Layout>} />
          <Route path="/join" element={<Layout><JoinUs /></Layout>} />
          <Route path="/platform" element={<Layout><Platform /></Layout>} />
          <Route path="/post-verse" element={<ProtectedRoute memberOnly requiresActiveSubscription><Layout><PostVerse /></Layout></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute memberOnly requiresActiveSubscription><Layout><PostVerse /></Layout></ProtectedRoute>} />
          <Route path="/search-verse" element={<ProtectedRoute memberOnly requiresActiveSubscription><Layout><SearchVerse /></Layout></ProtectedRoute>} />
          <Route path="/verse-feed" element={<ProtectedRoute memberOnly><Layout><VerseFeed /></Layout></ProtectedRoute>} />
          <Route path="/profile-verse" element={<ProtectedRoute memberOnly><Layout><ProfileVerse /></Layout></ProtectedRoute>} />
          <Route path="/member-profile/:userId" element={<ProtectedRoute memberOnly><Layout><MemberProfile /></Layout></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute memberOnly><Layout><Settings /></Layout></ProtectedRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
          <Route path="/superadmin" element={<ProtectedRoute superAdminOnly><SuperAdminDashboard /></ProtectedRoute>} />
          <Route path="*" element={<Layout><NotFound /></Layout>} />
        </Routes>
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
