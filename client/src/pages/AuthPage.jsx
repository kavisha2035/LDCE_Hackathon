import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Compass, Mail, Lock, User, Eye, EyeOff, ArrowRight, CheckCircle, AlertCircle, Globe, Image, Upload, KeyRound, ArrowLeft } from 'lucide-react';

export default function AuthPage({ onSuccess, mode, resetToken, initialIsLogin, reason }) {
  const { login, signup } = useAuth();
  const [isLogin, setIsLogin] = useState(
    mode === 'signup' ? false : (initialIsLogin !== undefined ? initialIsLogin : true)
  );
  const [isForgot, setIsForgot] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [avatar, setAvatar] = useState('');
  const [languagePref, setLanguagePref] = useState('en');
  
  // Reset password states
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Feedback states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  const validateEmail = (val) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(val).toLowerCase().trim());
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        setError('Image file must be under 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle password reset submission
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!newPassword || newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please try again.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetToken, newPassword })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to reset password.');
      }

      setResetSuccess(true);
      setMessage(data.message);
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      if (isForgot) {
        const res = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.toLowerCase().trim() })
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || 'Failed to request password reset.');
        }
        setMessage(data.message);
      } else if (isLogin) {
        const data = await login(email.toLowerCase().trim(), password);
        if (onSuccess) onSuccess(data?.user);
      } else {
        const data = await signup(name, email.toLowerCase().trim(), password, languagePref, avatar);
        if (onSuccess) onSuccess(data?.user);
      }
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 bg-map-pattern">
      <div className="w-full max-w-md bg-[#1A1D23] text-white shadow-2xl overflow-hidden border-t-4 border-[#F5B800] rounded-3xl">
        
        {/* Wanderers Header Tabs */}
        {!isForgot && mode !== 'reset' && (
          <div className="grid grid-cols-2 text-center border-b border-white/10 font-sans font-bold text-xs uppercase tracking-wider">
            <button
              type="button"
              onClick={() => { setIsLogin(true); setIsForgot(false); setError(''); setMessage(''); }}
              className={`py-4 transition cursor-pointer ${
                isLogin ? 'bg-[#252B33] text-[#F5B800] border-b-2 border-[#F5B800]' : 'text-gray-400 hover:text-white'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => { setIsLogin(false); setIsForgot(false); setError(''); setMessage(''); }}
              className={`py-4 transition cursor-pointer ${
                !isLogin ? 'bg-[#252B33] text-[#F5B800] border-b-2 border-[#F5B800]' : 'text-gray-400 hover:text-white'
              }`}
            >
              Register
            </button>
          </div>
        )}

        <div className="p-8 space-y-6">
          
          {/* Handwritten Yellow Brand Accent */}
          <div className="text-center space-y-1">
            <span className="font-script text-[#F5B800] text-4xl block transform -rotate-3">
              GlobeTrotter
            </span>
            <h2 className="font-serif text-xl font-bold tracking-wider uppercase text-white">
              {mode === 'reset' ? 'SET NEW PASSPHRASE' : isForgot ? 'RECOVER PASSPHRASE' : isLogin ? 'WELCOME BACK' : 'CREATE ACCOUNT'}
            </h2>
          </div>

          {/* Alerts */}
          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500 text-red-200 text-xs font-sans flex items-start gap-2 rounded-xl">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <div>{error}</div>
            </div>
          )}

          {message && (
            <div className="p-3 bg-[#F5B800]/20 border border-[#F5B800] text-[#F5B800] text-xs font-sans flex items-start gap-2 rounded-xl">
              <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <div>{message}</div>
            </div>
          )}

          {/* Form Content */}
          <form onSubmit={mode === 'reset' ? handleResetPassword : handleSubmit} className="space-y-4 font-sans text-xs">
            
            {!isLogin && !isForgot && mode !== 'reset' && (
              <>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-300">User Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-3 h-4 w-4 text-[#F5B800]" />
                    <input
                      type="text"
                      required
                      placeholder="Enter full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-white text-[#1E232A] pl-10 pr-4 py-2.5 rounded-full font-semibold focus:outline-none focus:ring-2 focus:ring-[#F5B800]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-300">Avatar Image</label>
                  <div className="relative">
                    <Image className="absolute left-4 top-3 h-4 w-4 text-[#F5B800]" />
                    <input
                      type="url"
                      placeholder="Paste Image URL (Optional)"
                      value={avatar}
                      onChange={(e) => setAvatar(e.target.value)}
                      className="w-full bg-white text-[#1E232A] pl-10 pr-4 py-2.5 rounded-full font-semibold focus:outline-none focus:ring-2 focus:ring-[#F5B800]"
                    />
                  </div>
                </div>
              </>
            )}

            {mode !== 'reset' && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-300">User Name / Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3 h-4 w-4 text-[#F5B800]" />
                  <input
                    type="email"
                    required
                    placeholder="User Name or Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white text-[#1E232A] pl-10 pr-4 py-2.5 rounded-full font-semibold focus:outline-none focus:ring-2 focus:ring-[#F5B800]"
                  />
                </div>
              </div>
            )}

            {!isForgot && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-300">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3 h-4 w-4 text-[#F5B800]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Password"
                    value={mode === 'reset' ? newPassword : password}
                    onChange={(e) => mode === 'reset' ? setNewPassword(e.target.value) : setPassword(e.target.value)}
                    className="w-full bg-white text-[#1E232A] pl-10 pr-10 py-2.5 rounded-full font-semibold focus:outline-none focus:ring-2 focus:ring-[#F5B800]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Remember Me & Lost Password Link */}
            {isLogin && !isForgot && (
              <div className="flex items-center justify-between text-[11px] pt-1">
                <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
                  <input type="checkbox" className="accent-[#F5B800]" />
                  Remember me
                </label>
                <button
                  type="button"
                  onClick={() => { setIsForgot(true); setError(''); setMessage(''); }}
                  className="text-[#F5B800] hover:underline font-semibold"
                >
                  Lost Your password?
                </button>
              </div>
            )}

            {/* Wanderers Gold Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#F5B800] hover:bg-[#E0A600] text-[#1E232A] font-bold text-xs tracking-widest uppercase transition shadow-md mt-4 cursor-pointer rounded-full"
            >
              {loading ? 'PROCESSING...' : isForgot ? 'SEND RESET LINK' : isLogin ? 'LOGIN' : 'REGISTER'}
            </button>

          </form>

        </div>
      </div>
    </div>
  );
}
