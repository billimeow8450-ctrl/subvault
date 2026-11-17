import React, { useState, useEffect } from 'react';
import { X, Calendar, Key, Mail, Tag, User, Eye, EyeOff } from 'lucide-react';
import { calculateExpiry, getDaysLeft, localDate } from './dateUtils';

export default function AddAccountModal({
  isOpen,
  onClose,
  service,
  initialStatus = 'fresh',
  onAddAccount,
  recentPlatforms = []
}) {
  if (!isOpen || !service) return null;

  const todayStr = localDate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [purchaseDate, setPurchaseDate] = useState(todayStr);
  const [durationDays, setDurationDays] = useState(30);
  const [platform, setPlatform] = useState(''); // Empty by default!
  const [customerName, setCustomerName] = useState('');
  const [soldPrice, setSoldPrice] = useState('');
  const [notes, setNotes] = useState('');

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Auto calculate expiry
  const calculatedExpiry = calculateExpiry(purchaseDate, durationDays);
  const previewDays = getDaysLeft(calculatedExpiry);

  const statusTitles = {
    fresh: 'Add Fresh Account',
    listed: 'Add Listed Account',
    sold: 'Add Sold Account'
  };

  const statusBadges = {
    fresh: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    listed: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
    sold: 'bg-purple-500/15 text-purple-300 border-purple-500/30'
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim() || !password || !calculatedExpiry || Number(durationDays) < 1) return;

    const now = new Date();
    const formattedAddedAt = now.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const newAccount = {
      id: crypto.randomUUID(),
      serviceId: service.id,
      status: initialStatus,
      email: email.trim(),
      password: password,
      purchaseDate: purchaseDate,
      durationDays: Number(durationDays),
      expiryDate: calculatedExpiry,
      addedAt: formattedAddedAt,
      platform: initialStatus !== 'fresh' ? (platform.trim() || '') : null,
      listedAt: initialStatus !== 'fresh' ? formattedAddedAt : null,
      customerName: initialStatus === 'sold' ? (customerName.trim() || 'Direct Client') : null,
      soldPrice: initialStatus === 'sold' ? (Number(soldPrice) || 0) : null,
      soldAt: initialStatus === 'sold' ? formattedAddedAt : null,
      notes: notes.trim()
    };

    onAddAccount(newAccount);
    onClose();
  };

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/40 backdrop-blur-xs"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        
        {/* Sticky Header with Always-Visible Close (X) button */}
        <div className="sticky top-0 z-20 bg-slate-900 p-3.5 sm:p-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5 min-w-0">
            <span className="text-xl shrink-0 p-1 bg-slate-800 rounded-lg">{service.emoji}</span>
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-white truncate">{statusTitles[initialStatus]}</h3>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${statusBadges[initialStatus]}`}>
                  {service.name}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Enter account credentials and subscription validity</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors shrink-0 ml-2 cursor-pointer"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-3.5 overflow-y-auto flex-1">
          
          {/* Account Credentials */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Account ID / Email *
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="name@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-8 pr-3 py-2 text-xs font-sans text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Password *
              </label>
              <div className="relative">
                <Key className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-8 pr-8 py-2 text-xs font-sans text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Dates & Validity Calculation Box */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                Subscription Validity
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${previewDays.badgeClass}`}>
                {previewDays.text}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  Purchase Date (Start)
                </label>
                <input
                  type="date"
                  required
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  Plan Duration
                </label>
                <div className="flex items-center space-x-1.5">
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={durationDays}
                    onChange={(e) => setDurationDays(e.target.value)}
                    className="w-16 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                  <div className="flex space-x-1">
                    {[30, 90, 180, 365].map(d => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDurationDays(d)}
                        className={`text-[10px] px-1.5 py-1 rounded border transition-colors ${
                          durationDays === d
                            ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500/50'
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                        }`}
                      >
                        {d}d
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/60">
              <span>Expiry Date: <strong className="text-slate-200">{calculatedExpiry}</strong></span>
              <span className="text-slate-500">Auto-calculated</span>
            </div>
          </div>

          {/* Conditional Fields: Listed */}
          {(initialStatus === 'listed' || initialStatus === 'sold') && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Listing Platform / Channel
              </label>
              <div className="relative mb-1.5">
                <Tag className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Type platform or store name..."
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Only show previously used platforms */}
              {recentPlatforms.length > 0 && (
                <div>
                  <span className="text-[10px] text-slate-500 block mb-1">Previously used:</span>
                  <div className="flex flex-wrap gap-1">
                    {recentPlatforms.map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPlatform(p)}
                        className="text-[10px] bg-slate-800 text-slate-300 hover:text-white px-2 py-0.5 rounded border border-slate-700 transition-colors cursor-pointer"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Conditional Fields: Sold */}
          {initialStatus === 'sold' && (
            <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-purple-950/20 border border-purple-500/30">
              <div>
                <label className="block text-[11px] text-purple-200 font-medium mb-1">
                  Customer / Buyer Name
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-purple-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Customer Name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-slate-900 border border-purple-500/30 rounded-lg pl-7 pr-2.5 py-1.5 text-xs text-white placeholder-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-purple-200 font-medium mb-1">
                  Sale Price (USD $)
                </label>
                <div className="relative">
                  <span className="text-purple-400 absolute left-2.5 top-1/2 -translate-y-1/2 font-bold text-xs">$</span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="9.99"
                    value={soldPrice}
                    onChange={(e) => setSoldPrice(e.target.value)}
                    className="w-full bg-slate-900 border border-purple-500/30 rounded-lg pl-6 pr-2.5 py-1.5 text-xs text-white placeholder-slate-500 font-sans"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Internal Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Internal Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Supplier invoice ID, backup codes, slot profile..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500"
            />
          </div>

          {/* Bottom actions */}
          <div className="pt-2 flex items-center justify-end space-x-2.5 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors cursor-pointer"
            >
              Save Account
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
