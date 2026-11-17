import React, { useState, useEffect } from 'react';
import { X, ArrowRight, Tag, User, CheckCircle2 } from 'lucide-react';

export default function MoveAccountModal({
  isOpen,
  onClose,
  account,
  targetStatus,
  onConfirmMove,
  recentPlatforms = []
}) {
  if (!isOpen || !account || !targetStatus) return null;

  // Input starts completely empty if no platform was previously set on this account
  const [platform, setPlatform] = useState('');
  const [customerName, setCustomerName] = useState(account.customerName || '');
  const [soldPrice, setSoldPrice] = useState(account.soldPrice ? account.soldPrice.toString() : '');

  // Reset fields when opened with a new account
  useEffect(() => {
    if (account) {
      setPlatform('');
      setCustomerName(account.customerName || '');
      setSoldPrice(account.soldPrice ? account.soldPrice.toString() : '');
    }
  }, [account]);

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

    const now = new Date();
    const formattedNow = now.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    if (targetStatus === 'fresh') {
      // Return to fresh: auto-clear platform and customer
      onConfirmMove({
        ...account,
        status: 'fresh',
        platform: null,
        listedAt: null,
        customerName: null,
        soldPrice: null,
        soldAt: null
      });
    } else if (targetStatus === 'listed') {
      onConfirmMove({
        ...account,
        status: 'listed',
        platform: platform.trim(),
        listedAt: formattedNow,
        customerName: null,
        soldPrice: null,
        soldAt: null
      });
    } else if (targetStatus === 'sold') {
      onConfirmMove({
        ...account,
        status: 'sold',
        platform: platform.trim(),
        customerName: customerName.trim() || 'Client',
        soldPrice: Number(soldPrice) || 0,
        soldAt: formattedNow
      });
    }

    onClose();
  };

  const titles = {
    fresh: 'Return Account to Fresh Stock',
    listed: 'Move Account to Listed',
    sold: 'Mark Account as Sold'
  };

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
          <div className="flex items-center space-x-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold shrink-0">
              <ArrowRight className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-white truncate">{titles[targetStatus]}</h3>
              <p className="text-[11px] font-sans text-slate-400 truncate max-w-[240px]">{account.email}</p>
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
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          
          {/* Target: FRESH Notice */}
          {targetStatus === 'fresh' && (
            <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs text-emerald-300 space-y-1">
              <p className="font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Reset to Fresh Inventory
              </p>
              <p className="text-slate-300">
                This account will be returned to the <strong>Fresh</strong> column. Previous marketplace listing and buyer information will be automatically cleared.
              </p>
            </div>
          )}

          {/* Target: LISTED fields */}
          {targetStatus === 'listed' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Where is this account listed?
              </label>
              <div className="relative mb-2">
                <Tag className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Type channel or store name..."
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Only show previously used platforms (No hardcoded dummy chips) */}
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

          {/* Target: SOLD fields */}
          {targetStatus === 'sold' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Customer / Buyer Name *
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

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Platform / Channel Sold Via
                </label>
                <div className="relative mb-1.5">
                  <Tag className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Type platform or channel..."
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

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Sale Price (USD $) *
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
            </div>
          )}

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
              className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors cursor-pointer"
            >
              Confirm Move
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
