import React, { useEffect } from 'react';
import { X, TrendingUp, Layers } from 'lucide-react';

export default function ProfitAnalyticsModal({
  isOpen,
  onClose,
  services,
  accounts
}) {
  if (!isOpen) return null;

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Calculate sold accounts data
  const soldAccounts = accounts.filter(a => a.status === 'sold');

  let totalRevenue = 0;
  soldAccounts.forEach(acc => {
    totalRevenue += Number(acc.soldPrice) || 0;
  });

  const avgSalePrice = soldAccounts.length > 0 ? (totalRevenue / soldAccounts.length) : 0;

  // Breakdown per service
  const serviceBreakdown = services.map(service => {
    const serviceSold = soldAccounts.filter(a => a.serviceId === service.id);
    
    let revenue = 0;
    serviceSold.forEach(acc => {
      revenue += Number(acc.soldPrice) || 0;
    });

    const sharePercent = totalRevenue > 0 ? ((revenue / totalRevenue) * 100).toFixed(1) : 0;

    return {
      service,
      soldCount: serviceSold.length,
      revenue,
      sharePercent
    };
  });

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/40 backdrop-blur-xs"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        
        {/* Sticky Header with Always-Visible Close (X) button */}
        <div className="sticky top-0 z-20 bg-slate-900 p-3.5 sm:p-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Sales & Revenue Analytics</h3>
              <p className="text-[11px] text-slate-400">Total volume and revenue breakdown per service</p>
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
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          
          {/* Top 3 KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            {/* Total Sales Revenue */}
            <div className="p-3.5 bg-emerald-950/20 border border-emerald-500/30 rounded-xl space-y-1">
              <span className="text-[10px] text-emerald-300 font-semibold uppercase tracking-wider block">
                Total Sales Revenue
              </span>
              <p className="text-xl sm:text-2xl font-bold text-emerald-400 font-sans">
                ${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-[10px] text-slate-400">
                Gross received in USD
              </p>
            </div>

            {/* Total Accounts Sold */}
            <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                Total Accounts Sold
              </span>
              <p className="text-xl sm:text-2xl font-bold text-white font-sans">
                {soldAccounts.length}
              </p>
              <p className="text-[10px] text-slate-400">
                Fulfilled customer orders
              </p>
            </div>

            {/* Average Sale Price */}
            <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                Average Sale Value
              </span>
              <p className="text-xl sm:text-2xl font-bold text-slate-300 font-sans">
                ${avgSalePrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-[10px] text-slate-400">
                Per account sold
              </p>
            </div>

          </div>

          {/* Service Breakdown Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              Service Sales Breakdown
            </h4>

            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/50">
              <div className="grid grid-cols-12 bg-slate-850 px-3 py-2 text-[11px] font-semibold text-slate-400 border-b border-slate-800">
                <span className="col-span-5">Service</span>
                <span className="col-span-2 text-center">Sold Units</span>
                <span className="col-span-3 text-right">Revenue (USD)</span>
                <span className="col-span-2 text-right">Share</span>
              </div>

              <div className="divide-y divide-slate-800/80">
                {serviceBreakdown.map(({ service, soldCount, revenue, sharePercent }) => (
                  <div key={service.id} className="grid grid-cols-12 px-3 py-2.5 text-xs items-center hover:bg-slate-800/40 transition-colors">
                    
                    {/* Service info */}
                    <div className="col-span-5 flex items-center space-x-2 truncate">
                      <span className="text-base shrink-0 p-0.5 bg-slate-800 rounded">{service.emoji}</span>
                      <span className="font-semibold text-white truncate">{service.name}</span>
                    </div>

                    {/* Sold count */}
                    <div className="col-span-2 text-center">
                      <span className={`px-2 py-0.5 rounded-full font-sans text-[11px] ${
                        soldCount > 0 ? 'bg-purple-950/40 text-purple-300 border border-purple-500/30' : 'text-slate-500'
                      }`}>
                        {soldCount}
                      </span>
                    </div>

                    {/* Revenue */}
                    <div className="col-span-3 text-right font-sans font-bold text-emerald-400">
                      ${revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>

                    {/* Share */}
                    <div className="col-span-2 text-right font-sans text-slate-400 text-[11px]">
                      {sharePercent}%
                    </div>

                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Sticky Footer */}
        <div className="sticky bottom-0 z-20 bg-slate-900 p-3 border-t border-slate-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
