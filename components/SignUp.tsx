import React from 'react';
import { LogoIcon, GoogleIcon, AppleIcon, MailIcon, LockIcon, UserIcon } from './Icons';

interface SignUpProps {
  onSignUpSuccess: () => void;
  onSwitchToSignIn: () => void;
}

export const SignUp: React.FC<SignUpProps> = ({ onSignUpSuccess, onSwitchToSignIn }) => {
  const handleSignUp = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    onSignUpSuccess();
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-navy-950 p-4 transition-colors duration-300">
      <div className="w-full max-w-4xl bg-white dark:bg-navy-900 rounded-2xl shadow-lg flex overflow-hidden">
        {/* Left Side - Branding */}
        <div className="hidden md:flex flex-col items-center justify-center w-1/2 bg-navy-800 p-12 text-white">
          <LogoIcon className="h-16 w-16 text-soft-green-500" />
          <h1 className="text-3xl font-bold font-heading mt-4 text-center">Create Your Account</h1>
          <p className="text-navy-200 mt-2 text-center">Join SmartFinance AI and start your journey to financial clarity.</p>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 p-8 sm:p-12">
           <div className="md:hidden flex flex-col items-center mb-6">
            <LogoIcon className="h-12 w-12 text-soft-green-500" />
            <h1 className="text-2xl font-bold font-heading mt-2 text-slate-900 dark:text-white">Create Account</h1>
          </div>
          <h2 className="hidden md:block text-2xl font-bold font-heading text-slate-800 dark:text-slate-100">Create Account</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Get started in just a few clicks.</p>

          <form className="mt-8 space-y-6">
            <div>
              <label htmlFor="fullName" className="text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
              <div className="relative mt-2">
                 <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                   <UserIcon className="h-5 w-5 text-slate-400" />
                 </div>
                <input 
                  id="fullName" 
                  name="fullName" 
                  type="text" 
                  autoComplete="name" 
                  required 
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-slate-100 dark:bg-navy-800 border border-transparent focus:ring-2 focus:ring-soft-green-500 focus:outline-none transition" 
                  placeholder="John Doe"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
              <div className="relative mt-2">
                 <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                   <MailIcon className="h-5 w-5 text-slate-400" />
                 </div>
                <input 
                  id="email" 
                  name="email" 
                  type="email" 
                  autoComplete="email" 
                  required 
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-slate-100 dark:bg-navy-800 border border-transparent focus:ring-2 focus:ring-soft-green-500 focus:outline-none transition" 
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
              <div className="relative mt-2">
                 <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                   <LockIcon className="h-5 w-5 text-slate-400" />
                 </div>
                <input 
                  id="password" 
                  name="password" 
                  type="password" 
                  autoComplete="new-password" 
                  required 
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-slate-100 dark:bg-navy-800 border border-transparent focus:ring-2 focus:ring-soft-green-500 focus:outline-none transition" 
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                onClick={handleSignUp}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-soft-green-600 hover:bg-soft-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-soft-green-500 transition-transform hover:scale-[1.02]"
              >
                Create Account
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300 dark:border-navy-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-navy-900 text-slate-500 dark:text-slate-400">Or sign up with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button onClick={handleSignUp} className="w-full inline-flex justify-center items-center py-3 px-4 border border-slate-300 dark:border-navy-700 rounded-lg shadow-sm bg-white dark:bg-navy-800 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-navy-700 transition">
                <GoogleIcon className="w-5 h-5 mr-2" />
                <span>Google</span>
              </button>
              <button onClick={handleSignUp} className="w-full inline-flex justify-center items-center py-3 px-4 border border-slate-300 dark:border-navy-700 rounded-lg shadow-sm bg-white dark:bg-navy-800 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-navy-700 transition">
                <AppleIcon className="w-5 h-5 mr-2" />
                <span>Apple</span>
              </button>
            </div>
          </div>
          
          <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <button onClick={onSwitchToSignIn} className="font-medium text-soft-green-600 hover:text-soft-green-500">
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
