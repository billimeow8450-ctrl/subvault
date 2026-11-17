import React, { useState, useEffect } from 'react';
import { X, ShoppingBag, User, Tag } from 'lucide-react';

export default function BulkSoldModal({
  isOpen,
  onClose,
  selectedCount,
  recentPlatforms = [],
  onConfirmBulkSold
}) {
  if (!isOpen) return null;

  const [customerName, setCustomerName] = useState('');
  const [platform, setPlatform] = useState('');
  const [soldPrice, setSoldPrice] = useState('');

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirmBulkSold({
      customerName: customerName.trim() || 'Direct Client',
      platform: platform.trim() || '',
      soldPrice: Number(soldPrice) || 0
    });
    onClose();
  };

  const totalPrice = (Number(soldPrice) || 0) * selectedCount;

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/40 backdrop-blur-xs"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md max-h-[85vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        
        {/* Sticky Header with Always-Visible Close (X) button */}
        <div className="sticky top-0 z-20 bg-slate-900 p-3.5 sm:p-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Bulk Mark as Sold</h3>
              <p className="text-[11px] text-slate-400">Mark {selectedCount} selected accounts as fulfilled</p>
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

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-3.5 overflow-y-auto flex-1">
          
          {/* Customer / Client Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Client / Buyer Name *
            </label>
            <div className="relative">
              <User className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                autoFocus
                placeholder="e.g. John Miller"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Platform / Channel */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Sales Channel / Platform
            </label>
            <div className="relative mb-1.5">
              <Tag className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="e.g. Discord, Telegram, Web Store..."
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Suggestions from user's history */}
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

          {/* Sale Price Per Account */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Sale Price Per Account (USD $) *
            </label>
            <div className="relative">
              <span className="text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2 font-bold text-xs">$</span>
              <input
                type="number"
                step="0.01"
                required
                placeholder="9.99"
                value={soldPrice}
                onChange={(e) => setSoldPrice(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-7 pr-3 py-2 text-xs font-sans text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Total Calculation Banner */}
          <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/30 flex items-center justify-between text-xs">
            <span className="text-purple-300 font-medium">
              Total Revenue ({selectedCount} × ${soldPrice}):
            </span>
            <span className="font-sans font-bold text-sm text-emerald-400">
              ${totalPrice.toFixed(2)} USD
            </span>
          </div>

          {/* Action Buttons */}
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
              className="px-4 py-2 text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors cursor-pointer"
            >
              Mark {selectedCount} as Sold
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
