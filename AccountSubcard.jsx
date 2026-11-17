import React, { useState } from 'react';
import { getDaysLeft, formatShortDate } from './dateUtils';
import { ArrowRight, ArrowLeft, Calendar, User, Tag, Eye, Copy, Key, Check } from 'lucide-react';

export default function AccountSubcard({
  account,
  service,
  isSelected,
  onToggleSelect,
  onOpenDetails,
  onQuickMove,
  onDragStart,
  onShowToast
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [copiedType, setCopiedType] = useState(null);
  const daysInfo = getDaysLeft(account.expiryDate);

  const handleCopy = async (e, text, type) => {
    e.stopPropagation();
    try { await navigator.clipboard.writeText(text); } catch { onShowToast?.('Clipboard access failed. Please copy manually.', 'error'); return; }
    setCopiedType(type);
    if (onShowToast) onShowToast(`Copied ${type}!`);
    setTimeout(() => setCopiedType(null), 1500);
  };

  const formattedPrice = account.soldPrice 
    ? `$${Number(account.soldPrice).toFixed(2)}` 
    : null;

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, account.id)}
      onClick={() => onOpenDetails(account)}
      className={`group relative bg-slate-900 hover:bg-slate-800/60 border rounded-xl p-3 cursor-pointer transition-colors ${
        isSelected ? 'border-indigo-500 bg-indigo-950/20' : 'border-slate-800 hover:border-slate-700'
      }`}
    >
      <div className="flex items-center justify-between text-[10px] text-slate-400 mb-2"><span>{service?.emoji} {service?.name}</span><span className="capitalize">{account.status}</span></div>
      {/* Top row: Checkbox + Account Email + Quick Copy Buttons + Expiry Badge */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center space-x-2 min-w-0">
          
          {/* Multi-select checkbox */}
          <input
            type="checkbox"
            checked={isSelected || false}
            onChange={(e) => {
              e.stopPropagation();
              onToggleSelect(account.id);
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-0 cursor-pointer shrink-0"
          />

          <span className="font-sans text-xs font-semibold text-slate-200 truncate" title={account.email}>
            {account.email}
          </span>

          {/* Quick Direct Copy Buttons on the card itself */}
          <div className="flex items-center space-x-1 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => handleCopy(e, account.email, 'Email')}
              className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
              title="Quick copy Email"
            >
              {copiedType === 'Email' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            </button>
            <button
              onClick={(e) => handleCopy(e, account.password, 'Password')}
              className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
              title="Quick copy Password"
            >
              {copiedType === 'Password' ? <Check className="w-3 h-3 text-emerald-400" /> : <Key className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* Expiry Countdown Badge */}
        <span className={`text-[10px] px-2 py-0.5 rounded-full flex items-center space-x-1.5 shrink-0 ${daysInfo.badgeClass}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${daysInfo.dotClass}`}></span>
          <span>{daysInfo.text}</span>
        </span>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-400 py-2 mb-2 border-b border-slate-800"><span className="truncate">{showPassword ? account.password : '••••••••••••'}</span><button title={showPassword?'Hide password':'Show password'} onClick={e=>{e.stopPropagation();setShowPassword(!showPassword);}}><Eye size={13}/></button></div>
      {account.status === 'listed' && <p className="text-[10px] text-slate-400 mb-2">Listed {account.listedAt || '—'}</p>}
      {account.status === 'sold' && <p className="text-[10px] text-slate-400 mb-2">Sold {account.soldAt || '—'}</p>}
      {/* Middle row: Conditional context info based on Status */}
      <div className="text-[11px] text-slate-400 flex items-center justify-between">
        
        {/* Status: FRESH */}
        {account.status === 'fresh' && (
          <div className="flex items-center space-x-1 text-slate-400">
            <Calendar className="w-3 h-3 text-slate-500" />
            <span>Purchased: <strong className="text-slate-300 font-medium">{formatShortDate(account.purchaseDate)}</strong></span>
          </div>
        )}

        {/* Status: LISTED */}
        {account.status === 'listed' && (
          <div className="flex items-center space-x-1.5 truncate">
            <span className="text-[10px] bg-sky-950/40 text-sky-300 border border-sky-500/30 px-2 py-0.5 rounded-md flex items-center gap-1 font-medium truncate max-w-[170px]">
              <Tag className="w-2.5 h-2.5 text-sky-400 shrink-0" />
              <span className="truncate">{account.platform || ''}</span>
            </span>
          </div>
        )}

        {/* Status: SOLD */}
        {account.status === 'sold' && (
          <div className="flex items-center space-x-2 truncate">
            <span className="text-[10px] bg-purple-950/40 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-md flex items-center gap-1 font-medium truncate max-w-[150px]">
              <User className="w-2.5 h-2.5 text-purple-400 shrink-0" />
              <span className="truncate">{account.customerName || 'Client'}</span>
            </span>

            {formattedPrice && (
              <span className="text-[10px] font-sans font-bold text-emerald-400 bg-emerald-950/30 px-1.5 py-0.5 rounded border border-emerald-500/30">
                {formattedPrice}
              </span>
            )}
          </div>
        )}

        {/* Click hint indicator */}
        <span className="text-[10px] text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
          <Eye className="w-3 h-3" /> Details
        </span>
      </div>

      {/* Quick Move Action bar (Provides options between Fresh, Listed, and Sold) */}
      <div 
        onClick={(e) => e.stopPropagation()} 
        className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px]"
      >
        {/* FRESH: Both "To Listed" AND "Mark Sold" */}
        {account.status === 'fresh' && (
          <div className="w-full grid grid-cols-2 gap-1.5">
            <button
              onClick={() => onQuickMove(account, 'listed')}
              className="flex items-center justify-center space-x-1 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors font-medium cursor-pointer"
            >
              <span>To Listed</span>
              <ArrowRight className="w-3 h-3" />
            </button>
            <button
              onClick={() => onQuickMove(account, 'sold')}
              className="flex items-center justify-center space-x-1 py-1 rounded bg-purple-950/40 hover:bg-purple-900/50 text-purple-300 hover:text-white border border-purple-500/30 transition-colors font-medium cursor-pointer"
            >
              <span>Mark Sold</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* LISTED: Both "To Fresh" AND "Mark Sold" */}
        {account.status === 'listed' && (
          <div className="w-full grid grid-cols-2 gap-1.5">
            <button
              onClick={() => onQuickMove(account, 'fresh')}
              className="flex items-center justify-center space-x-1 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>To Fresh</span>
            </button>
            <button
              onClick={() => onQuickMove(account, 'sold')}
              className="flex items-center justify-center space-x-1 py-1 rounded bg-purple-950/40 hover:bg-purple-900/50 text-purple-300 hover:text-white border border-purple-500/30 transition-colors font-medium cursor-pointer"
            >
              <span>Mark Sold</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* SOLD: Both "Return to Fresh" AND "To Listed" */}
        {account.status === 'sold' && (
          <div className="w-full grid grid-cols-2 gap-1.5">
            <button
              onClick={() => onQuickMove(account, 'fresh')}
              className="flex items-center justify-center space-x-1 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
              title="Return to Fresh (Clears client & marketplace details)"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>To Fresh</span>
            </button>
            <button
              onClick={() => onQuickMove(account, 'listed')}
              className="flex items-center justify-center space-x-1 py-1 rounded bg-slate-800 hover:bg-slate-700 text-sky-300 hover:text-white border border-slate-700 transition-colors font-medium cursor-pointer"
            >
              <span>To Listed</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
