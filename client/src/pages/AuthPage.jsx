import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Compass, Mail, Lock, User, Eye, EyeOff, ArrowRight, CheckCircle, AlertCircle, Globe, Image, Upload, KeyRound, ArrowLeft } from 'lucide-react';

export default function AuthPage({ onSuccess, mode, resetToken }) {
  const { login, signup } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
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

  // Handle password reset submission (from email link)
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
      setError('Please enter a valid email address (e.g. user@example.com).');
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
        setMessage(data.message);
      } else if (isLogin) {
        await login(email.toLowerCase().trim(), password);
        if (onSuccess) onSuccess();
      } else {
        await signup(name, email.toLowerCase().trim(), password, languagePref, avatar);
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── RESET PASSWORD MODE (from email link) ──
  if (mode === 'reset') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center py-10 px-4">
        <div className="w-full max-w-md bg-white border-2 border-[#1F2B2E] rounded-sm p-8 shadow-[4px_4px_0px_0px_#1F2B2E] relative">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-dashed border-[#1F2B2E] pb-5 mb-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-[#1F2B2E] text-[#F6F3EC] flex items-center justify-center font-mono font-bold text-lg rounded-sm">
                GT
              </div>
              <div>
                <h2 className="text-2xl font-bold font-display text-[#1F2B2E] tracking-tight leading-none">
                  GLOBETROTTER
                </h2>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#2C5F7C]">
                  PASSWORD RESET
                </span>
              </div>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 bg-[#F6F3EC] border border-[#1F2B2E] text-[#B8823A] font-bold">
              <KeyRound className="h-3.5 w-3.5 inline mr-1" />
              SECURE
            </span>
          </div>

          {/* Alerts */}
          {error && (
            <div className="mb-6 p-3 bg-[#B84A3E]/10 border border-[#B84A3E] text-[#B84A3E] text-xs font-mono flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <div>{error}</div>
            </div>
          )}

          {resetSuccess ? (
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center h-16 w-16 bg-[#7FA69C]/20 border-2 border-[#7FA69C] rounded-full mx-auto">
                <CheckCircle className="h-8 w-8 text-[#7FA69C]" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold font-display text-[#1F2B2E] uppercase">
                  Password Reset Complete
                </h3>
                <p className="text-sm text-[#1F2B2E]/70 font-body">
                  {message}
                </p>
              </div>
              <button
                onClick={() => { if (onSuccess) onSuccess(); }}
                className="w-full py-3 px-4 bg-[#2C5F7C] hover:bg-[#1F2B2E] font-mono font-bold text-sm text-[#F6F3EC] uppercase tracking-wider transition border border-[#1F2B2E] flex items-center justify-center gap-2 shadow-[2px_2px_0px_0px_#1F2B2E]"
              >
                PROCEED TO SIGN IN
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <p className="text-sm text-[#1F2B2E]/80 font-body leading-relaxed">
                Enter your new password below. Make sure it's at least <strong>6 characters</strong> long.
              </p>

              <div className="space-y-1">
                <label className="text-xs font-mono font-bold uppercase text-[#1F2B2E]">NEW PASSPHRASE</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-[#1F2B2E]/60" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-[#F6F3EC] border border-[#1F2B2E] rounded-sm pl-9 pr-9 py-2 text-sm text-[#1F2B2E] placeholder-[#1F2B2E]/40 focus:outline-none focus:ring-2 focus:ring-[#2C5F7C] font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-3 text-[#1F2B2E]/60 hover:text-[#1F2B2E]"
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono font-bold uppercase text-[#1F2B2E]">CONFIRM PASSPHRASE</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-[#1F2B2E]/60" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full bg-[#F6F3EC] border rounded-sm pl-9 pr-3 py-2 text-sm text-[#1F2B2E] placeholder-[#1F2B2E]/40 focus:outline-none focus:ring-2 focus:ring-[#2C5F7C] font-mono ${
                      confirmPassword && confirmPassword !== newPassword
                        ? 'border-[#B84A3E] ring-1 ring-[#B84A3E]'
                        : confirmPassword && confirmPassword === newPassword
                        ? 'border-[#7FA69C] ring-1 ring-[#7FA69C]'
                        : 'border-[#1F2B2E]'
                    }`}
                  />
                </div>
                {confirmPassword && confirmPassword !== newPassword && (
                  <p className="text-[10px] font-mono text-[#B84A3E] mt-1">Passwords do not match</p>
                )}
                {confirmPassword && confirmPassword === newPassword && (
                  <p className="text-[10px] font-mono text-[#7FA69C] mt-1 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" /> Passwords match
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 py-3 px-4 bg-[#2C5F7C] hover:bg-[#1F2B2E] font-mono font-bold text-sm text-[#F6F3EC] uppercase tracking-wider transition border border-[#1F2B2E] flex items-center justify-center gap-2 shadow-[2px_2px_0px_0px_#1F2B2E]"
              >
                {loading ? (
                  <span className="inline-block h-4 w-4 border-2 border-[#F6F3EC] border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    SET NEW PASSWORD
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // ── DEFAULT MODE: LOGIN / SIGNUP / FORGOT ──
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-md bg-white border-2 border-[#1F2B2E] rounded-sm p-8 shadow-[4px_4px_0px_0px_#1F2B2E] relative">
        
        {/* Header Boarding Pass Motif */}
        <div className="flex items-center justify-between border-b-2 border-dashed border-[#1F2B2E] pb-5 mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-[#1F2B2E] text-[#F6F3EC] flex items-center justify-center font-mono font-bold text-lg rounded-sm">
              GT
            </div>
            <div>
              <h2 className="text-2xl font-bold font-display text-[#1F2B2E] tracking-tight leading-none">
                GLOBETROTTER
              </h2>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#2C5F7C]">
                {isForgot ? 'PASSWORD RECOVERY' : 'PASSENGER MANIFEST'}
              </span>
            </div>
          </div>

          <span className="text-xs font-mono px-2 py-0.5 bg-[#F6F3EC] border border-[#1F2B2E] text-[#B8823A] font-bold">
            DOC #1
          </span>
        </div>

        {/* Ticket Stub Tabs Toggle */}
        {!isForgot && (
          <div className="grid grid-cols-2 gap-2 mb-6 p-1 bg-[#F6F3EC] border border-[#1F2B2E] rounded-sm font-mono text-xs">
            <button
              type="button"
              onClick={() => { setIsLogin(true); setIsForgot(false); setError(''); setMessage(''); }}
              className={`py-2 text-center font-bold uppercase transition ${
                isLogin && !isForgot 
                  ? 'bg-[#1F2B2E] text-[#F6F3EC]' 
                  : 'text-[#1F2B2E] hover:bg-white'
              }`}
            >
              SIGN IN
            </button>
            <button
              type="button"
              onClick={() => { setIsLogin(false); setIsForgot(false); setError(''); setMessage(''); }}
              className={`py-2 text-center font-bold uppercase transition ${
                !isLogin && !isForgot 
                  ? 'bg-[#1F2B2E] text-[#F6F3EC]' 
                  : 'text-[#1F2B2E] hover:bg-white'
              }`}
            >
              NEW ACCOUNT
            </button>
          </div>
        )}

        {/* Forgot Password Header */}
        {isForgot && (
          <div className="mb-6">
            <button
              type="button"
              onClick={() => { setIsForgot(false); setError(''); setMessage(''); }}
              className="flex items-center gap-1.5 text-xs font-mono text-[#2C5F7C] hover:text-[#1F2B2E] transition mb-3"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              BACK TO SIGN IN
            </button>
            <p className="text-sm text-[#1F2B2E]/80 font-body leading-relaxed">
              Enter your email address and we'll send you a secure link to reset your passphrase.
            </p>
          </div>
        )}

        {/* Alerts */}
        {error && (
          <div className="mb-6 p-3 bg-[#B84A3E]/10 border border-[#B84A3E] text-[#B84A3E] text-xs font-mono flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <div>{error}</div>
          </div>
        )}

        {message && !isForgot && (
          <div className="mb-6 p-3 bg-[#7FA69C]/20 border border-[#7FA69C] text-[#1F2B2E] text-xs font-mono flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-[#2C5F7C] shrink-0 mt-0.5" />
            <div>{message}</div>
          </div>
        )}

        {/* Forgot Password Success State */}
        {isForgot && message ? (
          <div className="text-center space-y-6">
            <div className="inline-flex items-center justify-center h-16 w-16 bg-[#2C5F7C]/10 border-2 border-[#2C5F7C] rounded-full mx-auto">
              <Mail className="h-8 w-8 text-[#2C5F7C]" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold font-display text-[#1F2B2E] uppercase">
                Check Your Inbox
              </h3>
              <p className="text-sm text-[#1F2B2E]/70 font-body">
                {message}
              </p>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => { setIsForgot(false); setMessage(''); setError(''); }}
                className="w-full py-3 px-4 bg-[#2C5F7C] hover:bg-[#1F2B2E] font-mono font-bold text-sm text-[#F6F3EC] uppercase tracking-wider transition border border-[#1F2B2E] flex items-center justify-center gap-2 shadow-[2px_2px_0px_0px_#1F2B2E]"
              >
                <ArrowLeft className="h-4 w-4" />
                BACK TO SIGN IN
              </button>
              <p className="text-[10px] font-mono text-[#1F2B2E]/50 text-center">
                Didn't receive the email? Check your spam folder or try again.
              </p>
            </div>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && !isForgot && (
              <>
                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold uppercase text-[#1F2B2E]">PASSENGER NAME</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-[#1F2B2E]/60" />
                    <input
                      type="text"
                      required
                      placeholder="Alex Johnson"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-[#F6F3EC] border border-[#1F2B2E] rounded-sm pl-9 pr-3 py-2 text-sm text-[#1F2B2E] placeholder-[#1F2B2E]/40 focus:outline-none focus:ring-2 focus:ring-[#2C5F7C] font-body"
                    />
                  </div>
                </div>

                {/* Custom Avatar Picker */}
                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold uppercase text-[#1F2B2E]">CHOOSE AVATAR (URL OR FILE)</label>
                  <div className="space-y-2">
                    <div className="relative">
                      <Image className="absolute left-3 top-3 h-4 w-4 text-[#1F2B2E]/60" />
                      <input
                        type="url"
                        placeholder="Paste Image URL (e.g. https://...)"
                        value={avatar}
                        onChange={(e) => setAvatar(e.target.value)}
                        className="w-full bg-[#F6F3EC] border border-[#1F2B2E] rounded-sm pl-9 pr-3 py-2 text-xs text-[#1F2B2E] placeholder-[#1F2B2E]/40 focus:outline-none focus:ring-2 focus:ring-[#2C5F7C] font-mono"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer px-3 py-1.5 bg-[#F6F3EC] border border-[#1F2B2E] font-mono text-[11px] font-bold text-[#2C5F7C] hover:bg-[#1F2B2E] hover:text-white transition flex items-center gap-1.5">
                        <Upload className="h-3.5 w-3.5" />
                        <span>UPLOAD IMAGE FILE</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                      {avatar && (
                        <button
                          type="button"
                          onClick={() => setAvatar('')}
                          className="text-[11px] font-mono text-[#B84A3E] hover:underline"
                        >
                          CLEAR
                        </button>
                      )}
                    </div>
                    {avatar && (
                      <div className="flex items-center gap-3 p-2 bg-[#F6F3EC] border border-[#1F2B2E]">
                        <img src={avatar} alt="Preview" className="h-10 w-10 object-cover border border-[#1F2B2E]" />
                        <span className="text-[10px] font-mono text-[#2C5F7C] font-bold">AVATAR PREVIEW</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold uppercase text-[#1F2B2E]">LANGUAGE PREFERENCE</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-3 h-4 w-4 text-[#1F2B2E]/60" />
                    <select
                      value={languagePref}
                      onChange={(e) => setLanguagePref(e.target.value)}
                      className="w-full bg-[#F6F3EC] border border-[#1F2B2E] rounded-sm pl-9 pr-3 py-2 text-sm text-[#1F2B2E] focus:outline-none focus:ring-2 focus:ring-[#2C5F7C] font-mono"
                    >
                      <option value="en">English (US)</option>
                      <option value="es">Español (Spanish)</option>
                      <option value="fr">Français (French)</option>
                      <option value="de">Deutsch (German)</option>
                      <option value="ja">日本語 (Japanese)</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            <div className="space-y-1">
              <label className="text-xs font-mono font-bold uppercase text-[#1F2B2E]">EMAIL ADDRESS</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-[#1F2B2E]/60" />
                <input
                  type="email"
                  required
                  placeholder="alex@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error && error.includes('email')) setError('');
                  }}
                  className="w-full bg-[#F6F3EC] border border-[#1F2B2E] rounded-sm pl-9 pr-3 py-2 text-sm text-[#1F2B2E] placeholder-[#1F2B2E]/40 focus:outline-none focus:ring-2 focus:ring-[#2C5F7C] font-mono"
                />
              </div>
            </div>

            {!isForgot && (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono font-bold uppercase text-[#1F2B2E]">SECURITY PASSPHRASE</label>
                  {isLogin && (
                    <button
                      type="button"
                      onClick={() => { setIsForgot(true); setError(''); setMessage(''); }}
                      className="text-[11px] font-mono text-[#2C5F7C] hover:underline"
                    >
                      FORGOT?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-[#1F2B2E]/60" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#F6F3EC] border border-[#1F2B2E] rounded-sm pl-9 pr-9 py-2 text-sm text-[#1F2B2E] placeholder-[#1F2B2E]/40 focus:outline-none focus:ring-2 focus:ring-[#2C5F7C] font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-[#1F2B2E]/60 hover:text-[#1F2B2E]"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-3 px-4 bg-[#2C5F7C] hover:bg-[#1F2B2E] font-mono font-bold text-sm text-[#F6F3EC] uppercase tracking-wider transition border border-[#1F2B2E] flex items-center justify-center gap-2 shadow-[2px_2px_0px_0px_#1F2B2E]"
            >
              {loading ? (
                <span className="inline-block h-4 w-4 border-2 border-[#F6F3EC] border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  {isForgot ? 'REQUEST RESET LINK' : isLogin ? 'CONFIRM SIGN IN' : 'REGISTER PASSENGER'}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
