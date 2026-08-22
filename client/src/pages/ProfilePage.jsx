import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  User, Mail, Shield, Trash2, Save, KeyRound,
  CheckCircle2, AlertCircle, Globe, Upload, Image,
  Sparkles, ArrowLeft, Check, Camera, Lock
} from 'lucide-react';

export default function ProfilePage({ onNavigate }) {
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
      setSuccess('Passenger manifest and preferences updated successfully.');
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
    <div className="w-full max-w-[1200px] mx-auto px-6 sm:px-12 py-6 space-y-8 font-sans">
      
      {/* Header Document Notice */}
      <div className="bg-white border border-gray-200 rounded-3xl p-8 sm:p-10 shadow-xl space-y-4 relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-4">
          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1 bg-[#1E232A] text-[#F5B800] rounded-full text-xs font-extrabold uppercase tracking-widest shadow">
              PASSPORT & IDENTITY
            </span>
            <span className="px-3.5 py-1 bg-gray-100 border border-gray-300 text-[#1E232A] rounded-full text-xs font-extrabold uppercase">
              {user?.isAdmin ? 'ADMINISTRATOR' : 'VERIFIED EXPLORER'}
            </span>
          </div>

          {onNavigate && (
            <button
              onClick={() => onNavigate('my-trips')}
              className="text-xs text-gray-600 hover:text-[#1E232A] font-extrabold uppercase flex items-center gap-1.5 cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-full transition"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to My Trips
            </button>
          )}
        </div>

        <div>
          <span className="font-script text-[#F5B800] text-4xl block">passenger dossier</span>
          <h1 className="text-4xl sm:text-5xl font-black font-serif tracking-wide text-[#1E232A]">
            USER PROFILE & PREFERENCES
          </h1>
          <p className="text-sm text-gray-600 font-sans font-medium max-w-2xl mt-2 leading-relaxed">
            Manage your passenger identity, custom avatar portrait, security credentials, and system preferences across all itineraries.
          </p>
        </div>
      </div>

      {/* Feedback Alerts */}
      {error && (
        <div className="p-5 bg-red-50 border border-red-200 text-red-700 font-sans text-xs font-bold rounded-2xl flex items-center gap-3 shadow">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-5 bg-emerald-50 border border-emerald-200 text-emerald-800 font-sans text-xs font-bold rounded-2xl flex items-center gap-3 shadow">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      {/* Main Profile Form */}
      <form onSubmit={handleUpdateProfile} className="space-y-8">
        
        {/* Section 1: Avatar Portrait */}
        <div className="bg-white border border-gray-200 rounded-3xl p-8 sm:p-10 shadow-xl space-y-6">
          <div className="border-b border-gray-200 pb-3">
            <h2 className="text-2xl font-serif font-black text-[#1E232A] uppercase tracking-wide flex items-center gap-2">
              <Camera className="h-6 w-6 text-[#F5B800]" />
              1. AVATAR PORTRAIT
            </h2>
          </div>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Avatar Preview */}
            <div className="relative group shrink-0">
              {avatar ? (
                <img
                  src={avatar}
                  alt="Passenger Portrait"
                  className="h-28 w-28 rounded-full object-cover border-4 border-[#F5B800] ring-4 ring-[#F5B800]/20 shadow-lg"
                />
              ) : (
                <div className="h-28 w-28 bg-[#1E232A] text-[#F5B800] rounded-full border-4 border-[#F5B800] ring-4 ring-[#F5B800]/20 shadow-lg flex items-center justify-center font-serif font-black text-4xl">
                  {initialLetter}
                </div>
              )}
            </div>

            {/* Avatar Controls */}
            <div className="space-y-4 flex-1 w-full">
              <div className="space-y-2">
                <label className="block font-sans text-xs font-extrabold text-[#1E232A] uppercase tracking-wider">
                  Avatar Image Web URL
                </label>
                <div className="relative">
                  <Image className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/... or custom image URL"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-full pl-11 pr-4 py-3.5 font-sans text-sm text-[#1E232A] placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#F5B800] transition shadow-inner"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <label className="cursor-pointer px-5 py-2.5 bg-[#1E232A] hover:bg-[#F5B800] text-white hover:text-[#1E232A] font-extrabold text-xs uppercase tracking-wider transition rounded-full shadow flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  <span>Upload Local File</span>
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
                    className="px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-full text-xs font-extrabold uppercase tracking-wider transition cursor-pointer"
                  >
                    Remove Avatar
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Passenger Information */}
        <div className="bg-white border border-gray-200 rounded-3xl p-8 sm:p-10 shadow-xl space-y-6">
          <div className="border-b border-gray-200 pb-3">
            <h2 className="text-2xl font-serif font-black text-[#1E232A] uppercase tracking-wide flex items-center gap-2">
              <User className="h-6 w-6 text-[#F5B800]" />
              2. PASSENGER IDENTITY & LOCALE
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Full Name */}
            <div className="space-y-2">
              <label className="block font-sans text-xs font-extrabold text-[#1E232A] uppercase tracking-wider">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Elena Rostova"
                  className="w-full bg-gray-50 border border-gray-300 rounded-full pl-11 pr-4 py-3.5 font-sans text-sm text-[#1E232A] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#F5B800] transition shadow-inner"
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-2">
              <label className="block font-sans text-xs font-extrabold text-[#1E232A] uppercase tracking-wider">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error && error.includes('email')) setError('');
                  }}
                  placeholder="e.g. explorer@globetrotter.io"
                  className="w-full bg-gray-50 border border-gray-300 rounded-full pl-11 pr-4 py-3.5 font-sans text-sm text-[#1E232A] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#F5B800] transition shadow-inner"
                />
              </div>
            </div>
          </div>

          {/* Language Preference */}
          <div className="space-y-2 pt-2">
            <label className="block font-sans text-xs font-extrabold text-[#1E232A] uppercase tracking-wider">
              Preferred Interface Language
            </label>
            <div className="relative">
              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              <select
                value={languagePref}
                onChange={(e) => setLanguagePref(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-full pl-11 pr-8 py-3.5 font-sans text-sm text-[#1E232A] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#F5B800] transition shadow-inner cursor-pointer appearance-none"
              >
                <option value="en">English (United States / International)</option>
                <option value="es">Español (Spanish)</option>
                <option value="fr">Français (French)</option>
                <option value="de">Deutsch (German)</option>
                <option value="ja">日本語 (Japanese)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Security & Passphrase */}
        <div className="bg-white border border-gray-200 rounded-3xl p-8 sm:p-10 shadow-xl space-y-6">
          <div className="border-b border-gray-200 pb-3">
            <h2 className="text-2xl font-serif font-black text-[#1E232A] uppercase tracking-wide flex items-center gap-2">
              <Lock className="h-6 w-6 text-[#F5B800]" />
              3. SECURITY & PASSPHRASE
            </h2>
          </div>

          <p className="text-xs text-gray-500 font-medium">
            Leave these passphrase fields blank if you only wish to modify your profile name or avatar.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Current Passphrase */}
            <div className="space-y-2">
              <label className="block font-sans text-xs font-extrabold text-[#1E232A] uppercase tracking-wider">
                Current Passphrase
              </label>
              <div className="relative">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-full pl-11 pr-4 py-3.5 font-sans text-sm text-[#1E232A] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#F5B800] transition shadow-inner"
                />
              </div>
            </div>

            {/* New Passphrase */}
            <div className="space-y-2">
              <label className="block font-sans text-xs font-extrabold text-[#1E232A] uppercase tracking-wider">
                New Passphrase
              </label>
              <div className="relative">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="password"
                  placeholder="Minimum 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-full pl-11 pr-4 py-3.5 font-sans text-sm text-[#1E232A] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#F5B800] transition shadow-inner"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Form Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="w-full sm:w-auto px-6 py-3.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-extrabold text-xs sm:text-sm tracking-wider uppercase rounded-full transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <Trash2 className="h-4 w-4" />
            Delete Account
          </button>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-8 py-3.5 bg-[#F5B800] hover:bg-[#E0A600] text-[#1E232A] font-extrabold text-xs sm:text-sm tracking-widest uppercase transition rounded-full shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-block h-4 w-4 border-2 border-[#1E232A] border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>SAVE PROFILE CHANGES</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Account Deletion Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-[#1A1D23]/75 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in">
          <div className="bg-white border border-gray-200 rounded-3xl p-8 sm:p-10 max-w-lg w-full space-y-6 shadow-2xl">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-3 bg-red-100 rounded-full">
                <Trash2 className="h-6 w-6" />
              </div>
              <h3 className="font-serif font-bold text-2xl text-[#1E232A] uppercase tracking-wide">
                Confirm Deletion
              </h3>
            </div>

            <p className="text-gray-600 text-sm font-sans leading-relaxed border-t border-b border-gray-200 py-4">
              <strong>WARNING:</strong> This action will permanently erase your passenger record, created travel routes, and saved destination bookmarks. This operation cannot be reversed.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-[#1E232A] font-extrabold text-xs uppercase tracking-wider rounded-full transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-full transition shadow-md cursor-pointer disabled:opacity-50"
              >
                {deleting ? 'Erasing Record...' : 'Permanently Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
