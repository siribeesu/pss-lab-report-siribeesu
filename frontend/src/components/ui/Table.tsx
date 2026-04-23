import React from "react";
import { clsx } from "clsx";

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export const Table: React.FC<TableProps> = ({ children, className }) => (
  <div className="w-full overflow-auto">
    <table className={clsx("w-full text-sm text-left text-slate-500", className)}>
      {children}
    </table>
  </div>
);

export const TableHeader: React.FC<TableProps> = ({ children, className }) => (
  <thead className={clsx("text-xs text-slate-700 uppercase bg-slate-50 border-b border-slate-200", className)}>
    {children}
  </thead>
);

export const TableBody: React.FC<TableProps> = ({ children, className }) => (
  <tbody className={clsx("divide-y divide-slate-100", className)}>{children}</tbody>
);

export const TableRow: React.FC<TableProps> = ({ children, className }) => (
  <tr className={clsx("bg-white hover:bg-slate-50/50 transition-colors", className)}>{children}</tr>
);

export const TableHead: React.FC<TableProps> = ({ children, className }) => (
  <th className={clsx("px-6 py-4 font-bold text-slate-800", className)}>{children}</th>
);

export const TableCell: React.FC<TableProps> = ({ children, className }) => (
  <td className={clsx("px-6 py-4", className)}>{children}</td>
);
