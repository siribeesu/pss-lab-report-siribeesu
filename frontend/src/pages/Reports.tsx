import React, { useEffect, useState, useRef } from "react";
import { Filter, Download as DownloadIcon, FileText, X, RotateCcw } from "lucide-react";
import { parseISO, format } from "date-fns";
import { useNavigate } from "react-router-dom";
import useReportStore from "../store/reportStore";
import useUIStore from "../store/uiStore";
import { bulkUploadReports } from "../api/reports";
import useSettingsStore from "../store/settingsStore";
import ReportTable from "../components/ReportTable";
import SearchBar from "../components/SearchBar";
import EmptyState from "../components/EmptyState";
import { Dialog } from "../components/ui/Dialog";
import ReportViewer from "../components/ReportViewer";
import { LabReport } from "../types";

const Reports: React.FC = () => {
  const { reports, loading, fetchReports, deleteReport } = useReportStore();
  const { addToast } = useUIStore();
  const { reportTypes } = useSettingsStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState<string>("");
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [filters, setFilters] = useState({
    report_type: "",
    status: "",
    date_from: "",
    date_to: ""
  });
  const [selectedReport, setSelectedReport] = useState<LabReport | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchReports({ 
      search, 
      ...filters 
    });
  }, [search, filters, fetchReports]);

  const handleDeleteReport = async (id: string) => {
    try {
      await deleteReport(id);
      fetchReports({ search, ...filters });
      addToast("Laboratory report deleted successfully", "warning");
    } catch (err) {
      console.error(err);
      addToast("Failed to delete report", "error");
    }
  };

  const resetFilters = () => {
    setFilters({
      report_type: "",
      status: "",
      date_from: "",
      date_to: ""
    });
  };

  const handleExport = () => {
    if (!reports || reports.length === 0) {
      return;
    }

    const headers = ["Date", "Patient Name", "Patient ID", "Test Type", "Result", "Unit", "Status", "Notes"];
    const csvRows = [
      headers.join(","),
      ...reports.map(r => [
        `"${r.report_date ? format(parseISO(r.report_date as any), 'dd-MMM-yyyy') : 'N/A'}"`,
        `"${r.patient?.name || 'N/A'}"`,
        `"${r.patient?.patient_id || 'N/A'}"`,
        `"${r.report_type}"`,
        r.result_value || 'N/A',
        r.unit || 'N/A',
        r.status,
        `"${r.notes?.replace(/"/g, '""') || ''}"`
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Diagnostic_Reports_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  return (
    <div className="p-8 w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-extrabold text-teal-900 tracking-tight font-headline text-center md:text-left">Diagnostic Reports</h1>
          <p className="text-on-surface-variant font-medium font-body leading-relaxed text-center md:text-left">Review and manage clinical lab results across all patients.</p>
        </div>
        
        <div className="flex items-center justify-center gap-3">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`px-5 py-2.5 rounded-full border font-bold transition-all flex items-center gap-2 text-sm ${
              showFilters || Object.values(filters).some(v => v !== "")
                ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                : "border-slate-200 text-primary hover:bg-surface-container-low"
            }`}
          >
            {showFilters ? <X size={18} /> : <Filter size={18} />}
            {Object.values(filters).some(v => v !== "") ? "Filters Active" : "Filters"}
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-200/50 animate-in zoom-in-95 duration-200 flex flex-col gap-6">
           <div className="flex items-center justify-between">
              <h3 className="font-black text-teal-950 uppercase tracking-widest text-xs">Filter Parameters</h3>
              <button onClick={resetFilters} className="text-slate-400 hover:text-primary flex items-center gap-2 text-xs font-bold transition-colors">
                 <RotateCcw size={14} />
                 Reset All
              </button>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Report Type</label>
                 <select 
                    value={filters.report_type}
                    onChange={(e) => setFilters({...filters, report_type: e.target.value})}
                    className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                 >
                    <option value="">All Test Types</option>
                    {reportTypes.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
                 </select>
              </div>
              
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Clinical Status</label>
                 <select 
                    value={filters.status}
                    onChange={(e) => setFilters({...filters, status: e.target.value})}
                    className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                 >
                    <option value="">All Statuses</option>
                    <option value="Normal">Normal</option>
                    <option value="Abnormal">Abnormal</option>
                    <option value="Pending">Pending</option>
                 </select>
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">From Date</label>
                 <input 
                    type="date"
                    value={filters.date_from}
                    onChange={(e) => setFilters({...filters, date_from: e.target.value})}
                    className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                 />
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">To Date</label>
                 <input 
                    type="date"
                    value={filters.date_to}
                    onChange={(e) => setFilters({...filters, date_to: e.target.value})}
                    className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                 />
              </div>
           </div>
        </div>
      )}

      <div className="bg-surface-container-lowest rounded-xl shadow-[0px_12px_32px_rgba(24,28,28,0.04)] overflow-hidden border border-slate-100">
        <div className="px-8 py-4 border-b border-slate-50 bg-slate-50/30 flex items-center gap-4">
           <SearchBar value={search} onChange={setSearch} placeholder="Filter reports by patient name, type, or clinical status..." />
           <button 
             onClick={handleExport}
             className="px-6 py-3 rounded-2xl bg-primary text-white font-bold shadow-lg shadow-primary/10 hover:shadow-primary/20 hover:bg-teal-800 transition-all flex items-center gap-2 text-sm shrink-0"
           >
             <DownloadIcon size={18} />
             Export Data
           </button>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 space-y-4">
              {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-16 bg-slate-50 animate-pulse rounded-xl" />)}
            </div>
          ) : reports && reports.length > 0 ? (
            <ReportTable 
              reports={reports} 
              showPatient={true} 
              onView={(r) => setSelectedReport(r)}
              onEdit={(r) => navigate(`/reports/upload/${r.id}`)} 
              onDelete={handleDeleteReport} 
            />
          ) : (
            <EmptyState 
              title="No Reports Found"
              message={search || Object.values(filters).some(v => v !== "")
                ? "No clinical reports found matching your criteria. Try adjusting your search or filter parameters."
                : "The diagnostic report directory is currently empty. Start by uploading a new lab result."}
              icon={FileText}
              action={(search || Object.values(filters).some(v => v !== "")) && (
                <button 
                  onClick={resetFilters}
                  className="px-8 py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-teal-900 font-bold text-sm transition-all active:scale-95 shadow-sm"
                >
                  Reset All Filters
                </button>
              )}
            />
          )}
        </div>
      </div>

      <Dialog
        open={!!selectedReport}
        onClose={() => setSelectedReport(null)}
        title="Diagnostic Report Overview"
        maxWidth="max-w-5xl"
      >
        {selectedReport && <ReportViewer report={selectedReport} onClose={() => setSelectedReport(null)} />}
      </Dialog>
    </div>
  );
};

export default Reports;
