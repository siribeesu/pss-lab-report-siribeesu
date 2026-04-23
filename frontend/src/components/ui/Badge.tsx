import React from "react";
import { clsx } from "clsx";

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "primary" | "success" | "destructive" | "secondary";
}

export const Badge: React.FC<BadgeProps> = ({ children, className, variant = "default" }) => {
  const variants = {
    default: "bg-slate-100 text-slate-800",
    primary: "bg-primary/10 text-primary",
    success: "bg-green-100 text-green-700",
    destructive: "bg-red-100 text-red-700",
    secondary: "bg-slate-100 text-slate-600",
  };

  return (
    <span className={clsx("px-2.5 py-0.5 rounded-full text-xs font-semibold", variants[variant], className)}>
      {children}
    </span>
  );
};
