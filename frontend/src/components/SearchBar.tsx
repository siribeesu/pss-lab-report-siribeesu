import React, { useState, useEffect } from "react";
import { Search, X } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, placeholder = "Search..." }) => {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    const timer = setTimeout(() => {
      onChange(localValue);
    }, 300);
    return () => clearTimeout(timer);
  }, [localValue, onChange]);

  return (
    <div className="relative flex-1 group">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors duration-300" />
      </div>
      <input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        className="block w-full pl-11 pr-12 py-3.5 bg-white border border-slate-200 rounded-2xl leading-5 font-semibold text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-slate-50/50 transition-all duration-300 shadow-sm hover:border-slate-300 sm:text-sm"
      />
      {localValue && (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          <button 
            onClick={() => {
              setLocalValue("");
              onChange("");
            }}
            className="p-1.5 rounded-xl text-slate-300 hover:text-error hover:bg-error/5 transition-all duration-200"
            title="Clear search"
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
