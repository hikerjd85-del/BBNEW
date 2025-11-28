import React from 'react';
import { FilterState, FISCAL_YEARS, GEO_ZONES, UNION_GROUPS, URBAN_RURAL } from '../types';
import { Filter, Activity, Settings } from 'lucide-react';

interface SidebarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  onRunPrediction: () => void;
  isPredicting: boolean;
}

const SelectGroup = ({ label, value, onChange, options }: { label: string, value: string, onChange: (val: string) => void, options: string[] }) => (
  <div className="mb-4">
    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
      {label}
    </label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 block p-2.5"
    >
      <option value="">All</option>
      {options.map(opt => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  </div>
);

export const Sidebar: React.FC<SidebarProps> = ({ filters, setFilters, onRunPrediction, isPredicting }) => {
  return (
    <aside className="fixed top-0 left-0 z-40 w-64 h-screen transition-transform -translate-x-full sm:translate-x-0 bg-slate-900 border-r border-slate-800">
      <div className="h-full px-4 py-6 overflow-y-auto">
        <div className="flex items-center mb-8 px-2">
          <Activity className="w-8 h-8 text-teal-500 mr-3" />
          <h1 className="text-xl font-bold text-white tracking-tight">Burnout<span className="text-teal-500">Shield</span></h1>
        </div>

        <div className="mb-6 px-2">
          <h2 className="flex items-center text-sm font-semibold text-white mb-4">
            <Filter className="w-4 h-4 mr-2" />
            Cohort Filters
          </h2>
          
          <SelectGroup 
            label="Fiscal Year" 
            options={FISCAL_YEARS} 
            value={filters.fy} 
            onChange={(v) => setFilters(prev => ({ ...prev, fy: v }))} 
          />
          <SelectGroup 
            label="Geo Zone" 
            options={GEO_ZONES} 
            value={filters.geoZone} 
            onChange={(v) => setFilters(prev => ({ ...prev, geoZone: v }))} 
          />
          <SelectGroup 
            label="Union Group" 
            options={UNION_GROUPS} 
            value={filters.unionGroup} 
            onChange={(v) => setFilters(prev => ({ ...prev, unionGroup: v }))} 
          />
          <SelectGroup 
            label="Urban / Rural" 
            options={URBAN_RURAL} 
            value={filters.urbanRural} 
            onChange={(v) => setFilters(prev => ({ ...prev, urbanRural: v }))} 
          />
        </div>

        <div className="px-2 pt-4 border-t border-slate-800">
          <button
            onClick={onRunPrediction}
            disabled={isPredicting}
            className={`w-full flex items-center justify-center py-3 px-4 rounded-lg text-white font-medium transition-all ${
              isPredicting 
                ? 'bg-slate-700 cursor-wait' 
                : 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 shadow-lg shadow-teal-900/50'
            }`}
          >
            {isPredicting ? (
              <span className="flex items-center">
                <Settings className="animate-spin w-4 h-4 mr-2" />
                Processing...
              </span>
            ) : (
              "Run Prediction"
            )}
          </button>
          <p className="mt-3 text-xs text-slate-500 text-center">
            Model: Linear Regression (Lag-1)
          </p>
        </div>
      </div>
    </aside>
  );
};
