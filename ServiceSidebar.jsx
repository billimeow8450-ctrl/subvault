import React from 'react';
import { Search, Plus, Trash2, Layers } from 'lucide-react';

export default function ServiceSidebar({
  services,
  selectedServiceId,
  onSelectService,
  searchTerm,
  setSearchTerm,
  onOpenAddService,
  onDeleteService,
  accounts
}) {
  // Filter services by search term (case-insensitive)
  const filteredServices = services.filter(srv =>
    srv.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <aside className="w-full md:w-60 lg:w-64 shrink-0 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col self-stretch">
      
      {/* Header of Left Box */}
      <div className="flex items-center justify-between mb-3 shrink-0">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-indigo-400" />
          <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
            Services
          </h2>
          <span className="text-[11px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded-md font-sans">
            {services.length}
          </span>
        </div>

        {/* Plus Button to Add Service */}
        <button
          onClick={onOpenAddService}
          className="flex items-center space-x-1 px-2.5 py-1 text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors cursor-pointer"
          title="Add New Service"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-3 shrink-0">
        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search service (e.g. Amazon, Netflix)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-7 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
          >
            ×
          </button>
        )}
      </div>

      {/* Services List */}
      <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 min-h-[250px]">
        {filteredServices.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">
            {searchTerm ? (
              <p>No service matching "{searchTerm}"</p>
            ) : (
              <p>No services yet. Click + Add to create one!</p>
            )}
          </div>
        ) : (
          filteredServices.map((srv) => {
            const isSelected = srv.id === selectedServiceId;
            const serviceAccounts = accounts.filter(a => a.serviceId === srv.id);
            const totalCount = serviceAccounts.length;
            const freshCount = serviceAccounts.filter(a => a.status === 'fresh').length;

            return (
              <div
                key={srv.id}
                onClick={() => onSelectService(srv.id)}
                className={`group flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-colors border ${
                  isSelected
                    ? 'bg-indigo-600/15 border-indigo-500/40 text-white'
                    : 'bg-slate-900/40 hover:bg-slate-800/50 border-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                {/* Left: Emoji Avatar + Name */}
                <div className="flex items-center space-x-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-lg shrink-0">
                    {srv.emoji || '📦'}
                  </div>
                  <div className="truncate">
                    <p className={`text-xs font-semibold truncate ${isSelected ? 'text-indigo-200' : 'text-slate-200'}`}>
                      {srv.name}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {freshCount} fresh • {totalCount} total
                    </p>
                  </div>
                </div>

                {/* Right: Low Stock Alert Badge + Count pill & Delete */}
                <div className="flex items-center space-x-1.5 shrink-0">
                  
                  {/* Low Stock Warning Pill */}
                  {freshCount === 0 && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30 font-semibold" title="No fresh accounts left">
                      Out
                    </span>
                  )}
                  {freshCount > 0 && freshCount <= 2 && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold" title="Only 1 fresh account left">
                      Low ({freshCount})
                    </span>
                  )}

                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-sans font-medium ${
                    isSelected ? 'bg-indigo-500/30 text-indigo-300' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {totalCount}
                  </span>

                  {services.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Delete service "${srv.name}" and all its accounts?`)) {
                          onDeleteService(srv.id);
                        }
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 rounded transition-opacity"
                      title="Delete Service"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

    </aside>
  );
}
