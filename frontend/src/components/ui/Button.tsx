import React from "react";
import { clsx } from "clsx";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost" | "destructive";
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ children, className, variant = "primary", isLoading, ...props }) => {
  const variants = {
    primary: "bg-primary text-white hover:bg-primary/90",
    outline: "border border-slate-200 bg-white hover:bg-slate-50 text-slate-700",
    ghost: "hover:bg-slate-100 text-slate-600",
    destructive: "bg-red-500 text-white hover:bg-red-600",
  };

  return (
    <button
      disabled={isLoading || props.disabled}
      className={clsx(
        "px-4 py-2 rounded-md font-medium transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50",
        variants[variant],
        className
      )}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin h-4 w-4 text-current" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  );
};
