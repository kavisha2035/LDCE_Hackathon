import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Compass, Mail, Lock, User, Eye, EyeOff, ArrowRight, CheckCircle, AlertCircle, Globe } from 'lucide-react';

export default function AuthPage({ onSuccess }) {
  const { login, signup } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [isForgot, setIsForgot] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [languagePref, setLanguagePref] = useState('en');
  
  // Feedback states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (isForgot) {
        const res = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        const data = await res.json();
        setMessage(data.message);
      } else if (isLogin) {
        await login(email, password);
        if (onSuccess) onSuccess();
      } else {
        await signup(name, email, password, languagePref);
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-md bg-white border-2 border-[#1F2B2E] rounded-sm p-8 shadow-[4px_4px_0px_0px_#1F2B2E] relative">
        
        {/* Header Header Boarding Pass Motif */}
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
                PASSENGER MANIFEST
              </span>
            </div>
          </div>

          <span className="text-xs font-mono px-2 py-0.5 bg-[#F6F3EC] border border-[#1F2B2E] text-[#B8823A] font-bold">
            DOC #1
          </span>
        </div>

        {/* Ticket Stub Tabs Toggle */}
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

        {/* Alerts */}
        {error && (
          <div className="mb-6 p-3 bg-[#B84A3E]/10 border border-[#B84A3E] text-[#B84A3E] text-xs font-mono flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <div>{error}</div>
          </div>
        )}

        {message && (
          <div className="mb-6 p-3 bg-[#7FA69C]/20 border border-[#7FA69C] text-[#1F2B2E] text-xs font-mono flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-[#2C5F7C] shrink-0 mt-0.5" />
            <div>{message}</div>
          </div>
        )}

        {/* Form */}
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
                onChange={(e) => setEmail(e.target.value)}
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
                {isForgot ? 'REQUEST RESET' : isLogin ? 'CONFIRM SIGN IN' : 'REGISTER PASSENGER'}
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
