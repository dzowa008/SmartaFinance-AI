

import React, { useState, useEffect } from 'react';
import { SignIn } from './components/SignIn';
import { SignUp } from './components/SignUp';
import { MainApp } from './components/MainApp';
import { Onboarding } from './components/Onboarding';
import { UserProfile } from './types';
import { db } from './services/dbService';

type AuthView = 'signIn' | 'signUp';
type InitialView = 'dashboard' | 'financialHub';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authView, setAuthView] = useState<AuthView>('signIn');
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [initialView, setInitialView] = useState<InitialView>('dashboard');
  
  useEffect(() => {
    const checkAuthStatus = async () => {
      setIsLoading(true);
      const token = localStorage.getItem('authToken');
      if (token) {
        setIsAuthenticated(true);
        const profile = await db.getUserProfile();
        if (profile) {
          setUserProfile(profile);
          setNeedsOnboarding(false);
        } else {
          setNeedsOnboarding(true);
        }
      } else {
        setIsAuthenticated(false);
        setNeedsOnboarding(false);
      }
      setIsLoading(false);
    };

    checkAuthStatus();
  }, []);

  const handleSignInSuccess = async () => {
    localStorage.setItem('authToken', 'your_jwt_token_here');
    const profile = await db.getUserProfile();
    setIsAuthenticated(true);
    if (profile) {
      setUserProfile(profile);
      setNeedsOnboarding(false);
    } else {
      setNeedsOnboarding(true);
    }
    setInitialView('dashboard');
  };
  
  const handleSignUpSuccess = async () => {
    localStorage.setItem('authToken', 'your_jwt_token_for_new_user');
    setIsAuthenticated(true);
    setNeedsOnboarding(true);
  };

  const handleGoogleSignInSuccess = async () => {
    localStorage.setItem('authToken', 'your_jwt_token_from_google');
    const profile = await db.getUserProfile();
    setIsAuthenticated(true);
    if (profile) {
      setUserProfile(profile);
      setNeedsOnboarding(false);
      setInitialView('dashboard');
    } else {
      setNeedsOnboarding(true);
    }
  };

  const handleOnboardingComplete = async (profile: UserProfile) => {
    await db.putUserProfile(profile);
    setUserProfile(profile);
    setNeedsOnboarding(false);
    setInitialView('financialHub');
  };

  const handleSignOut = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
    setNeedsOnboarding(false);
    setUserProfile(null);
    setAuthView('signIn');
  };
  
  useEffect(() => {
    const applyTheme = async () => {
        const settings = await db.getSettings();
        const theme = settings ? settings.theme : 'dark'; // Default to dark if no settings
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };
    applyTheme();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (authView === 'signIn') {
      return <SignIn onSignInSuccess={handleSignInSuccess} onSwitchToSignUp={() => setAuthView('signUp')} onGoogleSignIn={handleGoogleSignInSuccess} />;
    }
    return <SignUp onSignUpSuccess={handleSignUpSuccess} onSwitchToSignIn={() => setAuthView('signIn')} onGoogleSignIn={handleGoogleSignInSuccess} />;
  }

  if (needsOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }
  
  if (userProfile) {
    return <MainApp userProfile={userProfile} onSignOut={handleSignOut} initialView={initialView} />;
  }

  // Fallback for the brief moment profile is loading or in an inconsistent state
  return <div className="min-h-screen bg-background"></div>;
};

export default App;