import React from 'react';
import { useUser, UserButton } from '@clerk/clerk-react'; // Import useUser from Clerk
import { Link } from 'react-router-dom';
import { Gavel } from 'lucide-react'; // A more fitting icon for bidding
import LoadingSpinner from '../components/LoadingSpinner';

const Header = () => {
    // Get user object directly from Clerk's useUser hook
    const { isLoaded, user } = useUser();
    console.log(user);
    // If Clerk is still loading the user, show a placeholder.
    if (!isLoaded) {
        return (<div className="flex justify-center items-center p-10"><LoadingSpinner /></div>/* ... your loading state JSX ... */);
    }

    // Safely access metadata once the user is loaded
    const role = user?.unsafeMetadata?.role || '...';
    const firstName = user?.unsafeMetadata?.firstName || '';
    const lastName = user?.unsafeMetadata?.lastName || '';
    const fullName = `${firstName} ${lastName}`.trim();

    // While Clerk is loading, you might want to show a placeholder or nothing
    if (!isLoaded) {
        return (
            <header className="bg-white shadow-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    {/* Placeholder content while loading */}
                    <div className="flex items-center space-x-2">
                       <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                       <h1 className="text-2xl font-bold text-gray-800">SupplyLink</h1>
                    </div>
                    <div className="h-8 w-24 bg-gray-200 rounded-full animate-pulse"></div>
                </div>
            </header>
        );
    }

    return (
        <header className="bg-white shadow-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                {/* Logo and Site Name */}
                <div className="flex items-center space-x-4">
                   <Link to="/home" className="flex items-center space-x-2">
                       <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                       <h1 className="text-2xl font-bold text-gray-800">SupplyLink</h1>
                   </Link>
                   {/* Navigation Link for Suppliers, shown conditionally based on role */}
                   {role === 'supplier' && (
                       <nav className="hidden md:flex">
                           <Link 
                               to="/bidding" 
                               className="flex items-center bg-purple-600 text-white hover:bg-purple-700 font-semibold px-4 py-2 rounded-lg text-sm transition-all duration-300 ease-in-out shadow-md hover:shadow-lg transform hover:-translate-y-px"
                           >
                               <Gavel className="w-4 h-4 mr-2" />
                               Bidding Arena
                           </Link>
                       </nav>
                   )}
                </div>

                {/* User Info and Actions */}
                <div className="flex items-center space-x-4">
                   <span className="hidden sm:inline-block text-sm font-medium text-gray-600 capitalize bg-gray-100 px-3 py-1 rounded-full">
                     {role}
                   </span>
                   {/* This is the standard Clerk component for user profile and sign out */}
                   <UserButton afterSignOutUrl="/" />
                </div>
            </div>
        </header>
    );
};

export default Header;