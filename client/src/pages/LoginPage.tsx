import React, { useState } from 'react';
import { UtensilsCrossed, ShieldAlert, KeyRound, Mail, Sparkles, UserPlus, ArrowRight, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

interface LoginPageProps {
  onSuccess: () => void;
  onGoHome: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess, onGoHome }) => {
  const { login, useDemoAccount, isLoading } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email) {
      setError('Please provide your email address');
      return;
    }

    if (isRegistering && !name) {
      setError('Please provide your full name');
      return;
    }

    if (isRegistering) {
      try {
        const { api } = await import('../services/api');
        const res = await api.register(name, email, password);
        if (res.success) {
          setIsRegistering(false);
          setError('Registration successful! Please sign in.');
        } else {
          setError(res.error || 'Registration failed. Email might be in use.');
        }
      } catch (err: any) {
        setError(err.message || 'Registration failed.');
      }
      return;
    }

    const success = await login(email, password);
    if (success) {
      onSuccess();
    } else {
      setError('Invalid credentials. Please click "Use Demo Account" for instant evaluation.');
    }
  };

  const handleDemoLogin = async () => {
    setError(null);
    setEmail('admin@smartmess.edu');
    setPassword('admin123');
    const success = await useDemoAccount();
    if (success) {
      onSuccess();
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row overflow-hidden">
      
      {/* LEFT PANE - Branding (Hidden on mobile, visible on md and up) */}
      <div className="hidden md:flex md:w-1/2 bg-white p-12 flex-col justify-between relative overflow-hidden">
        {/* Abstract Background Elements Removed */}

        <div className="relative z-10">
          <button
            onClick={onGoHome}
            className="text-slate-500 hover:text-slate-900 text-sm flex items-center gap-2 transition-colors font-medium mb-12"
          >
            ← Back to Overview
          </button>
          
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-slate-50/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-slate-900 shadow-lg">
              <UtensilsCrossed className="w-7 h-7" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">SMART MESS</h1>
          </div>
          
          <h2 className="text-4xl font-bold text-slate-900 leading-tight mb-6">
            Predict. Prepare.<br />
            <span className="text-blue-600">Zero Waste. Zero Shortages.</span>
          </h2>
          <p className="text-slate-600 text-lg max-w-md leading-relaxed">
            Empowering university mess administrators with AI-driven meal demand forecasting, student turnout analytics, and inventory safeguards.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-4">
          <div className="flex -space-x-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-900 bg-blue-200 flex items-center justify-center shadow-sm">
                <User className="w-5 h-5 text-slate-700" />
              </div>
            ))}
          </div>
          <p className="text-slate-600 text-sm font-medium">Trusted by 50+ campus dining facilities</p>
        </div>
      </div>

      {/* RIGHT PANE - Auth Form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-6 md:p-12 relative bg-white">
        
        {/* Mobile back button */}
        <button
          onClick={onGoHome}
          className="md:hidden absolute top-6 left-6 text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1.5 transition-colors font-medium"
        >
          ← Back
        </button>

        <div className="w-full max-w-md">
          {/* Form Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">
              {isRegistering ? 'Create an Account' : 'Welcome Back'}
            </h2>
            <p className="text-sm text-slate-500">
              {isRegistering 
                ? 'Join Smart Mess to streamline your dining operations.' 
                : 'Sign in to access your operations dashboard.'}
            </p>
          </div>

          {/* Demo Account Banner (Only on Login) */}
          {!isRegistering && (
            <div className="mb-8 p-4 rounded-xl bg-white border border-slate-200 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-[40px] -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-700"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-blue-700 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-blue-600" /> Hackathon Evaluation Access
                  </span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700 border border-blue-200">
                    1-Click
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-3">
                  Instantly authenticate as Chief Warden with pre-seeded demo records.
                </p>
                <button
                  type="button"
                  onClick={handleDemoLogin}
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-600/20 active:scale-[0.98]"
                >
                  Use Demo Account (Admin) <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Divider */}
          {!isRegistering && (
            <div className="relative flex py-2 items-center mb-8">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink mx-4 text-xs text-slate-500 uppercase font-semibold tracking-wider">Or continue with email</span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>
          )}

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`mb-6 p-4 rounded-xl border text-sm flex items-start gap-3 ${
                  error.includes('successful') 
                  ? 'bg-green-50 border-green-200 text-green-700' 
                  : 'bg-red-50 border-red-200 text-red-700'
                }`}
              >
                <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed font-medium">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Auth Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {isRegistering && (
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-500">Full Name</label>
                <div className="relative group">
                  <UserPlus className="w-5 h-5 text-slate-500 absolute left-3.5 top-3 transition-colors group-focus-within:text-slate-900" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Dr. K. Sharma"
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-slate-50 focus:outline-none focus:border-slate-200 focus:ring-4 focus:ring-slate-800/10 transition-all placeholder:text-slate-500 font-medium"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-500">Email Address</label>
              <div className="relative group">
                <Mail className="w-5 h-5 text-slate-500 absolute left-3.5 top-3 transition-colors group-focus-within:text-slate-900" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@smartmess.edu"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-slate-50 focus:outline-none focus:border-slate-200 focus:ring-4 focus:ring-slate-800/10 transition-all placeholder:text-slate-500 font-medium"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-semibold text-slate-500">Password</label>
                {!isRegistering && (
                  <a href="#" className="text-xs font-semibold text-slate-900 hover:text-blue-700 transition-colors">
                    Forgot password?
                  </a>
                )}
              </div>
              <div className="relative group">
                <KeyRound className="w-5 h-5 text-slate-500 absolute left-3.5 top-3 transition-colors group-focus-within:text-slate-900" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-slate-50 focus:outline-none focus:border-slate-200 focus:ring-4 focus:ring-slate-800/10 transition-all placeholder:text-slate-500 font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-xl shadow-blue-600/20 active:scale-[0.98] mt-2"
            >
              {isLoading 
                ? (isRegistering ? 'Creating account...' : 'Signing in...') 
                : (isRegistering ? 'Create Account' : 'Sign In')}
            </button>
          </form>

          {/* Toggle Register/Login */}
          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500 font-medium">
              {isRegistering ? "Already have an account?" : "Don't have an account?"}{' '}
              <button 
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setError(null);
                }}
                className="text-slate-900 font-bold hover:text-blue-700 hover:underline transition-all"
              >
                {isRegistering ? 'Sign in instead' : 'Create one now'}
              </button>
            </p>
          </div>

          {/* Security Footer */}
          <div className="mt-12 text-center text-slate-500 text-xs font-medium flex items-center justify-center gap-3">
            <span>Protected by Campus Security Layer</span>
            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
            <span>RBAC Secured</span>
          </div>

        </div>
      </div>
    </div>
  );
};
