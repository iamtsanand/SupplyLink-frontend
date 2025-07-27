import React from 'react';
import './App.css';
import { Routes, Route, Outlet } from 'react-router-dom';
import { SignedIn, SignedOut } from '@clerk/clerk-react';

import Authorization from './pages/Auth';
import { HomePage } from './pages/HomePage';
import Header from './components/Header';
import Footer from './components/Footer';
import BiddingPage from './pages/BiddingPage';
import OnboardingPage from './pages/OnboardingPage';

const AppLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-sans">
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <Routes>
      {/* PUBLIC ROUTE: This now ONLY shows the auth page for signed-out users. */}
      <Route 
        path="/" 
        element={
          <SignedOut>
            <Authorization />
          </SignedOut>
        } 
      />

      {/* PROTECTED ROUTES: All routes within this group require the user to be signed in. */}
      <Route
        element={
          <SignedIn>
            <AppLayout />
          </SignedIn>
        }
      >
        <Route path="/home" element={<HomePage />} />
        <Route path="/bidding" element={<BiddingPage />} />
      </Route>

      {/* ONBOARDING ROUTE: This is a special protected route without the main layout. */}
      <Route 
        path="/onboarding"
        element={
          <SignedIn>
            <OnboardingPage />
          </SignedIn>
        }
      />
    </Routes>
  );
}

export default App;