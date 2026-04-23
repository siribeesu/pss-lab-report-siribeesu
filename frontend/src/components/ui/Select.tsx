import React from "react";
import { clsx } from "clsx";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options?: string[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, children, className, ...props }, ref) => {
    return (
      <div className="space-y-1.5 flex-1">
        {label && <label className="text-sm font-semibold text-slate-700">{label}</label>}
        <select
          ref={ref}
          className={clsx(
            "w-full px-3 py-2 rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm bg-white",
            error && "border-red-500 focus:ring-red-200",
            className
          )}
          {...props}
        >
          {!children && <option value="">Select option</option>}
          {options && options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
          {children}
        </select>
        {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
      </div>
    );
  }
);
