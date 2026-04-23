import React from "react";
import { Search } from "lucide-react";

const Header: React.FC = () => {
  return (
    <header className="w-full h-16 sticky top-0 z-40 bg-slate-50/80 backdrop-blur-md shadow-[0px_12px_32px_rgba(24,28,28,0.04)] flex items-center justify-between px-8 border-b border-white/20">
      <div className="flex items-center space-x-4">
        <div className="relative group">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 group-focus-within:text-primary transition-colors">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Search patient or report ID..."
            className="bg-slate-100 border-none rounded-full pl-10 pr-4 py-2 text-sm w-96 focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all outline-none font-body font-medium"
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-3">
          {/* Add user profile or notifications if needed */}
        </div>
      </div>
    </header>
  );
};

export default Header;
