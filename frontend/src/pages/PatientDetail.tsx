import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronRight, Upload, Filter, Download as DownloadIcon, Eye, Pen, Trash2 } from "lucide-react";
import { getPatientById } from "../api/patients";
import useReportStore from "../store/reportStore";
import useUIStore from "../store/uiStore";
import EmptyState from "../components/EmptyState";
import { Dialog } from "../components/ui/Dialog";
import ReportViewer from "../components/ReportViewer";
import { LabReport, Patient } from "../types";

const PatientDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedReport, setSelectedReport] = useState<LabReport | null>(null);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [reportFilter, setReportFilter] = useState({ status: "", type: "" });

  const { deleteReport } = useReportStore();
  const { addToast } = useUIStore();

  const fetchPatient = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await getPatientById(id);
      setPatient(res.data);
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 404) {
        navigate("/patients");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatient();
  }, [id]);

  const handleDeleteReport = async (reportId: string) => {
    try {
      await deleteReport(reportId);
      fetchPatient();
      addToast("Laboratory report deleted successfully", "warning");
    } catch (err) {
      console.error(err);
      addToast("Failed to delete report", "error");
    }
  };

  if (loading && !patient) return <div className="p-8 font-bold text-center">Loading clinical profile...</div>;
  if (!patient) return <div className="p-8 font-bold text-center">Registry record not found.</div>;

  const filteredReports = patient.reports?.filter(r => {
    if (reportFilter.status && r.status !== reportFilter.status) return false;
    if (reportFilter.type && !r.report_type.toLowerCase().includes(reportFilter.type.toLowerCase())) return false;
    return true;
  }) || [];

  const handleExport = () => {
    if (!filteredReports || filteredReports.length === 0) {
      // Alerts removed for smoother UX as requested
      return;
    }

    const headers = ["Date", "Report Type", "Result", "Unit", "Reference Range", "Status", "Notes"];
    const csvRows = [
      headers.join(","),
      ...filteredReports.map(r => [
        r.report_date,
        `"${r.report_type}"`,
        r.result_value || 'N/A',
        r.unit || 'N/A',
        `"${r.ref_range_min||''} - ${r.ref_range_max||''}"`,
        r.status,
        `"${r.notes?.replace(/"/g, '""') || ''}"`
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${patient.name.replace(/\s+/g, '_')}_Reports.csv`;
    link.click();
  };

  return (
    <div className="p-8 w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm font-medium text-on-surface-variant font-body">
        <span className="hover:text-primary cursor-pointer transition-colors" onClick={() => navigate("/patients")}>Patients</span>
        <ChevronRight size={16} />
        <span className="text-primary font-bold tracking-wide">Profile</span>
      </nav>

      {/* Consolidated Patient Header */}
      <section className="bg-surface-container-lowest p-8 rounded-2xl relative overflow-hidden shadow-sm border border-slate-100">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-4 flex-grow">
            <div>
              <h1 className="text-4xl font-extrabold text-primary tracking-tight font-headline text-center md:text-left">{patient.name}</h1>
              <p className="text-on-surface-variant font-medium font-body mt-1 text-center md:text-left">
                Patient ID: <span className="text-on-surface font-bold">#{patient.patient_id}</span>
              </p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-10 pt-6 border-t border-surface-container-low font-body max-w-2xl mx-auto md:mx-0">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Age</p>
                <p className="text-xl font-bold text-on-surface">{patient.age} Years</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Gender</p>
                <p className="text-xl font-bold text-on-surface">{patient.gender}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Contact</p>
                <p className="text-sm font-bold text-on-surface">{patient.contact_number}</p>
              </div>
            </div>
          </div>

          <div className="flex-shrink-0 w-full md:w-auto">
            <button 
              onClick={() => navigate(`/reports/upload?patientId=${id}`)}
              className="bg-primary text-white px-8 py-4 rounded-xl text-sm font-bold flex items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:bg-primary-container hover:text-on-primary-container transition-all active:scale-[0.98] w-full md:w-auto"
            >
              <Upload size={20} />
              Upload Lab Report
            </button>
          </div>
        </div>
      </section>

      {/* Report History Section */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-primary tracking-tight font-headline text-center md:text-left">Clinical Report History</h2>
            <p className="text-on-surface-variant text-sm font-medium font-body mt-1 text-center md:text-left">Reviewing comprehensive lab results and diagnostic data.</p>
          </div>
          <div className="flex items-center justify-center gap-3">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`px-5 py-2.5 text-xs font-semibold rounded-lg shadow-sm border transition-colors flex items-center gap-2 ${showFilters || reportFilter.status || reportFilter.type ? 'bg-primary text-white border-primary' : 'bg-white text-on-surface-variant border-slate-200 hover:bg-slate-50'}`}
            >
              <Filter size={16} />
              {showFilters ? 'Hide Filters' : 'Filter'}
            </button>
            <button 
              onClick={handleExport}
              className="px-5 py-2.5 bg-white text-on-surface-variant text-xs font-semibold rounded-lg shadow-sm border border-slate-200 hover:bg-slate-50 transition-colors flex items-center gap-2"
            >
              <DownloadIcon size={16} />
              Export All
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm animate-in slide-in-from-top-2 flex gap-4">
             <div className="space-y-1.5 flex-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Report Status</label>
                <select 
                  value={reportFilter.status}
                  onChange={(e) => setReportFilter({...reportFilter, status: e.target.value})}
                  className="w-full bg-slate-50 border-none rounded-lg py-2.5 px-4 text-xs font-semibold outline-none focus:ring-2 focus:ring-primary/20"
                >
                   <option value="">All Statuses</option>
                   <option value="Normal">Normal</option>
                   <option value="Abnormal">Abnormal</option>
                   <option value="Pending">Pending</option>
                </select>
             </div>
             <div className="space-y-1.5 flex-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Report Type</label>
                <input 
                  type="text"
                  placeholder="Filter by type..."
                  value={reportFilter.type}
                  onChange={(e) => setReportFilter({...reportFilter, type: e.target.value})}
                  className="w-full bg-slate-50 border-none rounded-lg py-2.5 px-4 text-xs font-semibold outline-none focus:ring-2 focus:ring-primary/20"
                />
             </div>
             {(reportFilter.status || reportFilter.type) && (
               <div className="flex items-end pb-1">
                  <button onClick={() => setReportFilter({status: "", type: ""})} className="text-xs font-bold text-slate-400 hover:text-error transition-colors underline">Clear</button>
               </div>
             )}
          </div>
        )}

        {/* History Table Container */}
        <div className="bg-white rounded-xl overflow-hidden shadow-[0px_12px_32px_rgba(24,28,28,0.02)] border border-slate-100">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse border border-slate-200 font-body">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200">
                  <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-500">Date</th>
                  <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-500">Report Type</th>
                  <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-500">Result Value</th>
                  <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-500">Unit</th>
                  <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-500">Reference Range</th>
                  <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredReports.length > 0 ? filteredReports.map(report => (
                  <tr key={report.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-5 whitespace-nowrap">
                      <p className="text-sm font-bold text-on-surface">
                        {new Date(report.report_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <p className="text-sm font-semibold text-on-surface">{report.report_type}</p>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className={`text-sm font-black ${report.status === 'Abnormal' ? 'text-error' : 'text-on-surface'}`}>
                        {report.result_value || '—'}
                      </p>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm text-on-surface-variant font-bold">{report.unit || '—'}</p>
                    </td>
                    <td className="px-6 py-5 text-sm font-medium text-on-surface-variant whitespace-nowrap">
                      {report.ref_range_min && report.ref_range_max ? `${report.ref_range_min} - ${report.ref_range_max}` : '—'}
                    </td>
                    <td className="px-6 py-5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => setSelectedReport(report)}
                          className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors cursor-pointer"
                          title="View Report Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={() => navigate(`/reports/upload/${report.id}`)}
                          className="p-2 text-primary hover:bg-primary/5 rounded-lg transition-colors cursor-pointer"
                          title="Edit Report"
                        >
                          <Pen size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteReport(report.id)}
                          className="text-error hover:bg-error/5 p-2 rounded-lg transition-colors cursor-pointer"
                          title="Delete Report"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="p-4">
                        <EmptyState message="No clinical reports on file." />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

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

export default PatientDetail;
