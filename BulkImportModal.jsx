import { parseCredentials } from './inventory';
import React, { useState, useEffect, useRef } from 'react';
import { X, UploadCloud, CheckCircle2, Calendar } from 'lucide-react';
import { calculateExpiry, localDate } from './dateUtils';

export default function BulkImportModal({
  isOpen,
  onClose,
  service,
  onBulkImport
}) {
  if (!isOpen || !service) return null;

  const todayStr = localDate();
  const fileInputRef = useRef(null);

  const [rawText, setRawText] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(todayStr);
  const [durationDays, setDurationDays] = useState(30);
  const targetStatus = 'fresh';
  const [fileName, setFileName] = useState('');

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const parsedList = parseCredentials(rawText);

  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      setRawText(content);
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    if (parsedList.length === 0 || !purchaseDate || Number(durationDays) < 1 || Number(durationDays) > 10000) return;

    const calculatedExpiry = calculateExpiry(purchaseDate, durationDays);
    const now = new Date();
    const formattedAddedAt = now.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const newAccounts = parsedList.map((item, idx) => ({
      id: `acc-bulk-${Date.now()}-${idx}`,
      serviceId: service.id,
      status: targetStatus,
      email: item.email,
      password: item.password,
      purchaseDate: purchaseDate,
      durationDays: Number(durationDays),
      expiryDate: calculatedExpiry,
      addedAt: formattedAddedAt,
      platform: null,
      listedAt: null,
      customerName: null,
      soldPrice: null,
      soldAt: null,
      notes: `Bulk imported (${fileName || 'Text paste'})`
    }));

    onBulkImport(newAccounts);
    setRawText('');
    setFileName('');
    onClose();
  };

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/40 backdrop-blur-xs"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        
        {/* Sticky Header with Always-Visible Close (X) */}
        <div className="sticky top-0 z-20 bg-slate-900 p-3.5 sm:p-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5 min-w-0">
            <span className="text-xl shrink-0 p-1 bg-slate-800 rounded-lg">{service.emoji}</span>
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-white truncate">Bulk Import Accounts</h3>
                <span className="text-[10px] bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-medium">
                  {service.name}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Import multiple accounts from text or file</p>
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
          
          {/* File Upload Box */}
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-700/80 hover:border-indigo-500/60 rounded-xl p-4 text-center cursor-pointer transition-colors bg-slate-900/40 hover:bg-slate-900/80 group"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.csv"
              onChange={handleFileUpload}
              className="hidden"
            />
            <UploadCloud className="w-6 h-6 text-indigo-400 mx-auto mb-1.5 group-hover:scale-110 transition-transform" />
            <p className="text-xs font-semibold text-slate-200">
              {fileName ? `Loaded: ${fileName}` : 'Click to Upload .txt or .csv File'}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Format: email:password or email,password (one per line)
            </p>
          </div>

          {/* Or Paste Raw Text */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-300">
                Or Paste Account List:
              </label>
              <span className="text-[11px] font-sans text-indigo-400">
                {parsedList.length} accounts detected
              </span>
            </div>
            <textarea
              rows={5}
              placeholder={`user1@gmail.com:pass123\nuser2@gmail.com:pass456\nuser3@gmail.com:pass789`}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-3 text-xs font-sans text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Dates & Validity for Bulk Accounts */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                Subscription Settings (Applied to all imported accounts)
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
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
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

            <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
              Expiry Date: <strong className="text-slate-200">{calculateExpiry(purchaseDate, durationDays)}</strong>
            </div>
          </div>

          {/* Live Preview List */}
          {parsedList.length > 0 && (
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-400 block">
                Preview ({Math.min(parsedList.length, 5)} of {parsedList.length}):
              </span>
              <div className="space-y-1 max-h-24 overflow-y-auto font-sans text-[11px]">
                {parsedList.slice(0, 5).map((acc, i) => (
                  <div key={i} className="flex items-center justify-between py-1 px-2 rounded bg-slate-950/70 border border-slate-800">
                    <span className="text-slate-300 truncate">{acc.email}</span>
                    <span className="text-slate-500">••••••••</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Sticky Footer */}
        <div className="sticky bottom-0 z-20 bg-slate-900 p-3 border-t border-slate-800 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-medium text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={parsedList.length === 0 || !purchaseDate || Number(durationDays) < 1}
            onClick={handleImport}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 ${
              parsedList.length > 0
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Import {parsedList.length} Accounts to Fresh</span>
          </button>
        </div>

      </div>
    </div>
  );
}
