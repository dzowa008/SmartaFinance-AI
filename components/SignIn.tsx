import React from 'react';
import { LogoIcon, MailIcon, LockIcon, GoogleIcon } from './Icons';

interface SignInProps {
  onSignInSuccess: () => void;
  onSwitchToSignUp: () => void;
  onGoogleSignIn: () => void;
}

export const SignIn: React.FC<SignInProps> = ({ onSignInSuccess, onSwitchToSignUp, onGoogleSignIn }) => {
  // In a real application, form state and submission logic would be handled here.
  // For this demonstration, we simulate a successful login by calling the callback on button click.
  const handleSignIn = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    onSignInSuccess();
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4 transition-colors duration-300">
      <div className="w-full max-w-4xl bg-card text-card-foreground rounded-xl border border-border flex overflow-hidden">
        {/* Left Side - Branding */}
        <div className="hidden md:flex flex-col items-center justify-center w-1/2 bg-primary p-12 text-primary-foreground">
          <LogoIcon className="h-16 w-16" />
          <h1 className="text-3xl font-bold font-heading mt-4 text-center">SmartFinance AI</h1>
          <p className="text-primary-foreground/80 mt-2 text-center">Take control of your financial future. Intelligently.</p>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 p-8 sm:p-12">
          <div className="md:hidden flex flex-col items-center mb-6">
            <LogoIcon className="h-12 w-12 text-primary" />
            <h1 className="text-2xl font-bold font-heading mt-2">Welcome Back</h1>
          </div>
          <h2 className="hidden md:block text-2xl font-bold font-heading text-foreground">Welcome Back</h2>
          <p className="text-muted-foreground mt-1">Sign in to access your dashboard.</p>

          <form className="mt-8 space-y-6">
            <div>
              <label htmlFor="email" className="text-sm font-medium text-foreground">Email Address</label>
              <div className="relative mt-2">
                 <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                   <MailIcon className="h-5 w-5 text-muted-foreground" />
                 </div>
                <input 
                  id="email" 
                  name="email" 
                  type="email" 
                  autoComplete="email" 
                  required 
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-input border border-border focus:ring-2 focus:ring-ring focus:outline-none transition" 
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium text-foreground">Password</label>
                <a href="#" className="text-sm font-medium text-primary hover:text-primary/90">
                  Forgot password?
                </a>
              </div>
              <div className="relative mt-2">
                 <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                   <LockIcon className="h-5 w-5 text-muted-foreground" />
                 </div>
                <input 
                  id="password" 
                  name="password" 
                  type="password" 
                  autoComplete="current-password" 
                  required 
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-input border border-border focus:ring-2 focus:ring-ring focus:outline-none transition" 
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                onClick={handleSignIn}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-transform hover:scale-[1.02]"
              >
                Sign In
              </button>
            </div>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-card px-2 text-muted-foreground">OR</span>
            </div>
          </div>

          <div>
            <button
              onClick={onGoogleSignIn}
              className="w-full flex justify-center items-center gap-3 py-3 px-4 border border-border rounded-lg text-sm font-medium text-foreground bg-card hover:bg-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring transition-transform hover:scale-[1.02]"
            >
              <GoogleIcon className="h-5 w-5" />
              Sign in with Google
            </button>
          </div>
          
          <p className="mt-8 text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <button onClick={onSwitchToSignUp} className="font-medium text-primary hover:text-primary/90">
              Sign Up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};