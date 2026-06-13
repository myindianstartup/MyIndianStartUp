import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HOME } from "@/constants/testIds";

import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import ScrollToTop from "@/components/site/ScrollToTop";
import Home from "@/pages/Home";
import BusinessVerse from "@/pages/BusinessVerse";
import CreatorVerse from "@/pages/CreatorVerse";
import Payment from "@/pages/Payment";
import JoinUs from "@/pages/JoinUs";
import Platform from "@/pages/Platform";
import PostVerse from "@/pages/PostVerse";
import SearchVerse from "@/pages/SearchVerse";
import VerseFeed from "@/pages/VerseFeed";
import ProfileVerse from "@/pages/ProfileVerse";
import Messages from "@/pages/Messages";
import Settings from "@/pages/Settings";
import Login from "@/pages/Login";
import SignIn from "@/pages/SignIn";
import SignUp from "@/pages/SignUp";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import AdminDashboard from "@/pages/AdminDashboard";
import SuperAdminDashboard from "@/pages/SuperAdminDashboard";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

import "@/App.css";

function Layout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <ScrollToTop />
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
          <Route path="/business-verse" element={<Layout><BusinessVerse /></Layout>} />
          <Route path="/creator-verse" element={<Layout><CreatorVerse /></Layout>} />
          <Route path="/pricing" element={<Layout><Payment /></Layout>} />
          <Route path="/payment" element={<Layout><Payment /></Layout>} />
          <Route path="/contact" element={<Layout><JoinUs /></Layout>} />
          <Route path="/join" element={<Layout><JoinUs /></Layout>} />
          <Route path="/platform" element={<Layout><Platform /></Layout>} />
          <Route path="/post-verse" element={<ProtectedRoute><Layout><PostVerse /></Layout></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Layout><PostVerse /></Layout></ProtectedRoute>} />
          <Route path="/search-verse" element={<ProtectedRoute><Layout><SearchVerse /></Layout></ProtectedRoute>} />
          <Route path="/verse-feed" element={<ProtectedRoute><Layout><VerseFeed /></Layout></ProtectedRoute>} />
          <Route path="/profile-verse" element={<ProtectedRoute><Layout><ProfileVerse /></Layout></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><Layout><Messages /></Layout></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Layout><Settings /></Layout></ProtectedRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
          <Route path="/superadmin" element={<ProtectedRoute superAdminOnly><SuperAdminDashboard /></ProtectedRoute>} />
        </Routes>
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
