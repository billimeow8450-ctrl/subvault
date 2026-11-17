import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { emojiSuggestions } from './initialData';

export default function AddServiceModal({ isOpen, onClose, onAddService }) {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('📦');
  const [customEmoji, setCustomEmoji] = useState('');

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
    if (!name.trim()) return;

    const emoji = customEmoji.trim() || selectedEmoji;
    onAddService({
      id: crypto.randomUUID(),
      name: name.trim(),
      emoji: emoji
    });
    setName('');
    setCustomEmoji('');
    onClose();
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
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-lg">
              {customEmoji || selectedEmoji}
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Add New Service</h3>
              <p className="text-[11px] text-slate-400">Create a category to manage accounts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors shrink-0"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          
          {/* Service Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Service Name *
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="e.g. Amazon, Netflix, Disney+, NordVPN..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Emoji Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Choose Service Emoji Avatar
            </label>
            
            {/* Quick Picker Grid */}
            <div className="grid grid-cols-8 gap-1.5 mb-2.5 p-2 bg-slate-900/60 border border-slate-800 rounded-xl max-h-32 overflow-y-auto">
              {emojiSuggestions.map((emoji) => (
                <button
                  type="button"
                  key={emoji}
                  onClick={() => {
                    setSelectedEmoji(emoji);
                    setCustomEmoji('');
                  }}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-base transition-all cursor-pointer ${
                    selectedEmoji === emoji && !customEmoji
                      ? 'bg-indigo-600 text-white ring-2 ring-indigo-400'
                      : 'hover:bg-slate-800 text-slate-200'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>

            {/* Custom Emoji Input */}
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-400">Or type custom emoji:</span>
              <input
                type="text"
                placeholder="e.g. 🍿"
                maxLength={2}
                value={customEmoji}
                onChange={(e) => setCustomEmoji(e.target.value)}
                className="w-14 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-center text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Buttons */}
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
              Add Service
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
