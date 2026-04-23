import React from "react";
import { clsx } from "clsx";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: 'teal' | 'error' | 'slate';
  loading?: boolean;
  growth?: string;
  urgent?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color, loading, growth, urgent }) => {
  const isError = color === 'error';

  return (
    <div className={clsx(
      "bento-card p-4",
      isError && "bg-error-container border border-error/5 shadow-[0px_12px_32px_rgba(186,26,26,0.1)]"
    )}>
      <div className="flex justify-between items-start">
        <div className={clsx(
          "p-2 rounded-lg",
          isError ? "bg-white/50 text-error" : 
          color === 'teal' ? "bg-teal-50 text-primary" : "bg-slate-50 text-slate-700"
        )}>
          <Icon size={16} strokeWidth={3} />
        </div>
        {growth && (
          <span className={clsx(
            "text-[10px] font-bold px-2 py-1 rounded-full",
            color === 'teal' ? "text-teal-600 bg-teal-50" : "text-slate-400 bg-slate-50"
          )}>
            {growth}
          </span>
        )}
        {urgent && (
          <span className="text-[10px] font-bold text-white bg-error px-2 py-1 rounded-full">
            Urgent
          </span>
        )}
      </div>

      <div className="mt-4 space-y-1">
        {loading ? (
          <div className="h-8 w-20 bg-slate-100 animate-pulse rounded-lg" />
        ) : (
          <p className={clsx(
            "text-2xl font-extrabold tracking-tight font-headline",
            isError ? "text-on-error-container" : "text-teal-900"
          )}>
            {value}
          </p>
        )}
        <p className={clsx(
          "text-[10px] font-black uppercase tracking-widest font-body",
          isError ? "text-on-error-container/70" : "text-slate-400"
        )}>
          {title}
        </p>
      </div>
    </div>
  );
};

export default StatCard;
