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
import ProfileVerse from "@/pages/ProfileVerse";
import Messages from "@/pages/Messages";
import Settings from "@/pages/Settings";
import Login from "@/pages/Login";
import SignIn from "@/pages/SignIn";
import SignUp from "@/pages/SignUp";
import AdminDashboard from "@/pages/AdminDashboard";
import SuperAdminDashboard from "@/pages/SuperAdminDashboard";

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
          <Route path="/post-verse" element={<Layout><PostVerse /></Layout>} />
          <Route path="/dashboard" element={<Layout><PostVerse /></Layout>} />
          <Route path="/search-verse" element={<Layout><SearchVerse /></Layout>} />
          <Route path="/profile-verse" element={<Layout><ProfileVerse /></Layout>} />
          <Route path="/messages" element={<Layout><Messages /></Layout>} />
          <Route path="/settings" element={<Layout><Settings /></Layout>} />
          <Route path="/login" element={<Login />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/superadmin" element={<SuperAdminDashboard />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
