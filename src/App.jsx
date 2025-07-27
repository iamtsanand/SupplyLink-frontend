import React from 'react';
import './App.css';
import { Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { SignedIn, SignedOut } from '@clerk/clerk-react';

// Import your pages and layout components
import Authorization from './pages/Auth'; // Assuming path is correct
import { HomePage } from './pages/HomePage'; // Assuming path is correct
import Header from './components/Header'; // Assuming path is correct
import Footer from './components/Footer'; // Assuming path is correct
import BiddingPage from './pages/BiddingPage'; // Assuming path is correct

/**
 * AppLayout component
 * This component acts as a wrapper for pages that need a consistent Header and Footer.
 * The <Outlet /> from react-router-dom will render the specific child route's component.
 */
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
      {/* PUBLIC ROUTE: This route handles the root path. */}
      <Route 
        path="/" 
        element={
          <>
            {/* If the user is signed in, redirect them from the root to the home page. */}
            <SignedIn>
              <Navigate to="/home" />
            </SignedIn>
            {/* If the user is signed out, show the Authorization (login) page. */}
            <SignedOut>
              <Authorization />
            </SignedOut>
          </>
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
        {/* You can add other protected routes here */}
      </Route>
    </Routes>
  );
}

export default App;
