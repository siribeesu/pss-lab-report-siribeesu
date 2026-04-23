import React from "react";
import { clsx } from "clsx";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className }) => (
  <div className={clsx("bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden", className)}>
    {children}
  </div>
);

export const CardHeader: React.FC<CardProps> = ({ children, className }) => (
  <div className={clsx("p-6 border-b border-slate-100", className)}>{children}</div>
);

export const CardTitle: React.FC<CardProps> = ({ children, className }) => (
  <h3 className={clsx("text-lg font-bold text-slate-800", className)}>{children}</h3>
);

export const CardContent: React.FC<CardProps> = ({ children, className }) => (
  <div className={clsx("p-6", className)}>{children}</div>
);
