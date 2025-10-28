
import React, { useState, useEffect } from 'react';
import { SignIn } from './components/SignIn';
import { SignUp } from './components/SignUp';
import { MainApp } from './components/MainApp';
import { Onboarding } from './components/Onboarding';
import { UserProfile } from './types';

type AuthView = 'signIn' | 'signUp';
type InitialView = 'dashboard' | 'financialHub';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authView, setAuthView] = useState<AuthView>('signIn');
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [initialView, setInitialView] = useState<InitialView>('dashboard');
  
  useEffect(() => {
    // Check for a token and onboarding status to persist login state.
    const token = localStorage.getItem('authToken');
    const hasCompletedOnboarding = localStorage.getItem('hasCompletedOnboarding') === 'true';
    
    if (token) {
      setIsAuthenticated(true);
      if (hasCompletedOnboarding) {
        const savedProfile = localStorage.getItem('userProfile');
        if (savedProfile) {
          setUserProfile(JSON.parse(savedProfile));
        }
        setNeedsOnboarding(false);
      } else {
        // This case is for a user who signed up but didn't finish onboarding.
        setNeedsOnboarding(true);
      }
    }
  }, []);

  const handleSignInSuccess = () => {
    localStorage.setItem('authToken', 'your_jwt_token_here');
    // For existing users, we assume onboarding is complete.
    localStorage.setItem('hasCompletedOnboarding', 'true');
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
        setUserProfile(JSON.parse(savedProfile));
    }
    setIsAuthenticated(true);
    setNeedsOnboarding(false);
    setInitialView('dashboard'); // Default for sign-in
  };
  
  const handleSignUpSuccess = () => {
    localStorage.setItem('authToken', 'your_jwt_token_for_new_user');
    // A new user has not completed onboarding.
    localStorage.removeItem('hasCompletedOnboarding');
    localStorage.removeItem('userProfile');
    setIsAuthenticated(true);
    setNeedsOnboarding(true);
  };

  const handleOnboardingComplete = (profile: UserProfile) => {
    localStorage.setItem('hasCompletedOnboarding', 'true');
    localStorage.setItem('userProfile', JSON.stringify(profile));
    setUserProfile(profile);
    setNeedsOnboarding(false);
    setInitialView('financialHub'); // Guide user to the next step
  };

  const handleSignOut = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('hasCompletedOnboarding');
    localStorage.removeItem('userProfile');
    setIsAuthenticated(false);
    setNeedsOnboarding(false);
    setUserProfile(null);
    setAuthView('signIn');
  };
  
  useEffect(() => {
    const isDarkMode = localStorage.getItem('theme') === 'dark' || 
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  if (!isAuthenticated) {
    if (authView === 'signIn') {
      return <SignIn onSignInSuccess={handleSignInSuccess} onSwitchToSignUp={() => setAuthView('signUp')} />;
    }
    return <SignUp onSignUpSuccess={handleSignUpSuccess} onSwitchToSignIn={() => setAuthView('signIn')} />;
  }

  if (needsOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }
  
  if (userProfile) {
    return <MainApp userProfile={userProfile} onSignOut={handleSignOut} initialView={initialView} />;
  }

  // Fallback for the brief moment profile is loading
  return <div className="min-h-screen bg-slate-50 dark:bg-navy-950"></div>;
};

export default App;