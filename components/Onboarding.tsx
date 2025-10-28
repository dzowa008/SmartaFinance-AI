import React, { useState } from 'react';
import { UserProfile } from '../types';
import { LogoIcon, UserIcon, CalendarIcon, GlobeIcon, DollarIcon, TargetIcon, CheckCircleIcon, MapPinIcon, XCircleIcon } from './Icons';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

const ProgressBar: React.FC<{ step: number; totalSteps: number }> = ({ step, totalSteps }) => {
  const percentage = (step / totalSteps) * 100;
  return (
    <div className="w-full bg-slate-200 dark:bg-navy-800 rounded-full h-2 mb-8">
      <div
        className="bg-soft-green-500 h-2 rounded-full transition-all duration-500"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<UserProfile>({
    fullName: '',
    dateOfBirth: '',
    country: '',
    locationVerified: false,
    monthlyIncome: 0,
    financialGoal: '',
  });
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'verifying' | 'verified' | 'error'>('idle');
  const [verificationMessage, setVerificationMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ 
        ...prev, 
        [name]: name === 'monthlyIncome' ? parseInt(value, 10) || 0 : value 
    }));
  };

  const handleVerifyLocation = () => {
    if (!navigator.geolocation) {
      setVerificationStatus('error');
      setVerificationMessage("Geolocation is not supported by your browser.");
      return;
    }

    setVerificationStatus('verifying');
    setVerificationMessage("Checking your location...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log("User location found:", position.coords);
        // In a real app, you would send these coordinates to a reverse-geocoding API
        // to get the country name and compare it with `profile.country`.
        // For this demo, we will simulate a successful verification.
        setTimeout(() => {
            setVerificationStatus('verified');
            setVerificationMessage("Location verified successfully!");
            setProfile(prev => ({ ...prev, locationVerified: true }));
        }, 1500); // Simulate network delay
      },
      (error) => {
        console.error("Geolocation error:", error.message);
        setVerificationStatus('error');
        switch(error.code) {
            case error.PERMISSION_DENIED:
                setVerificationMessage("Location access denied. Please enable it in your browser settings.");
                break;
            case error.POSITION_UNAVAILABLE:
                setVerificationMessage("Location information is currently unavailable.");
                break;
            case error.TIMEOUT:
                setVerificationMessage("The request to get your location timed out. Please try again.");
                break;
            default:
                setVerificationMessage(`An error occurred: ${error.message}`);
                break;
        }
      }
    );
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const handleComplete = () => {
    // Basic validation before completing
    if (profile.fullName && profile.dateOfBirth && profile.country && profile.monthlyIncome > 0 && profile.financialGoal) {
        onComplete(profile);
    } else {
        alert("Please fill out all fields before proceeding.");
    }
  };

  const VerificationStatus = () => {
    if (verificationStatus === 'idle') return null;

    const styles = {
        verifying: { text: 'text-slate-500', icon: <div className="h-4 w-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" /> },
        verified: { text: 'text-soft-green-600', icon: <CheckCircleIcon className="h-4 w-4" /> },
        error: { text: 'text-red-500', icon: <XCircleIcon className="h-4 w-4" /> },
    }
    const currentStyle = styles[verificationStatus];

    return (
        <div className={`flex items-center gap-2 text-sm mt-2 ${currentStyle.text}`}>
            {currentStyle.icon}
            <span>{verificationMessage}</span>
        </div>
    )
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold font-heading text-slate-800 dark:text-slate-100">Let's get to know you</h2>
            <p className="text-slate-500 dark:text-slate-400">First, tell us a bit about yourself.</p>
            <div>
              <label htmlFor="fullName" className="text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
              <div className="relative mt-2">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                   <UserIcon className="h-5 w-5 text-slate-400" />
                </div>
                <input id="fullName" name="fullName" type="text" value={profile.fullName} onChange={handleChange} required className="w-full pl-10 pr-4 py-3 rounded-lg bg-slate-100 dark:bg-navy-800 focus:ring-2 focus:ring-soft-green-500 outline-none" placeholder="John Doe"/>
              </div>
            </div>
             <div>
              <label htmlFor="dateOfBirth" className="text-sm font-medium text-slate-700 dark:text-slate-300">Date of Birth</label>
              <div className="relative mt-2">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                   <CalendarIcon className="h-5 w-5 text-slate-400" />
                </div>
                <input id="dateOfBirth" name="dateOfBirth" type="date" value={profile.dateOfBirth} onChange={handleChange} required className="w-full pl-10 pr-4 py-3 rounded-lg bg-slate-100 dark:bg-navy-800 focus:ring-2 focus:ring-soft-green-500 outline-none"/>
              </div>
            </div>
             <div>
              <label htmlFor="country" className="text-sm font-medium text-slate-700 dark:text-slate-300">Country</label>
                <div className="flex items-center gap-2 mt-2">
                    <div className="relative flex-grow">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                           <GlobeIcon className="h-5 w-5 text-slate-400" />
                        </div>
                        <input id="country" name="country" type="text" value={profile.country} onChange={handleChange} required className="w-full pl-10 pr-4 py-3 rounded-lg bg-slate-100 dark:bg-navy-800 focus:ring-2 focus:ring-soft-green-500 outline-none" placeholder="United States"/>
                    </div>
                    <button 
                        type="button" 
                        onClick={handleVerifyLocation} 
                        disabled={verificationStatus === 'verifying' || verificationStatus === 'verified'}
                        className="py-3 px-4 rounded-lg bg-navy-700 text-white hover:bg-navy-600 disabled:bg-slate-300 dark:disabled:bg-navy-700 transition flex items-center gap-2"
                    >
                        <MapPinIcon className="h-5 w-5" />
                        <span className="hidden sm:inline">Verify Location</span>
                    </button>
                </div>
                <VerificationStatus />
            </div>
            <button onClick={nextStep} className="w-full py-3 px-4 rounded-lg text-white bg-soft-green-600 hover:bg-soft-green-700 font-medium">Continue</button>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold font-heading text-slate-800 dark:text-slate-100">Your Financial Profile</h2>
            <p className="text-slate-500 dark:text-slate-400">This helps us tailor our advice for you.</p>
            <div>
              <label htmlFor="monthlyIncome" className="text-sm font-medium text-slate-700 dark:text-slate-300">Monthly Income (USD)</label>
               <div className="relative mt-2">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                   <DollarIcon className="h-5 w-5 text-slate-400" />
                </div>
                 <input id="monthlyIncome" name="monthlyIncome" type="number" value={profile.monthlyIncome} onChange={handleChange} required className="w-full pl-10 pr-4 py-3 rounded-lg bg-slate-100 dark:bg-navy-800 focus:ring-2 focus:ring-soft-green-500 outline-none" placeholder="e.g., 5000" />
               </div>
            </div>
            <div>
              <label htmlFor="financialGoal" className="text-sm font-medium text-slate-700 dark:text-slate-300">Primary Financial Goal</label>
               <div className="relative mt-2">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                   <TargetIcon className="h-5 w-5 text-slate-400" />
                </div>
                 <select id="financialGoal" name="financialGoal" value={profile.financialGoal} onChange={handleChange} required className="w-full pl-10 pr-4 py-3 rounded-lg bg-slate-100 dark:bg-navy-800 appearance-none focus:ring-2 focus:ring-soft-green-500 outline-none">
                    <option value="" disabled>Select a goal</option>
                    <option value="save_big">Save for a big purchase</option>
                    <option value="invest">Invest for retirement</option>
                    <option value="pay_debt">Pay off debt</option>
                    <option value="build_wealth">Build wealth</option>
                 </select>
               </div>
            </div>
            <div className="flex gap-4">
                <button onClick={prevStep} className="w-full py-3 px-4 rounded-lg bg-slate-200 dark:bg-navy-700 hover:bg-slate-300 dark:hover:bg-navy-600 font-medium">Back</button>
                <button onClick={nextStep} className="w-full py-3 px-4 rounded-lg text-white bg-soft-green-600 hover:bg-soft-green-700 font-medium">Continue</button>
            </div>
          </div>
        );
      case 3:
        return (
            <div className="text-center">
                <CheckCircleIcon className="h-16 w-16 text-soft-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold font-heading text-slate-800 dark:text-slate-100">You're All Set!</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-2">Your profile is complete. Let's set up the foundation of your budget.</p>
                <button onClick={handleComplete} className="w-full mt-8 py-3 px-4 rounded-lg text-white bg-soft-green-600 hover:bg-soft-green-700 font-medium">Go to Financial Hub</button>
            </div>
        )
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-navy-950 p-4 transition-colors duration-300">
      <div className="w-full max-w-md">
         <div className="flex flex-col items-center mb-6">
            <LogoIcon className="h-12 w-12 text-soft-green-500" />
            <h1 className="text-2xl font-bold font-heading mt-2 text-slate-900 dark:text-white">Welcome to SmartFinance</h1>
          </div>
        <div className="bg-white dark:bg-navy-900 rounded-2xl shadow-lg p-8">
          <ProgressBar step={step} totalSteps={3} />
          {renderStep()}
        </div>
      </div>
    </div>
  );
};