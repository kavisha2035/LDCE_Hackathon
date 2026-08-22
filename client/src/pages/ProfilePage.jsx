import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, Trash2, Save, KeyRound, CheckCircle2, AlertCircle, Globe, MapPin, Upload, Image } from 'lucide-react';

export default function ProfilePage() {
  const { user, updateProfile, deleteAccount, logout } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [languagePref, setLanguagePref] = useState(user?.languagePref || 'en');
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateEmail(email)) {
      setError('Please provide a valid email address (e.g. user@example.com).');
      return;
    }

    setLoading(true);

    try {
      const payload = { name, email: email.toLowerCase().trim(), avatar, languagePref };
      if (newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      await updateProfile(payload);
      setSuccess('Passenger manifest & preferences updated.');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await deleteAccount();
    } catch (err) {
      setError(err.message || 'Failed to delete account.');
      setShowDeleteModal(false);
    } finally {
      setDeleting(false);
    }
  };

  const initialLetter = name ? name.charAt(0).toUpperCase() : 'P';

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-6 px-4">
      {/* Document Header */}
      <div className="bg-white border-2 border-[#1F2B2E] p-6 shadow-[4px_4px_0px_0px_#1F2B2E] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#B8823A] uppercase tracking-wider mb-1">
            <span>SCREEN 12</span>
            <span>&bull;</span>
            <span>PASSENGER SETTINGS</span>
          </div>
          <h1 className="text-3xl font-bold font-display text-[#1F2B2E] tracking-tight">
            USER PROFILE & PREFERENCES
          </h1>
        </div>

        <button
          onClick={logout}
          className="px-4 py-2 bg-[#1F2B2E] hover:bg-[#2C5F7C] text-[#F6F3EC] font-mono text-xs font-bold uppercase transition"
        >
          SIGN OUT
        </button>
      </div>

      {/* Feedback Alerts */}
      {error && (
        <div className="p-4 bg-[#B84A3E]/10 border-2 border-[#B84A3E] text-[#B84A3E] text-xs font-mono flex items-center gap-3">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <div>{error}</div>
        </div>
      )}

      {success && (
        <div className="p-4 bg-[#7FA69C]/20 border-2 border-[#7FA69C] text-[#1F2B2E] text-xs font-mono flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-[#2C5F7C] shrink-0" />
          <div>{success}</div>
        </div>
      )}

      {/* Main Profile Form */}
      <form onSubmit={handleUpdateProfile} className="space-y-6">
        
        {/* Custom Avatar Section */}
        <div className="bg-white border-2 border-[#1F2B2E] p-6 shadow-[3px_3px_0px_0px_#1F2B2E] space-y-4">
          <h3 className="text-lg font-bold font-display text-[#1F2B2E] border-b border-[#1F2B2E]/20 pb-2">
            1. AVATAR PORTRAIT
          </h3>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {avatar ? (
              <img
                src={avatar}
                alt="Portrait"
                className="h-20 w-20 border-2 border-[#1F2B2E] object-cover shadow-[2px_2px_0px_0px_#1F2B2E]"
              />
            ) : (
              <div className="h-20 w-20 bg-[#1F2B2E] text-[#F6F3EC] border-2 border-[#1F2B2E] shadow-[2px_2px_0px_0px_#2C5F7C] flex items-center justify-center font-mono font-extrabold text-2xl">
                {initialLetter}
              </div>
            )}

            <div className="space-y-3 flex-1">
              <label className="text-xs font-mono text-[#1F2B2E] block uppercase font-bold">
                CHOOSE CUSTOM AVATAR (IMAGE URL OR UPLOAD)
              </label>

              <div className="space-y-2">
                <div className="relative">
                  <Image className="absolute left-3 top-3 h-4 w-4 text-[#1F2B2E]/60" />
                  <input
                    type="url"
                    placeholder="Paste custom image URL (https://...)"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    className="w-full bg-[#F6F3EC] border border-[#1F2B2E] rounded-sm pl-9 pr-3 py-2 text-xs text-[#1F2B2E] placeholder-[#1F2B2E]/40 focus:outline-none focus:ring-2 focus:ring-[#2C5F7C] font-mono"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <label className="cursor-pointer px-3 py-1.5 bg-[#F6F3EC] border border-[#1F2B2E] font-mono text-xs font-bold text-[#2C5F7C] hover:bg-[#1F2B2E] hover:text-white transition flex items-center gap-1.5">
                    <Upload className="h-4 w-4" />
                    <span>UPLOAD LOCAL IMAGE FILE</span>
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
                      className="text-xs font-mono text-[#B84A3E] hover:underline uppercase font-bold"
                    >
                      REMOVE AVATAR
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Passenger Information */}
        <div className="bg-white border-2 border-[#1F2B2E] p-6 shadow-[3px_3px_0px_0px_#1F2B2E] space-y-4">
          <h3 className="text-lg font-bold font-display text-[#1F2B2E] border-b border-[#1F2B2E]/20 pb-2">
            2. PASSENGER INFORMATION
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-mono font-bold uppercase text-[#1F2B2E]">FULL NAME</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#F6F3EC] border border-[#1F2B2E] rounded-sm px-3 py-2 text-sm text-[#1F2B2E] focus:outline-none focus:ring-2 focus:ring-[#2C5F7C] font-body"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono font-bold uppercase text-[#1F2B2E]">EMAIL ADDRESS</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error && error.includes('email')) setError('');
                }}
                className="w-full bg-[#F6F3EC] border border-[#1F2B2E] rounded-sm px-3 py-2 text-sm text-[#1F2B2E] focus:outline-none focus:ring-2 focus:ring-[#2C5F7C] font-mono"
              />
            </div>
          </div>

          <div className="space-y-1 pt-2">
            <label className="text-xs font-mono font-bold uppercase text-[#1F2B2E]">LANGUAGE PREFERENCE</label>
            <select
              value={languagePref}
              onChange={(e) => setLanguagePref(e.target.value)}
              className="w-full bg-[#F6F3EC] border border-[#1F2B2E] rounded-sm px-3 py-2 text-sm text-[#1F2B2E] focus:outline-none focus:ring-2 focus:ring-[#2C5F7C] font-mono"
            >
              <option value="en">English (en)</option>
              <option value="es">Español (es)</option>
              <option value="fr">Français (fr)</option>
              <option value="de">Deutsch (de)</option>
              <option value="ja">日本語 (ja)</option>
            </select>
          </div>
        </div>

        {/* Security Credentials */}
        <div className="bg-white border-2 border-[#1F2B2E] p-6 shadow-[3px_3px_0px_0px_#1F2B2E] space-y-4">
          <h3 className="text-lg font-bold font-display text-[#1F2B2E] border-b border-[#1F2B2E]/20 pb-2">
            3. SECURITY CREDENTIALS
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-mono font-bold uppercase text-[#1F2B2E]">CURRENT PASSPHRASE</label>
              <input
                type="password"
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-[#F6F3EC] border border-[#1F2B2E] rounded-sm px-3 py-2 text-sm text-[#1F2B2E] focus:outline-none focus:ring-2 focus:ring-[#2C5F7C] font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono font-bold uppercase text-[#1F2B2E]">NEW PASSPHRASE</label>
              <input
                type="password"
                placeholder="At least 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-[#F6F3EC] border border-[#1F2B2E] rounded-sm px-3 py-2 text-sm text-[#1F2B2E] focus:outline-none focus:ring-2 focus:ring-[#2C5F7C] font-mono"
              />
            </div>
          </div>
        </div>

        {/* Form Footer Actions */}
        <div className="flex items-center justify-between pt-2">
          {/* Stamp-red reserved strictly for destructive action */}
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2.5 bg-white border-2 border-[#B84A3E] text-[#B84A3E] font-mono text-xs font-bold uppercase hover:bg-[#B84A3E] hover:text-white transition shadow-[2px_2px_0px_0px_#B84A3E] flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            DELETE ACCOUNT
          </button>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-[#2C5F7C] hover:bg-[#1F2B2E] text-[#F6F3EC] border-2 border-[#1F2B2E] font-mono text-xs font-bold uppercase transition shadow-[2px_2px_0px_0px_#1F2B2E] flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-block h-4 w-4 border-2 border-[#F6F3EC] border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <Save className="h-4 w-4" />
                SAVE CHANGES
              </>
            )}
          </button>
        </div>
      </form>

      {/* Account Deletion Stamp Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-[#1F2B2E]/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#F6F3EC] border-2 border-[#B84A3E] p-6 max-w-md w-full space-y-4 shadow-[6px_6px_0px_0px_#B84A3E]">
            <div className="flex items-center gap-3 text-[#B84A3E]">
              <Trash2 className="h-6 w-6" />
              <h3 className="font-bold text-xl font-display uppercase tracking-tight">CONFIRM DELETION</h3>
            </div>

            <p className="text-[#1F2B2E] text-xs font-mono leading-relaxed border-t border-b border-[#1F2B2E]/20 py-3">
              WARNING: This will permanently delete your account, trips, and saved destinations. This action cannot be reversed.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-white border border-[#1F2B2E] text-[#1F2B2E] font-mono text-xs font-bold uppercase hover:bg-[#1F2B2E] hover:text-white transition"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="px-4 py-2 bg-[#B84A3E] text-white border border-[#1F2B2E] font-mono text-xs font-bold uppercase hover:bg-black transition disabled:opacity-50"
              >
                {deleting ? 'DELETING...' : 'PERMANENTLY DELETE'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
