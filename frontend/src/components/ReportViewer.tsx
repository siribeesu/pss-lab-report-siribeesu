import React from "react";
import { FileText, Download, Calendar, Activity } from "lucide-react";
import { parseISO, format } from "date-fns";
import StatusBadge from "./StatusBadge";
import { LabReport } from "../types";
import { API_BASE_URL } from "../constants";

interface ReportViewerProps {
  report: LabReport | null;
  onClose: () => void;
}

const ReportViewer: React.FC<ReportViewerProps> = ({ report, onClose }) => {
  if (!report) return null;

  // Extract just the filename from the path to avoid double-nesting or path issues
  const fileNameOnly = report.file_path ? report.file_path.split(/[/\\]/).pop() : null;
  const fileUrl = fileNameOnly ? `/uploads/${fileNameOnly}` : null;
  
  // Debug log to trace file loading issues
  console.log("Loading report preview:", { fileNameOnly, fileUrl, originalPath: report.file_path });
  const isImage = fileUrl && (fileUrl.toLowerCase().endsWith('.jpg') || fileUrl.toLowerCase().endsWith('.jpeg') || fileUrl.toLowerCase().endsWith('.png') || fileUrl.toLowerCase().endsWith('.webp'));
  const isPdf = fileUrl && fileUrl.toLowerCase().endsWith('.pdf');

  return (
    <div className="flex flex-col md:flex-row h-[70vh] bg-surface-container-lowest overflow-hidden">
      
      {/* Details Bar */}
      <div className="w-full md:w-1/3 border-r border-slate-100 p-6 flex flex-col gap-6 overflow-y-auto bg-slate-50/30">
         <div>
            <h3 className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1">Diagnostic Report</h3>
            <h2 className="text-xl font-headline font-black text-teal-950">{report.report_type}</h2>
            <p className="text-[8px] text-slate-300 mt-1">DB: {report.file_path || 'None'} | URL: {fileUrl || 'None'}</p>
         </div>

         <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
               <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1 flex items-center gap-1"><Calendar size={12}/> Date</p>
               <p className="text-sm font-bold text-slate-700">
                  {report.report_date ? format(parseISO(report.report_date as any), 'MMM d, yyyy') : 'N/A'}
               </p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
               <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1 flex items-center gap-1"><Activity size={12}/> Status</p>
               <StatusBadge status={report.status as any} />
            </div>
         </div>

         <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm space-y-3">
            <div>
               <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1">Result Value:</p>
               <p className={`text-2xl font-black ${report.status === 'Abnormal' ? 'text-error' : 'text-primary'}`}>
                  {report.result_value || '—'} <span className="text-xs font-bold text-slate-400">{report.unit}</span>
               </p>
            </div>
            {report.ref_range_min && report.ref_range_max && (
               <div className="pt-3 border-t border-slate-50">
                  <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1">Reference Range:</p>
                  <p className="text-sm font-bold text-slate-600">{report.ref_range_min} - {report.ref_range_max} {report.unit}</p>
               </div>
            )}
         </div>

         {report.notes && (
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex-grow">
               <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-2">Clinical Notes</p>
               <p className="text-sm text-slate-600 font-medium whitespace-pre-wrap">{report.notes}</p>
            </div>
         )}
      </div>

      {/* Document Viewer */}
      <div className="flex-1 bg-slate-100/50 flex flex-col relative">
         {fileUrl ? (
            <div className="flex-1 overflow-hidden flex flex-col relative w-full h-full p-6">
               <div className="absolute top-8 right-8 z-10">
                  <a 
                     href={fileUrl} 
                     download={report.file_name || "report"} 
                     target="_blank" 
                     rel="noreferrer"
                     className="bg-white/90 backdrop-blur shadow-xl text-primary font-bold px-4 py-2 rounded-full border border-slate-100 flex items-center gap-2 hover:bg-white transition-all text-xs"
                  >
                     <Download size={14} /> Download File
                  </a>
               </div>
               
               {isImage ? (
                  <div className="flex-1 rounded-2xl overflow-hidden bg-white shadow-[0px_12px_32px_rgba(24,28,28,0.05)] border border-slate-200 flex items-center justify-center p-4">
                     <img src={fileUrl} alt="Report Preview" className="max-w-full max-h-full object-contain rounded-xl" />
                  </div>
                ) : isPdf ? (
                  <div className="flex-1 rounded-2xl overflow-hidden bg-white shadow-[0px_12px_32px_rgba(24,28,28,0.05)] border border-slate-200">
                     <iframe 
                        src={`${fileUrl}#view=FitH`} 
                        title="Document Viewer" 
                        className="w-full h-full border-none"
                        type="application/pdf"
                     />
                  </div>
                ) : (
                  <div className="flex-1 rounded-2xl overflow-hidden bg-white shadow-[0px_12px_32px_rgba(24,28,28,0.05)] border border-slate-200 flex flex-col items-center justify-center p-8 text-center space-y-4">
                     <FileText size={40} className="text-slate-300" />
                     <p className="text-sm font-medium text-slate-500">This file type cannot be previewed directly.</p>
                     <a href={fileUrl} target="_blank" rel="noreferrer" className="text-xs font-bold text-primary underline">Open in new tab</a>
                  </div>
                )}
            </div>
         ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 space-y-4">
               <div className="p-6 bg-slate-100 rounded-full">
                  <FileText size={48} className="opacity-50" />
               </div>
               <p className="font-bold text-sm">No source document attached</p>
            </div>
         )}
      </div>
    </div>
  );
};

export default ReportViewer;
