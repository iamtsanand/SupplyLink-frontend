import React, { useState } from 'react';
import { useSignIn, useSignUp } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { Smartphone, User, KeyRound, Building, MapPin, ChevronLeft } from 'lucide-react';
import { createUserInDb } from '../utils/api'; // Import the API function

// Main Authentication Component - Now self-contained
export default function Authorization() {
  const navigate = useNavigate();
  const [authStep, setAuthStep] = useState('initial'); // 'initial', 'login', 'signup', 'otp'

  // --- Local state for this component ---
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUpFlow, setIsSignUpFlow] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    role: 'vendor', // Default role
  });

  // --- Clerk Hooks for Sign-In and Sign-Up ---
  const { isLoaded: isSignInLoaded, signIn, setActive: setSignInActive } = useSignIn();
  const { isLoaded: isSignUpLoaded, signUp, setActive: setSignUpActive } = useSignUp();

  // --- Event Handlers ---

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Logic for Sign-In
  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!isSignInLoaded) return;
    setError('');
    setIsLoading(true);

    try {
      const signInAttempt = await signIn.create({
        identifier: `+${phoneNumber}`,
      });

      const phoneCodeFactor = signInAttempt.supportedFirstFactors.find(
        (factor) => factor.strategy === 'phone_code'
      );

      if (phoneCodeFactor) {
        await signInAttempt.prepareFirstFactor({
          strategy: 'phone_code',
          phoneNumberId: phoneCodeFactor.phoneNumberId,
        });
        setAuthStep('otp');
        setIsSignUpFlow(false);
      } else {
        setError("This phone number is not registered. Please sign up.");
      }
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
      setError(err.errors ? err.errors[0].longMessage : 'This number is not registered. Please create an account.');
    } finally {
      setIsLoading(false);
    }
  };

  // Logic for Sign-Up (Step 1: Create attempt with phone only)
  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!isSignUpLoaded) return;
    setError('');
    setIsLoading(true);

    try {
      // **FIX:** Only send the phone number to start the sign-up process.
      await signUp.create({
        phoneNumber: `+${phoneNumber}`,
      });

      await signUp.preparePhoneNumberVerification();
      setAuthStep('otp');
      setIsSignUpFlow(true);
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
      setError(err.errors ? err.errors[0].longMessage : 'An error occurred during sign up.');
    } finally {
      setIsLoading(false);
    }
  };

  // Unified OTP Verification with Onboarding Logic (Step 2: Verify and Update)
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP.');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      if (isSignUpFlow) {
        if (!isSignUpLoaded) return;
        const result = await signUp.attemptPhoneNumberVerification({ code: otp });

        // **FIX:** This block will now be correctly entered.
        if (result.status === 'missing_requirements') {
          // Now, update the user with the rest of the form data.
          const updateResult = await signUp.update({
            firstName: formData.firstName,
            lastName: formData.lastName,
            unsafeMetadata: { ...formData }
          });

          if (updateResult.status === 'complete') {
            // 1. Create the user in your database
            const dbUserResponse = await createUserInDb({
              clerkUserId: updateResult.createdUserId,
              ...formData,
              phoneNumber: phoneNumber,
            });

            // 2. Check the onboarding flag from the database response
            const userNeedsOnboarding = !dbUserResponse.data.hasCompletedOnboarding;
            // console.log(dbUserResponse);
            // console.log('onboaing=',userNeedsOnboarding);
            const path = userNeedsOnboarding ? '/onboarding' : '/home';

            // 3. Set the session active and then navigate
            await setSignUpActive({ session: updateResult.createdSessionId });
            navigate(path);
          }
        } else if (result.status === 'complete') {
            // Fallback for robustness
            await setSignUpActive({ session: result.createdSessionId });
            navigate('/home');
        }
      } else {
        // Sign-in flow (existing users go directly to home)
        if (!isSignInLoaded) return;
        const result = await signIn.attemptFirstFactor({ strategy: 'phone_code', code: otp });

        if (result.status === 'complete') {
          await setSignInActive({ session: result.createdSessionId });
          navigate('/home');
        }
      }
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
      setError(err.errors ? (err.response?.data?.message || err.errors[0].longMessage) : 'An error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const goBack = () => {
    if (authStep === 'otp' && isSignUpFlow) setAuthStep('signup');
    else if (authStep === 'otp' && !isSignUpFlow) setAuthStep('login');
    else {
      setAuthStep('initial');
      setError('');
    }
  };

  // --- RENDER FUNCTIONS ---

  const renderInitial = () => (
    <>
      <h2 className="text-2xl font-bold text-center text-gray-800">Welcome</h2>
      <p className="text-center text-gray-500 mb-8">Login or create an account to continue.</p>
      <div className="space-y-4">
        <button onClick={() => setAuthStep('login')} className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition">
          Login with Mobile
        </button>
        <button onClick={() => setAuthStep('signup')} className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition">
          Create New Account
        </button>
      </div>
    </>
  );

  const renderMobileForm = () => (
    <>
      <h2 className="text-2xl font-bold text-center text-gray-800">Login</h2>
      <p className="text-center text-gray-500 mb-8">We'll send you a one-time password.</p>
      <form onSubmit={handleSignIn}>
        <div className="relative mb-4">
          <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <span className="absolute left-10 top-1/2 -translate-y-1/2 text-gray-600 font-semibold">+</span>
          <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="Your mobile number" className="w-full pl-20 pr-3 py-3 border border-gray-300 rounded-lg" required />
        </div>
        <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-300">
          {isLoading ? 'Sending...' : 'Send OTP'}
        </button>
      </form>
    </>
  );

  const renderOtpForm = () => (
    <>
      <h2 className="text-2xl font-bold text-center text-gray-800">Verify OTP</h2>
      <p className="text-center text-gray-500 mb-8">Enter the 6-digit code sent to +{phoneNumber}.</p>
      <form onSubmit={handleVerifyOtp}>
        <div className="relative mb-4">
          <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="6-Digit OTP" className="w-full pl-12 pr-3 py-3 border border-gray-300 rounded-lg" maxLength="6" required />
        </div>
        <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-300">
          {isLoading ? 'Verifying...' : 'Verify & Proceed'}
        </button>
      </form>
    </>
  );

  const renderSignUpForm = () => (
    <>
      <h2 className="text-2xl font-bold text-center text-gray-800">Create Account</h2>
      <p className="text-center text-gray-500 mb-8">Please fill in your details below.</p>
      <form onSubmit={handleSignUp} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderInputField('firstName', 'First Name', 'text', <User />)}
          {renderInputField('lastName', 'Last Name', 'text', <User />)}
        </div>
        {renderInputField('phoneNumber', 'Mobile Number', 'tel', <Smartphone />, true)}
        {renderInputField('address', 'Street Address', 'text', <MapPin />)}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderInputField('city', 'City', 'text', <Building />)}
          {renderInputField('state', 'State', 'text', <Building />)}
        </div>
        {renderInputField('pincode', 'Pincode', 'text', <MapPin />)}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
          <select name="role" value={formData.role} onChange={handleInputChange} className="w-full pl-3 pr-3 py-3 border border-gray-300 rounded-lg bg-white">
            <option value="vendor">Vendor</option>
            <option value="supplier">Supplier</option>
          </select>
        </div>
        <button type="submit" disabled={isLoading} className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 disabled:bg-green-300">
          {isLoading ? 'Processing...' : 'Register & Verify OTP'}
        </button>
      </form>
    </>
  );

  const renderInputField = (name, placeholder, type = 'text', icon, isPhone = false) => (
    <div className="relative">
      {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{React.cloneElement(icon, { size: 20 })}</div>}
      {isPhone && <span className="absolute left-10 top-1/2 -translate-y-1/2 text-gray-600 font-semibold">+</span>}
      <input
        type={type}
        name={name}
        id={name}
        value={name === 'phoneNumber' ? phoneNumber : formData[name]}
        onChange={name === 'phoneNumber' ? (e) => setPhoneNumber(e.target.value) : handleInputChange}
        placeholder={placeholder}
        className={`w-full ${icon ? (isPhone ? 'pl-20' : 'pl-12') : 'pl-3'} pr-3 py-3 border border-gray-300 rounded-lg`}
        required
      />
    </div>
  );

  const renderContent = () => {
    switch (authStep) {
      case 'login': return renderMobileForm();
      case 'signup': return renderSignUpForm();
      case 'otp': return renderOtpForm();
      case 'initial':
      default: return renderInitial();
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center font-sans p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6 relative">
        {authStep !== 'initial' && (
          <button onClick={goBack} className="absolute top-4 left-4 text-gray-500 hover:text-gray-800 transition">
            <ChevronLeft size={24} />
          </button>
        )}
        {renderContent()}
        {error && <p className="text-red-500 text-sm text-center mt-4">{error}</p>}
        <p className="text-xs text-gray-400 text-center mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
