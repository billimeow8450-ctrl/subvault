import React from 'react';
import { KeyRound, TrendingUp } from 'lucide-react';

export default function Navbar({ 
  servicesCount, 
  freshCount, 
  listedCount, 
  soldCount,
  totalRevenue,
  onOpenProfitModal
}) {
  return (
    <header className="border-b border-slate-800/80 bg-slate-900 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0">
            <KeyRound className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-bold text-white tracking-tight font-sans">SubVault</h1>
              <span className="text-[10px] font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-md">
                ACCOUNT MANAGER
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">Digital Account & Subscription Inventory OS</p>
          </div>
        </div>

        {/* Right side: Global Counts + Total Revenue Balance */}
        <div className="flex items-center space-x-2 text-xs">
          
          {/* Services count */}
          <div className="hidden lg:flex px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 items-center gap-1.5">
            <span className="text-slate-400">Services:</span>
            <span className="font-semibold text-white">{servicesCount}</span>
          </div>

          {/* Fresh / Listed / Sold counts */}
          <div className="hidden sm:flex items-center space-x-1.5">
            <div className="px-2.5 py-1.5 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>Fresh: <strong className="font-bold text-emerald-400">{freshCount}</strong></span>
            </div>

            <div className="px-2.5 py-1.5 rounded-lg bg-sky-950/30 border border-sky-500/30 text-sky-300 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
              <span>Listed: <strong className="font-bold text-sky-400">{listedCount}</strong></span>
            </div>

            <div className="px-2.5 py-1.5 rounded-lg bg-purple-950/30 border border-purple-500/30 text-purple-300 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
              <span>Sold: <strong className="font-bold text-purple-400">{soldCount}</strong></span>
            </div>
          </div>

          {/* Total Revenue Box in USD (Clickable for full analytics) */}
          <button
            onClick={onOpenProfitModal}
            className="flex items-center space-x-2 px-3 py-1.5 bg-emerald-950/40 hover:bg-emerald-950/60 border border-emerald-500/40 hover:border-emerald-500/60 text-emerald-200 rounded-xl transition-colors cursor-pointer"
            title="Click to view full sales and revenue analytics"
          >
            <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="text-left">
              <span className="text-[10px] text-emerald-300/80 block leading-tight font-medium">Total Sales</span>
              <span className="text-xs sm:text-sm font-bold text-emerald-300 font-sans leading-tight">
                ${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-medium ml-1 hidden md:inline">
              Breakdown →
            </span>
          </button>

        </div>

      </div>
    </header>
  );
}
