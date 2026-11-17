import React, { useState } from 'react';
import { Plus, Sparkles, Tag, ShoppingBag, CheckSquare } from 'lucide-react';
import AccountSubcard from './AccountSubcard';

export default function StatusColumn({
  services = [],
  type, // 'fresh' | 'listed' | 'sold'
  title,
  subtitle,
  accounts,
  selectedAccountIds = [],
  onToggleSelect,
  onSelectAllInColumn,
  onOpenAddAccount,
  onOpenDetails,
  onQuickMove,
  onDropAccount,
  onShowToast
}) {
  const [isDragOver, setIsDragOver] = useState(false);

  // Color theming per column type (Clean, solid, non-glowing)
  const configs = {
    fresh: {
      headerBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
      badgeBg: 'bg-emerald-500/20 text-emerald-300',
      plusBtn: 'bg-slate-800 hover:bg-slate-700 text-emerald-400 border-slate-700',
      icon: <Sparkles className="w-4 h-4 text-emerald-400" />,
      emptyText: 'No fresh accounts in stock.'
    },
    listed: {
      headerBg: 'bg-sky-500/10 text-sky-400 border-sky-500/25',
      badgeBg: 'bg-sky-500/20 text-sky-300',
      plusBtn: 'bg-slate-800 hover:bg-slate-700 text-sky-400 border-slate-700',
      icon: <Tag className="w-4 h-4 text-sky-400" />,
      emptyText: 'No accounts currently listed.'
    },
    sold: {
      headerBg: 'bg-purple-500/10 text-purple-400 border-purple-500/25',
      badgeBg: 'bg-purple-500/20 text-purple-300',
      plusBtn: 'bg-slate-800 hover:bg-slate-700 text-purple-400 border-slate-700',
      icon: <ShoppingBag className="w-4 h-4 text-purple-400" />,
      emptyText: 'No accounts sold yet.'
    }
  };

  const cfg = configs[type];

  // Check if all accounts in this column are selected
  const isAllColumnSelected = accounts.length > 0 && accounts.every(a => selectedAccountIds.includes(a.id));

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const accountId = e.dataTransfer.getData('text/plain');
    if (accountId) {
      onDropAccount(accountId, type);
    }
  };

  const handleDragStart = (e, accountId) => {
    e.dataTransfer.setData('text/plain', accountId);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex-1 flex flex-col bg-slate-900 rounded-2xl border transition-colors ${
        isDragOver
          ? 'border-indigo-400 bg-indigo-950/20'
          : 'border-slate-800'
      } min-w-[280px] h-full min-h-[480px]`}
    >
      {/* Column Header */}
      <div className="p-3.5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={`p-1.5 rounded-lg border ${cfg.headerBg}`}>
            {cfg.icon}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                {title}
              </h3>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-sans font-bold ${cfg.badgeBg}`}>
                {accounts.length}
              </span>
            </div>
            <p className="text-[10px] text-slate-400">{subtitle}</p>
          </div>
        </div>

        {/* Actions in header: Select All in Column + Add Account */}
        <div className="flex items-center space-x-1.5">
          {accounts.length > 0 && (
            <button
              onClick={() => onSelectAllInColumn(accounts.map(a => a.id))}
              className={`p-1.5 rounded-lg border text-xs transition-colors cursor-pointer flex items-center gap-1 ${
                isAllColumnSelected
                  ? 'bg-indigo-600 border-indigo-500 text-white'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
              }`}
              title={isAllColumnSelected ? "Deselect column accounts" : "Select all in column"}
            >
              <CheckSquare className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={() => onOpenAddAccount(type)}
            className={`flex items-center space-x-1 px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${cfg.plusBtn}`}
            title={`Add Account to ${title}`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add</span>
          </button>
        </div>
      </div>

      {/* Accounts List (Subcards) */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {accounts.length === 0 ? (
          <div className="h-44 border border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center text-center p-4">
            <p className="text-xs text-slate-500 mb-2">{cfg.emptyText}</p>
            <button
              onClick={() => onOpenAddAccount(type)}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium cursor-pointer"
            >
              <Plus className="w-3 h-3" /> Add Account
            </button>
          </div>
        ) : (
          accounts.map((account) => (
            <AccountSubcard
              key={account.id}
              account={account}
              service={services.find(s=>s.id===account.serviceId)}
              isSelected={selectedAccountIds?.includes(account.id)}
              onToggleSelect={onToggleSelect}
              onOpenDetails={onOpenDetails}
              onQuickMove={onQuickMove}
              onDragStart={handleDragStart}
              onShowToast={onShowToast}
            />
          ))
        )}
      </div>

      {/* Footer hint */}
      <div className="px-3.5 py-2 border-t border-slate-800 text-[10px] text-slate-500 text-center">
        Drag & drop card or click to view details
      </div>
    </div>
  );
}
