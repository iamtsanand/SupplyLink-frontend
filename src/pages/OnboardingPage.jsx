import React, { useState } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { completeOnboarding } from '../utils/api';
import { Building, Handshake, Languages, ArrowRight } from 'lucide-react';

// Import all language files
import en from '../locales/en.json';
import hi from '../locales/hi.json';
import pa from '../locales/pa.json'; // Import Punjabi
import bn from '../locales/bn.json';
import mr from '../locales/mr.json';
import te from '../locales/te.json';
import ta from '../locales/ta.json';
import gu from '../locales/gu.json';
import ur from '../locales/ur.json';
import kn from '../locales/kn.json';

const translations = { en, hi, pa, bn, mr, te, ta, gu, ur, kn }; // Add Punjabi to translations

const OnboardingPage = () => {
    const { user } = useUser();
    const { userId } = useAuth();
    const navigate = useNavigate();
    
    const [step, setStep] = useState(1);
    const [lang, setLang] = useState('en');
    const [isCompleting, setIsCompleting] = useState(false);

    const t = translations[lang];
    const role = user?.unsafeMetadata?.role;

    const handleFinish = async () => {
        setIsCompleting(true);
        try {
            await completeOnboarding({ clerkUserId: userId });
            navigate('/home');
        } catch (error) {
            console.error("Failed to complete onboarding:", error);
            alert("Could not finalize onboarding. Please try again.");
            setIsCompleting(false);
        }
    };

    const renderStep = () => {
        if (step === 1) {
            return (
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">{t.welcomeTitle}</h1>
                    <p className="mt-4 text-gray-600">{t.welcomeMessage}</p>
                </div>
            );
        }
        if (step === 2) {
            const isVendor = role === 'vendor';
            const title = isVendor ? t.vendorGuideTitle : t.supplierGuideTitle;
            const Icon = isVendor ? Building : Handshake;
            const steps = isVendor 
                ? [t.vendorStep1, t.vendorStep2, t.vendorStep3]
                : [t.supplierStep1, t.supplierStep2, t.supplierStep3];

            return (
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center"><Icon className="mr-3"/> {title}</h1>
                    <ul className="mt-6 space-y-4">
                        {steps.map((s, index) => (
                            <li key={index} className="flex items-start">
                                <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded-full font-bold mr-4">{index + 1}</span>
                                <span className="text-gray-700">{s}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            );
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 font-sans">
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8 relative">
                <div className="absolute top-4 right-4">
                    <div className="flex items-center bg-gray-200 rounded-full p-1">
                        <Languages className="w-5 h-5 text-gray-600 mx-2"/>
                        <select 
                            value={lang} 
                            onChange={(e) => setLang(e.target.value)}
                            className="bg-transparent font-semibold text-gray-700 focus:outline-none"
                        >
                            <option value="en">English</option>
                            <option value="hi">हिन्दी</option>
                            <option value="pa">ਪੰਜਾਬੀ</option> {/* Add Punjabi option */}
                            <option value="bn">বাংলা</option>
                            <option value="mr">मराठी</option>
                            <option value="te">తెలుగు</option>
                            <option value="ta">தமிழ்</option>
                            <option value="gu">ગુજરાતી</option>
                            <option value="ur">اردو</option>
                            <option value="kn">ಕನ್ನಡ</option>
                        </select>
                    </div>
                </div>

                <div className="mt-8">
                    {renderStep()}
                </div>

                <div className="mt-10 flex justify-end">
                    {step === 1 && (
                        <button onClick={() => setStep(2)} className="flex items-center bg-blue-600 text-white py-2 px-6 rounded-lg font-semibold hover:bg-blue-700 transition">
                            {t.nextButton} <ArrowRight className="w-5 h-5 ml-2"/>
                        </button>
                    )}
                    {step === 2 && (
                        <button onClick={handleFinish} disabled={isCompleting} className="bg-green-600 text-white py-2 px-6 rounded-lg font-semibold hover:bg-green-700 transition disabled:bg-green-300">
                            {isCompleting ? 'Finalizing...' : t.finishButton}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OnboardingPage;
