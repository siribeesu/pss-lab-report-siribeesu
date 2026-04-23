import { clsx } from "clsx";
import React from "react";

interface StatusBadgeProps {
  status: 'Normal' | 'Abnormal' | 'Pending';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const styles: Record<string, string> = {
    Normal: "bg-teal-50 text-teal-700",
    Abnormal: "bg-error-container text-on-error-container",
    Pending: "bg-slate-100 text-slate-500",
  };

  const dotColors: Record<string, string> = {
    Normal: "bg-teal-500",
    Abnormal: "bg-error",
    Pending: "bg-slate-400",
  };

  return (
    <div className={clsx(
      "inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold font-body",
      styles[status] || styles.Pending
    )}>
      <div className={clsx("w-1.5 h-1.5 rounded-full mr-2", dotColors[status] || dotColors.Pending)} />
      <span className="uppercase tracking-widest">{status}</span>
    </div>
  );
};

export default StatusBadge;
