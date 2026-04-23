import React from "react";
import { REPORT_TYPES, STATUS_OPTIONS } from "../constants";

interface FilterBarProps {
  filters: {
    report_type?: string;
    status?: string;
    date_from?: string;
    date_to?: string;
  };
  onChange: (updates: Partial<FilterBarProps["filters"]>) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ filters, onChange }) => {
  return (
    <div className="flex flex-wrap gap-4 items-end bg-white p-4 rounded-lg border border-slate-200">
      <div className="space-y-1">
        <label className="text-[10px] font-bold text-slate-400 uppercase">Test Type</label>
        <select
          value={filters.report_type || ""}
          onChange={(e) => onChange({ report_type: e.target.value })}
          className="block w-full px-3 py-1.5 text-sm bg-slate-50 border-none rounded-md focus:ring-2 focus:ring-primary/20 text-slate-700"
        >
          <option value="">All Types</option>
          {REPORT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div className="space-y-1">
        <label className="text-[10px] font-bold text-slate-400 uppercase">Status</label>
        <select
          value={filters.status || ""}
          onChange={(e) => onChange({ status: e.target.value })}
          className="block w-full px-3 py-1.5 text-sm bg-slate-50 border-none rounded-md focus:ring-2 focus:ring-primary/20 text-slate-700"
        >
          <option value="">All Status</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="space-y-1">
        <label className="text-[10px] font-bold text-slate-400 uppercase">From Date</label>
        <input
          type="date"
          value={filters.date_from || ""}
          onChange={(e) => onChange({ date_from: e.target.value })}
          className="block w-full px-3 py-1.5 text-sm bg-slate-50 border-none rounded-md focus:ring-2 focus:ring-primary/20 text-slate-700"
        />
      </div>

      <div className="space-y-1">
        <label className="text-[10px] font-bold text-slate-400 uppercase">To Date</label>
        <input
          type="date"
          value={filters.date_to || ""}
          onChange={(e) => onChange({ date_to: e.target.value })}
          className="block w-full px-3 py-1.5 text-sm bg-slate-50 border-none rounded-md focus:ring-2 focus:ring-primary/20 text-slate-700"
        />
      </div>

      <button
        onClick={() => onChange({ report_type: "", status: "", date_from: "", date_to: "" })}
        className="text-xs text-slate-400 hover:text-primary font-medium py-2 px-2"
      >
        Clear Filters
      </button>
    </div>
  );
};

export default FilterBar;
