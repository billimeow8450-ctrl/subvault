import React, { useState, useEffect } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  Calendar, 
  Clock, 
  Tag, 
  User, 
  Trash2,
} from 'lucide-react';
import { getDaysLeft } from './dateUtils';

export default function AccountDetailModal({
  isOpen,
  onClose,
  account,
  service,
  onDeleteAccount,
  onQuickMove,
  onShowToast
}) {
  if (!isOpen || !account) return null;

  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const daysInfo = getDaysLeft(account.expiryDate);

  const copyToClipboard = async (text, fieldName) => {
    try { await navigator.clipboard.writeText(text); } catch { onShowToast?.('Clipboard access failed. Please copy manually.', 'error'); return; }
    setCopiedField(fieldName);
    if (onShowToast) {
      onShowToast(`Copied ${fieldName} to clipboard!`, 'success');
    }
    setTimeout(() => setCopiedField(null), 2000);
  };

  const copyAllCredentials = () => {
    const credsText = `${account.email}:${account.password}`;
    copyToClipboard(credsText, 'All Credentials');
  };

  const statusBadges = {
    fresh: {
      text: 'Fresh Account',
      badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
    },
    listed: {
      text: 'Listed Account',
      badgeClass: 'bg-sky-500/15 text-sky-300 border-sky-500/30'
    },
    sold: {
      text: 'Sold Account',
      badgeClass: 'bg-purple-500/15 text-purple-300 border-purple-500/30'
    }
  };

  const currentBadge = statusBadges[account.status] || statusBadges.fresh;

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
            <span className="text-xl shrink-0 p-1 bg-slate-800 rounded-lg">{service?.emoji || '📦'}</span>
            <div className="min-w-0">
              <div className="flex items-center space-x-2 flex-wrap">
                <h3 className="text-sm font-bold text-white truncate">{service?.name || 'Service'} Details</h3>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${currentBadge.badgeClass}`}>
                  {currentBadge.text}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-sans font-medium ${daysInfo.badgeClass}`}>
                  {daysInfo.text}
                </span>
              </div>
              <p className="text-[11px] font-sans text-slate-400 truncate">{account.email}</p>
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

        {/* Scrollable Body */}
        <div className="p-4 sm:p-5 space-y-3.5 overflow-y-auto flex-1">
          
          {/* Credentials Card (Email & Password with 1-click reveal & copy) */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2.5">
            
            {/* Email / ID */}
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider block">
                  Account ID / Email
                </span>
                <p className="font-sans text-xs sm:text-sm font-semibold text-white select-all break-all">
                  {account.email}
                </p>
              </div>
              <button
                onClick={() => copyToClipboard(account.email, 'Email')}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1 text-xs shrink-0 cursor-pointer"
                title="Copy Email"
              >
                {copiedField === 'Email' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="text-[10px]">{copiedField === 'Email' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {/* Password */}
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
              <div className="min-w-0">
                <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider block">
                  Password
                </span>
                <p className="font-sans text-xs sm:text-sm font-semibold text-indigo-300 select-all break-all">
                  {showPassword ? account.password : '••••••••••••'}
                </p>
              </div>
              <div className="flex items-center space-x-1 shrink-0">
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  title={showPassword ? 'Hide Password' : 'Show Password'}
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => copyToClipboard(account.password, 'Password')}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1 text-xs cursor-pointer"
                  title="Copy Password"
                >
                  {copiedField === 'Password' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span className="text-[10px]">{copiedField === 'Password' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Quick 1-click All Creds Copy */}
            <div className="pt-2 border-t border-slate-800/60 flex justify-end">
              <button
                onClick={copyAllCredentials}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 transition-colors cursor-pointer"
              >
                {copiedField === 'All Credentials' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>Copy ID + Password</span>
              </button>
            </div>
          </div>

          {/* Dates & Validity Grid */}
          <div className="grid grid-cols-2 gap-2.5 text-xs">
            <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1">
              <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                <Calendar className="w-3 h-3 text-indigo-400" />
                Subscription Start Date
              </span>
              <p className="font-semibold text-slate-200">{account.purchaseDate || 'N/A'}</p>
              <p className="text-[10px] text-slate-500">Duration: {account.durationDays || 30} Days</p>
            </div>

            <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1">
              <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-400" />
                Expiry Date & Status
              </span>
              <p className="font-semibold text-slate-200">{account.expiryDate || 'N/A'}</p>
              <p className={`text-[10px] font-bold ${daysInfo.days < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {daysInfo.text}
              </p>
            </div>
          </div>

          {/* Added to vault timestamp */}
          <div className="px-3 py-1.5 rounded-lg bg-slate-900/40 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Logged to Inventory:</span>
            <span className="font-sans text-slate-300">{account.addedAt || 'Earlier'}</span>
          </div>

          {/* Only shown if Listed: Platform info */}
          {account.status === 'listed' && (
            <div className="p-3 rounded-xl bg-sky-950/20 border border-sky-500/30 text-xs space-y-1.5">
              <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider block">
                Listing Details
              </span>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1">
                  <Tag className="w-3 h-3 text-sky-400" /> Marketplace / Channel:
                </span>
                <span className="font-semibold text-sky-200 bg-sky-900/40 px-2 py-0.5 rounded border border-sky-500/30">
                  {account.platform || 'General Store'}
                </span>
              </div>
              {account.listedAt && (
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-sky-500/20">
                  <span>Listed At:</span>
                  <span className="font-sans text-slate-300">{account.listedAt}</span>
                </div>
              )}
            </div>
          )}

          {/* Only shown if Sold: Customer info & Sold price in USD */}
          {account.status === 'sold' && (
            <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/30 text-xs space-y-2">
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block">
                Fulfillment & Client Details
              </span>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-purple-400" /> Buyer Name:
                </span>
                <span className="font-semibold text-purple-200">
                  {account.customerName || 'Direct Client'}
                </span>
              </div>

              {account.platform && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-purple-400" /> Platform:
                  </span>
                  <span className="font-medium text-slate-300">{account.platform}</span>
                </div>
              )}

              {account.soldPrice && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Sale Price:</span>
                  <span className="font-bold text-emerald-400 font-sans">
                    ${Number(account.soldPrice).toFixed(2)} USD
                  </span>
                </div>
              )}

              {account.soldAt && (
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-purple-500/20">
                  <span>Sold Date & Time:</span>
                  <span className="font-sans text-slate-300">{account.soldAt}</span>
                </div>
              )}
            </div>
          )}

          {/* Internal Notes (if any) */}
          {account.notes && (
            <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 text-xs">
              <span className="text-[10px] text-slate-500 font-medium block mb-0.5">Notes:</span>
              <p className="text-slate-300 italic">{account.notes}</p>
            </div>
          )}

        </div>

        {/* Sticky Footer with Quick Move & Delete */}
        <div className="sticky bottom-0 z-20 bg-slate-900 p-3 border-t border-slate-800 flex items-center justify-between shrink-0">
          <button
            onClick={() => {
              if (confirm(`Are you sure you want to delete account "${account.email}"?`)) {
                onDeleteAccount(account.id);
                onClose();
              }
            }}
            className="px-3 py-1.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-lg border border-rose-500/20 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>

          {/* Quick Move Buttons directly inside Detail Modal */}
          <div className="flex items-center space-x-1.5">
            {account.status !== 'fresh' && (
              <button
                onClick={() => {
                  onQuickMove(account, 'fresh');
                  onClose();
                }}
                className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
              >
                To Fresh
              </button>
            )}
            {account.status !== 'listed' && (
              <button
                onClick={() => {
                  onQuickMove(account, 'listed');
                  onClose();
                }}
                className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
              >
                To Listed
              </button>
            )}
            {account.status !== 'sold' && (
              <button
                onClick={() => {
                  onQuickMove(account, 'sold');
                  onClose();
                }}
                className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-purple-950/50 hover:bg-purple-900 text-purple-300 hover:text-white border border-purple-500/30 transition-colors cursor-pointer"
              >
                Mark Sold
              </button>
            )}
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
