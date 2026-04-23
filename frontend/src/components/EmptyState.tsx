import React from "react";
import { ClipboardList, LucideIcon } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
  title, 
  message, 
  icon: Icon = ClipboardList,
  action 
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-40 px-6 text-center animate-in fade-in zoom-in-95 duration-500 min-h-[600px]">
      <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-300 mb-8 shadow-inner border border-slate-100/50 rotate-3 transition-transform hover:rotate-0 duration-700">
        <Icon size={48} strokeWidth={1.5} />
      </div>
      
      {title && (
        <h3 className="text-2xl font-black text-teal-950 font-headline tracking-tight mb-2">
          {title}
        </h3>
      )}
      
      <p className="text-slate-500 max-w-sm mx-auto font-medium font-body leading-relaxed">
        {message || "No data available at the moment."}
      </p>
      
      {action && (
        <div className="mt-10">
          {action}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
