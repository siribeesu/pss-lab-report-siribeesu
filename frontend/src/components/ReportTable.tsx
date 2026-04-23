import React from "react";
import { Droplets, Activity, FileText, Pen, Trash2, Eye } from "lucide-react";
import { parseISO, format } from "date-fns";
import StatusBadge from "./StatusBadge";
import { LabReport } from "../types";

interface ReportTableProps {
  reports: LabReport[];
  showPatient?: boolean;
  onView?: (report: LabReport) => void;
  onEdit?: (report: LabReport) => void;
  onDelete?: (id: string) => void;
}

const ReportTable: React.FC<ReportTableProps> = ({ reports, onView, onEdit, onDelete }) => {
  const getIcon = (type: string) => {
    if (type.includes("Blood")) return <Droplets size={16} />;
    if (type.includes("Urine")) return <Activity size={16} />;
    return <FileText size={16} />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse border border-slate-200">
        <thead>
          <tr className="bg-slate-50/50 border-b border-slate-200">
            <th className="px-8 py-5 text-[11px] font-black text-slate-500 uppercase tracking-widest font-body">Patient Name</th>
            <th className="px-8 py-5 text-[11px] font-black text-slate-500 uppercase tracking-widest font-body">Report Type</th>
            <th className="px-8 py-5 text-[11px] font-black text-slate-500 uppercase tracking-widest font-body">Date Generated</th>
            <th className="px-8 py-5 text-[11px] font-black text-slate-500 uppercase tracking-widest font-body">Clinical Status</th>
            <th className="px-8 py-5 text-[11px] font-black text-slate-500 uppercase tracking-widest font-body text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white">
          {reports.map((report) => (
            <tr key={report.id} className="hover:bg-slate-50 transition-colors group">
              <td className="px-8 py-5">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-200 to-slate-100 flex items-center justify-center text-slate-500 font-black shadow-inner border border-slate-200/50">
                    {(report.patient?.name || (report as any).patient_name || 'J').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-[15px] font-bold text-teal-950 font-body group-hover:text-primary transition-colors whitespace-nowrap">
                      {report.patient?.name || (report as any).patient_name || 'Julianna Simmons'}
                    </div>
                    <div className="text-[11px] text-slate-400 font-bold mt-0.5 tracking-wide whitespace-nowrap">
                      #{report.patient?.patient_id || (report as any).patient_id_code || 'ID-XXX'}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-8 py-5 text-sm text-slate-600 font-medium font-body">
                <div className="flex items-center gap-3 whitespace-nowrap">
                  <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                    {getIcon(report.report_type)}
                  </div>
                  {report.report_type}
                </div>
              </td>
              <td className="px-8 py-5 text-sm text-slate-500 font-medium font-body whitespace-nowrap">
                {report.report_date ? format(parseISO(report.report_date as any), 'MMM d, yyyy') : 'N/A'}
              </td>
              <td className="px-8 py-5 whitespace-nowrap">
                <StatusBadge status={report.status as any} />
              </td>
              <td className="px-8 py-5 text-right">
                <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                  <button 
                    onClick={() => onView && onView(report)}
                    className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors cursor-pointer"
                    title="View Report Details"
                  >
                    <Eye size={16} />
                  </button>
                  <button 
                    onClick={() => onEdit && onEdit(report)}
                    className="p-2 text-primary hover:bg-primary/5 rounded-lg transition-colors cursor-pointer"
                    title="Edit Report"
                  >
                    <Pen size={16} />
                  </button>
                  <button 
                    onClick={() => onDelete && onDelete(report.id)}
                    className="p-2 text-error hover:bg-error/5 rounded-lg transition-colors cursor-pointer"
                    title="Delete Report"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReportTable;
