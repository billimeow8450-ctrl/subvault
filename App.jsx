import { grossRevenue } from './inventory';
import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import ServiceSidebar from './ServiceSidebar';
import StatusColumn from './StatusColumn';
import AddServiceModal from './AddServiceModal';
import AddAccountModal from './AddAccountModal';
import AccountDetailModal from './AccountDetailModal';
import MoveAccountModal from './MoveAccountModal';
import BulkImportModal from './BulkImportModal';
import BulkSoldModal from './BulkSoldModal';
import ProfitAnalyticsModal from './ProfitAnalyticsModal';
import Toast from './Toast';

import { sortAccountsByExpiry, getDaysLeft } from './dateUtils';
import { Search, UploadCloud, Plus, X, Trash2, ArrowRight, ArrowLeft, Filter, CheckSquare, Layers, ShoppingBag } from 'lucide-react';

export default function App({ initialData, onChange, cloudStatus, userEmail, onSignOut }) {
  const [services, setServices] = useState(initialData.services || []);
  const [accounts, setAccounts] = useState(initialData.accounts || []);
  const [selectedServiceId, setSelectedServiceId] = useState(null);
  const [recentPlatforms, setRecentPlatforms] = useState(initialData.recentPlatforms || []);
  const recordPlatform = (name) => {
    if (!name?.trim()) return;
    const clean = name.trim();
    setRecentPlatforms(prev => [clean, ...prev.filter(p => p.toLowerCase() !== clean.toLowerCase())].slice(0, 20));
  };
  useEffect(() => { onChange({ services, accounts, recentPlatforms }); }, [services, accounts, recentPlatforms, onChange]);
  // Sidebar service search term
  const [serviceSearchTerm, setServiceSearchTerm] = useState('');

  // Account search term across Fresh, Listed, Sold
  const [accountSearchTerm, setAccountSearchTerm] = useState('');

  // Quick Expiry Filter: 'all' | 'today' | 'under7' | 'expired'
  const [expiryFilter, setExpiryFilter] = useState('all');
  const [hideExpired, setHideExpired] = useState(false);

  // Multi-select accounts state
  const [selectedAccountIds, setSelectedAccountIds] = useState([]);

  // Modals state
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [isBulkSoldOpen, setIsBulkSoldOpen] = useState(false);
  const [isProfitModalOpen, setIsProfitModalOpen] = useState(false);
  const [addAccountInitialStatus, setAddAccountInitialStatus] = useState('fresh');
  const [detailAccount, setDetailAccount] = useState(null);

  // Move Modal state
  const [moveModal, setMoveModal] = useState({
    isOpen: false,
    account: null,
    targetStatus: null
  });

  // Toast notification
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Keep selectedServiceId valid if services change
  useEffect(() => {
    if (services.length > 0 && (!selectedServiceId || !services.some(s => s.id === selectedServiceId))) {
      setSelectedServiceId(services[0].id);
    } else if (services.length === 0) {
      setSelectedServiceId(null);
    }
  }, [services, selectedServiceId]);

  // Current selected service
  const selectedService = services.find(s => s.id === selectedServiceId) || services[0] || null;

  // Calculate Total Gross Revenue in USD ($) across all Sold accounts
  const totalRevenue = grossRevenue(accounts);

  // Accounts under current selected service
  const rawServiceAccounts = accountSearchTerm.trim() ? accounts : selectedService ? accounts.filter(a => a.serviceId === selectedService.id) : [];

  // Filter accounts by search term and expiry pills
  const serviceAccounts = rawServiceAccounts.filter(a => {
    const daysInfo = getDaysLeft(a.expiryDate);

    // Hide expired toggle
    if (hideExpired && daysInfo.days < 0) return false;

    // Expiry tab filters
    if (expiryFilter === 'today' && daysInfo.days !== 0) return false;
    if (expiryFilter === 'under7' && (daysInfo.days >= 7 || daysInfo.days < 0)) return false;
    if (expiryFilter === 'expired' && daysInfo.days >= 0) return false;

    // Search query match
    if (!accountSearchTerm.trim()) return true;
    const term = accountSearchTerm.toLowerCase();
    const emailMatch = a.email?.toLowerCase().includes(term);
    const customerMatch = a.customerName?.toLowerCase().includes(term);
    const platformMatch = a.platform?.toLowerCase().includes(term);
    const notesMatch = a.notes?.toLowerCase().includes(term);
    return emailMatch || customerMatch || platformMatch || notesMatch;
  });

  // Accounts split by status and AUTO-SORTED BY EXPIRY (Lowest remaining days at the TOP)
  const freshAccounts = sortAccountsByExpiry(serviceAccounts.filter(a => a.status === 'fresh'));
  const listedAccounts = sortAccountsByExpiry(serviceAccounts.filter(a => a.status === 'listed'));
  const soldAccounts = sortAccountsByExpiry(serviceAccounts.filter(a => a.status === 'sold'));

  // Overall counts for topbar
  const totalFresh = accounts.filter(a => a.status === 'fresh').length;
  const totalListed = accounts.filter(a => a.status === 'listed').length;
  const totalSold = accounts.filter(a => a.status === 'sold').length;

  // Multi-select handlers
  const handleToggleSelect = (accountId) => {
    setSelectedAccountIds(prev =>
      prev.includes(accountId) ? prev.filter(id => id !== accountId) : [...prev, accountId]
    );
  };

  const handleSelectAllInColumn = (columnAccountIds) => {
    const allSelected = columnAccountIds.every(id => selectedAccountIds.includes(id));
    if (allSelected) {
      // Deselect them
      setSelectedAccountIds(prev => prev.filter(id => !columnAccountIds.includes(id)));
    } else {
      // Select all of them
      setSelectedAccountIds(prev => Array.from(new Set([...prev, ...columnAccountIds])));
    }
  };

  const handleClearSelection = () => {
    setSelectedAccountIds([]);
  };

  // Bulk Move selected accounts to Fresh or Listed
  const handleBulkMove = (targetStatus) => {
    if (selectedAccountIds.length === 0) return;

    const now = new Date().toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    setAccounts(prev => prev.map(a => {
      if (selectedAccountIds.includes(a.id)) {
        if (targetStatus === 'fresh') {
          return {
            ...a,
            status: 'fresh',
            platform: null,
            listedAt: null,
            customerName: null,
            soldPrice: null,
            soldAt: null
          };
        } else if (targetStatus === 'listed') {
          return {
            ...a,
            status: 'listed',
            platform: a.platform || '',
            listedAt: now,
            customerName: null,
            soldPrice: null,
            soldAt: null
          };
        }
      }
      return a;
    }));

    showToast(`Moved ${selectedAccountIds.length} accounts to ${targetStatus.toUpperCase()}!`);
    setSelectedAccountIds([]);
  };

  // Bulk Move selected accounts to Sold
  const handleConfirmBulkSold = ({ customerName, platform, soldPrice }) => {
    if (selectedAccountIds.length === 0) return;

    if (platform) recordPlatform(platform);

    const now = new Date().toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    setAccounts(prev => prev.map(a => {
      if (selectedAccountIds.includes(a.id)) {
        return {
          ...a,
          status: 'sold',
          customerName,
          platform,
          soldPrice: Number(soldPrice) || 0,
          soldAt: now
        };
      }
      return a;
    }));

    showToast(`Marked ${selectedAccountIds.length} accounts as SOLD ($${soldPrice} each)!`);
    setSelectedAccountIds([]);
  };

  // Bulk Delete selected accounts
  const handleBulkDelete = () => {
    if (confirm(`Delete ${selectedAccountIds.length} selected accounts permanently?`)) {
      setAccounts(prev => prev.filter(a => !selectedAccountIds.includes(a.id)));
      showToast(`Deleted ${selectedAccountIds.length} accounts.`);
      setSelectedAccountIds([]);
    }
  };

  // Single Account Handlers
  const handleAddService = (newService) => {
    const updated = [...services, newService];
    setServices(updated);
    setSelectedServiceId(newService.id);
    showToast(`Service "${newService.name}" created!`);
  };

  const handleDeleteService = (serviceId) => {
    const updatedServices = services.filter(s => s.id !== serviceId);
    const updatedAccounts = accounts.filter(a => a.serviceId !== serviceId);
    setServices(updatedServices);
    setAccounts(updatedAccounts);
    if (selectedServiceId === serviceId) {
      setSelectedServiceId(updatedServices[0]?.id || null);
    }
    showToast('Service deleted.');
  };

  const handleAddAccount = (newAccount) => {
    if (newAccount.platform) recordPlatform(newAccount.platform);
    setAccounts(prev => [newAccount, ...prev]);
    showToast(`Account added to ${newAccount.status.toUpperCase()}!`);
  };

  const handleBulkImport = (newAccountsList) => {
    setAccounts(prev => [...newAccountsList, ...prev]);
    showToast(`Successfully imported ${newAccountsList.length} accounts to Fresh!`);
  };

  const handleDeleteAccount = (accountId) => {
    setAccounts(prev => prev.filter(a => a.id !== accountId));
    showToast('Account deleted.');
  };

  const handleQuickMove = (account, targetStatus) => {
    if (account.status === targetStatus) return;

    if (targetStatus === 'fresh') {
      // Direct return to fresh: clear platform & customer
      setAccounts(prev => prev.map(a => {
        if (a.id === account.id) {
          return {
            ...a,
            status: 'fresh',
            platform: null,
            listedAt: null,
            customerName: null,
            soldPrice: null,
            soldAt: null
          };
        }
        return a;
      }));
      showToast(`Account returned to FRESH inventory.`);
      if (detailAccount?.id === account.id) {
        setDetailAccount(null);
      }
    } else {
      // Open modal to specify platform or customer name + selling price in USD
      setMoveModal({
        isOpen: true,
        account: account,
        targetStatus: targetStatus
      });
    }
  };

  const handleConfirmMove = (updatedAccount) => {
    if (updatedAccount.platform) recordPlatform(updatedAccount.platform);
    setAccounts(prev => prev.map(a => a.id === updatedAccount.id ? updatedAccount : a));
    showToast(`Account marked as ${updatedAccount.status.toUpperCase()}!`);
    if (detailAccount?.id === updatedAccount.id) {
      setDetailAccount(updatedAccount);
    }
  };

  const handleDropAccount = (accountId, targetStatus) => {
    const acc = accounts.find(a => a.id === accountId);
    if (acc) {
      handleQuickMove(acc, targetStatus);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f0e8] text-slate-100 flex flex-col">
      
      {/* Top Navbar with Total Sales Revenue ($ USD) */}
      <Navbar
        servicesCount={services.length}
        freshCount={totalFresh}
        listedCount={totalListed}
        soldCount={totalSold}
        totalRevenue={totalRevenue}
        onOpenProfitModal={() => setIsProfitModalOpen(true)}
      />

      <section className="workspace-intro max-w-[1600px] mx-auto w-full px-6 pt-9 pb-5">
        <div className="flex justify-between gap-4 flex-wrap items-center">
          <div><p className="eyebrow">YOUR PRIVATE WORKSPACE</p><h2 className="display-title">A little order. A lot of clarity.</h2><p className="intro-copy">Your subscriptions, stock, and sales. All in one considered space.</p></div>
          <div className="workspace-identity"><span className="sync-dot" />{cloudStatus}<span className="identity-email">{userEmail}</span><button onClick={onSignOut} className="quiet-button">Sign out</button></div>
        </div>
        <div className="overview-grid">
          {[['Total inventory', accounts.length, 'Across '+services.length+' services'], ['Fresh stock',totalFresh,'Ready for their next owner'], ['Active listings',totalListed,'Out in the marketplace'], ['Gross revenue', '$'+totalRevenue.toLocaleString('en-US',{minimumFractionDigits:2}), totalSold+' accounts delivered']].map(([label,value,hint],i)=><button key={label} className={'overview-card metric-'+i} onClick={i===3?()=>setIsProfitModalOpen(true):undefined}><span>{label}</span><strong>{value}</strong><small>{hint}</small></button>)}
        </div>
      </section>
      {/* Main Content Area */}
      <main className="max-w-[1600px] mx-auto px-3 sm:px-6 py-4 flex-1 flex flex-col md:flex-row gap-4 w-full items-stretch">
        
        {/* Left Box: Services Sidebar */}
        <ServiceSidebar
          services={services}
          selectedServiceId={selectedServiceId}
          onSelectService={(id) => {
            setSelectedServiceId(id);
            setAccountSearchTerm('');
            setSelectedAccountIds([]);
          }}
          searchTerm={serviceSearchTerm}
          setSearchTerm={setServiceSearchTerm}
          onOpenAddService={() => setIsAddServiceOpen(true)}
          onDeleteService={handleDeleteService}
          accounts={accounts}
        />

        {/* Middle Area: The 3 Status Columns or Empty State */}
        <div className="flex-1 flex flex-col min-w-0 self-stretch">
          
          {selectedService ? (
            <>
              {/* Active Service Banner */}
              <div className="mb-2.5 bg-slate-900 border border-slate-800 rounded-2xl p-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                
                {/* Service Title */}
                <div className="flex items-center space-x-3 shrink-0">
                  <span className="text-2xl p-1 bg-slate-800 rounded-xl border border-slate-700">
                    {selectedService.emoji}
                  </span>
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
                      {selectedService.name}
                      <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-sans font-normal">
                        {rawServiceAccounts.length} accounts
                      </span>
                    </h2>
                    <p className="text-[11px] text-slate-400">
                      Auto-sorted by expiry date (soonest on top)
                    </p>
                  </div>
                </div>

                {/* Account Search Bar */}
                <div className="relative flex-1 max-w-xs">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    services={services}
                  type="text"
                    placeholder="Find account by email, client, platform..."
                    value={accountSearchTerm}
                    onChange={(e) => setAccountSearchTerm(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-7 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  {accountSearchTerm && (
                    <button
                      onClick={() => setAccountSearchTerm('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Action Buttons: Bulk Import + Add Account */}
                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => setIsBulkImportOpen(true)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl transition-colors cursor-pointer"
                    title="Import multiple accounts from file or text"
                  >
                    <UploadCloud className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Bulk Import</span>
                  </button>

                  <button
                    onClick={() => {
                      setAddAccountInitialStatus('fresh');
                      setIsAddAccountOpen(true);
                    }}
                    className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Account</span>
                  </button>
                </div>

              </div>

              {/* Quick Filter Bar & Hide Expired Toggle */}
              <div className="mb-2.5 flex items-center justify-between flex-wrap gap-2 text-xs">
                
                {/* Filter Pills */}
                <div className="flex items-center space-x-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-semibold px-2 flex items-center gap-1">
                    <Filter className="w-3 h-3 text-slate-500" /> Filter:
                  </span>
                  <button
                    onClick={() => setExpiryFilter('all')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      expiryFilter === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setExpiryFilter('today')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      expiryFilter === 'today' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-rose-300'
                    }`}
                  >
                    Expiring Today
                  </button>
                  <button
                    onClick={() => setExpiryFilter('under7')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      expiryFilter === 'under7' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-amber-300'
                    }`}
                  >
                    &lt; 7 Days
                  </button>
                  <button
                    onClick={() => setExpiryFilter('expired')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      expiryFilter === 'expired' ? 'bg-rose-700 text-white' : 'text-slate-400 hover:text-rose-400'
                    }`}
                  >
                    Expired Only
                  </button>
                </div>

                {/* Hide Expired Checkbox */}
                <label className="flex items-center space-x-2 text-xs text-slate-400 hover:text-slate-200 cursor-pointer bg-slate-900/60 border border-slate-800 px-3 py-1 rounded-xl">
                  <input
                    services={services}
                  type="checkbox"
                    checked={hideExpired}
                    onChange={(e) => setHideExpired(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-0 cursor-pointer"
                  />
                  <span>Hide Expired Accounts</span>
                </label>

              </div>

              {/* Floating Bulk Action Bar (When accounts are selected) */}
              {selectedAccountIds.length > 0 && (
                <div className="mb-2.5 p-2 bg-indigo-950/60 border border-indigo-500/40 rounded-xl flex items-center justify-between text-xs animate-in fade-in duration-150 flex-wrap gap-2">
                  <span className="font-semibold text-indigo-300 flex items-center gap-1.5 pl-2">
                    <CheckSquare className="w-4 h-4 text-indigo-400" />
                    {selectedAccountIds.length} accounts selected
                  </span>

                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => handleBulkMove('fresh')}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowLeft className="w-3 h-3" /> To Fresh
                    </button>
                    <button
                      onClick={() => handleBulkMove('listed')}
                      className="px-2.5 py-1 rounded-lg bg-sky-950/60 hover:bg-sky-900 text-sky-300 border border-sky-500/30 flex items-center gap-1 cursor-pointer"
                    >
                      To Listed <ArrowRight className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => setIsBulkSoldOpen(true)}
                      className="px-2.5 py-1 rounded-lg bg-purple-950/60 hover:bg-purple-900 text-purple-300 border border-purple-500/30 flex items-center gap-1 cursor-pointer font-medium"
                    >
                      <ShoppingBag className="w-3 h-3" /> Mark Sold
                    </button>
                    <button
                      onClick={handleBulkDelete}
                      className="px-2.5 py-1 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-500/30 flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" /> Delete
                    </button>
                    <button
                      onClick={handleClearSelection}
                      className="px-2 py-1 text-slate-400 hover:text-white text-xs cursor-pointer ml-1"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* The 3 Columns: Fresh, Listed, Sold */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3 overflow-x-auto pb-1">
                
                {/* 1. FRESH ACCOUNTS */}
                <StatusColumn
                  services={services}
                  type="fresh"
                  title="Fresh Stock"
                  subtitle="Ready in stock, unlisted"
                  accounts={freshAccounts}
                  selectedAccountIds={selectedAccountIds}
                  onToggleSelect={handleToggleSelect}
                  onSelectAllInColumn={handleSelectAllInColumn}
                  onOpenAddAccount={(status) => {
                    setAddAccountInitialStatus(status);
                    setIsAddAccountOpen(true);
                  }}
                  onOpenDetails={setDetailAccount}
                  onQuickMove={handleQuickMove}
                  onDropAccount={handleDropAccount}
                  onShowToast={showToast}
                />

                {/* 2. LISTED ACCOUNTS */}
                <StatusColumn
                  services={services}
                  type="listed"
                  title="Listed Stock"
                  subtitle="Active on platforms / stores"
                  accounts={listedAccounts}
                  selectedAccountIds={selectedAccountIds}
                  onToggleSelect={handleToggleSelect}
                  onSelectAllInColumn={handleSelectAllInColumn}
                  onOpenAddAccount={(status) => {
                    setAddAccountInitialStatus(status);
                    setIsAddAccountOpen(true);
                  }}
                  onOpenDetails={setDetailAccount}
                  onQuickMove={handleQuickMove}
                  onDropAccount={handleDropAccount}
                  onShowToast={showToast}
                />

                {/* 3. SOLD ACCOUNTS */}
                <StatusColumn
                  services={services}
                  type="sold"
                  title="Sold Accounts"
                  subtitle="Fulfilled to clients"
                  accounts={soldAccounts}
                  selectedAccountIds={selectedAccountIds}
                  onToggleSelect={handleToggleSelect}
                  onSelectAllInColumn={handleSelectAllInColumn}
                  onOpenAddAccount={(status) => {
                    setAddAccountInitialStatus(status);
                    setIsAddAccountOpen(true);
                  }}
                  onOpenDetails={setDetailAccount}
                  onQuickMove={handleQuickMove}
                  onDropAccount={handleDropAccount}
                  onShowToast={showToast}
                />

              </div>
            </>
          ) : (
            /* Clean Empty Slate Welcome State */
            <div className="flex-1 h-full flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-2xl p-8 text-center bg-slate-900 min-h-[500px]">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-3.5 border border-indigo-500/20">
                <Layers className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-white mb-1.5">Make room for your first service.</h3>
              <p className="text-xs text-slate-400 mb-5 max-w-sm leading-relaxed">
                Create a service, add your accounts, and follow every subscription from fresh stock to a completed sale.
              </p>
              <button
                onClick={() => setIsAddServiceOpen(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Your First Service</span>
              </button>
            </div>
          )}

        </div>

      </main>

      {/* Modals & Popups */}
      
      {/* 1. Add Service Modal */}
      {isAddServiceOpen && (      <AddServiceModal
        isOpen={isAddServiceOpen}
        onClose={() => setIsAddServiceOpen(false)}
        onAddService={handleAddService}
      />)}

      {/* 2. Add Account Modal */}
      {isAddAccountOpen && selectedService && (      <AddAccountModal
        isOpen={isAddAccountOpen}
        onClose={() => setIsAddAccountOpen(false)}
        service={selectedService}
        initialStatus={addAccountInitialStatus}
        onAddAccount={handleAddAccount}
        recentPlatforms={recentPlatforms}
      />)}

      {/* 3. Bulk Import Modal (Upload file or text paste) */}
      {isBulkImportOpen && selectedService && (      <BulkImportModal
        isOpen={isBulkImportOpen}
        onClose={() => setIsBulkImportOpen(false)}
        service={selectedService}
        onBulkImport={handleBulkImport}
      />)}

      {/* 4. Bulk Mark Sold Modal */}
      {isBulkSoldOpen && (      <BulkSoldModal
        isOpen={isBulkSoldOpen}
        onClose={() => setIsBulkSoldOpen(false)}
        selectedCount={selectedAccountIds.length}
        recentPlatforms={recentPlatforms}
        onConfirmBulkSold={handleConfirmBulkSold}
      />)}

      {/* 5. Sales & Revenue Analytics Modal */}
      {isProfitModalOpen && (      <ProfitAnalyticsModal
        isOpen={isProfitModalOpen}
        onClose={() => setIsProfitModalOpen(false)}
        services={services}
        accounts={accounts}
      />)}

      {/* 6. Account Detail Modal (Full view on click) */}
      {detailAccount && (      <AccountDetailModal
        isOpen={Boolean(detailAccount)}
        onClose={() => setDetailAccount(null)}
        account={detailAccount}
        service={services.find(s => s.id === detailAccount?.serviceId)}
        onDeleteAccount={handleDeleteAccount}
        onQuickMove={handleQuickMove}
        onShowToast={showToast}
      />)}

      {/* 7. Move Modal (When moving to Listed or Sold) */}
      {moveModal.isOpen && moveModal.account && (      <MoveAccountModal
        isOpen={moveModal.isOpen}
        onClose={() => setMoveModal({ isOpen: false, account: null, targetStatus: null })}
        account={moveModal.account}
        targetStatus={moveModal.targetStatus}
        onConfirmMove={handleConfirmMove}
        recentPlatforms={recentPlatforms}
      />)}

      {/* Toast Alert */}
      <Toast toast={toast} onClose={() => setToast(null)} />

    </div>
  );
}
