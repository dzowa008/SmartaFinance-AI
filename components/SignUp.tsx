import React from 'react';
import { LogoIcon, MailIcon, LockIcon, UserIcon, GoogleIcon } from './Icons';

interface SignUpProps {
  onSignUpSuccess: () => void;
  onSwitchToSignIn: () => void;
  onGoogleSignIn: () => void;
}

export const SignUp: React.FC<SignUpProps> = ({ onSignUpSuccess, onSwitchToSignIn, onGoogleSignIn }) => {
  const handleSignUp = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    onSignUpSuccess();
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4 transition-colors duration-300">
      <div className="w-full max-w-4xl bg-card text-card-foreground rounded-xl border border-border flex overflow-hidden">
        {/* Left Side - Branding */}
        <div className="hidden md:flex flex-col items-center justify-center w-1/2 bg-primary p-12 text-primary-foreground">
          <LogoIcon className="h-16 w-16" />
          <h1 className="text-3xl font-bold font-heading mt-4 text-center">Create Your Account</h1>
          <p className="text-primary-foreground/80 mt-2 text-center">Join SmartFinance AI and start your journey to financial clarity.</p>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 p-8 sm:p-12">
           <div className="md:hidden flex flex-col items-center mb-6">
            <LogoIcon className="h-12 w-12 text-primary" />
            <h1 className="text-2xl font-bold font-heading mt-2">Create Account</h1>
          </div>
          <h2 className="hidden md:block text-2xl font-bold font-heading text-foreground">Create Account</h2>
          <p className="text-muted-foreground mt-1">Get started in just a few clicks.</p>

          <form className="mt-8 space-y-6">
            <div>
              <label htmlFor="fullName" className="text-sm font-medium text-foreground">Full Name</label>
              <div className="relative mt-2">
                 <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                   <UserIcon className="h-5 w-5 text-muted-foreground" />
                 </div>
                <input 
                  id="fullName" 
                  name="fullName" 
                  type="text" 
                  autoComplete="name" 
                  required 
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-input border border-border focus:ring-2 focus:ring-ring focus:outline-none transition" 
                  placeholder="John Doe"
                />
              </div>
            </div>
            
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
              <label htmlFor="password" className="text-sm font-medium text-foreground">Password</label>
              <div className="relative mt-2">
                 <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                   <LockIcon className="h-5 w-5 text-muted-foreground" />
                 </div>
                <input 
                  id="password" 
                  name="password" 
                  type="password" 
                  autoComplete="new-password" 
                  required 
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-input border border-border focus:ring-2 focus:ring-ring focus:outline-none transition" 
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                onClick={handleSignUp}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-transform hover:scale-[1.02]"
              >
                Create Account
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
              Sign up with Google
            </button>
          </div>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <button onClick={onSwitchToSignIn} className="font-medium text-primary hover:text-primary/90">
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};