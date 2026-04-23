import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, FileText, AlertTriangle, Calendar, Download, UserPlus, Filter } from "lucide-react";
import { parseISO, format } from "date-fns";
import StatCard from "../components/StatCard";
import ReportTable from "../components/ReportTable";
import SearchBar from "../components/SearchBar";
import EmptyState from "../components/EmptyState";
import { getDashboardData } from "../api/dashboard";
import { updateReport as apiUpdateReport, deleteReport as apiDeleteReport } from "../api/reports";
import { Dialog } from "../components/ui/Dialog";
import PatientForm from "../components/PatientForm";
import ReportForm from "../components/ReportForm";
import ReportViewer from "../components/ReportViewer";
import useUIStore from "../store/uiStore";
import usePatientStore from "../store/patientStore";
import { DashboardStats, LabReport, Patient } from "../types";

const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { createPatient } = usePatientStore();
  const { addToast } = useUIStore();
  const navigate = useNavigate();
  const [isPatientModalOpen, setIsPatientModalOpen] = useState<boolean>(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
  const [selectedReport, setSelectedReport] = useState<LabReport | null>(null);

  const [timeframe, setTimeframe] = useState<string>('Month');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    fetchDashData();
  }, [timeframe]);

  const fetchDashData = async () => {
    setLoading(true);
    try {
      const res = await getDashboardData(timeframe);
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (report: LabReport) => {
    navigate(`/reports/upload/${report.id}`);
  };

  const handleView = (report: LabReport) => {
    setSelectedReport(report);
    setIsViewModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await apiDeleteReport(id);
      fetchDashData();
      addToast("Laboratory report deleted successfully", "warning");
    } catch (err) {
      console.error(err);
      addToast("Failed to delete report", "error");
    }
  };


  const handleDownload = () => {
    if (!filteredReports.length) return;
    
    const headers = ["Date", "Patient Name", "Patient ID", "Test Type", "Status", "Result"];
    const csvRows = [
      headers.join(","),
      ...filteredReports.map(r => [
        `"${r.report_date ? format(parseISO(r.report_date as any), 'dd-MMM-yyyy') : 'N/A'}"`,
        `"${(r as any).patient_name || ''}"`,
        `"${(r as any).patient_id_code || ''}"`,
        `"${r.report_type}"`,
        r.status,
        r.result_value || 'N/A'
       ].join(","))
    ].join("\n");

    const blob = new Blob([csvRows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Clinical_Overview_Export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const filteredReports = data?.recent_reports?.filter(r => {
     const matchesStatus = statusFilter ? r.status === statusFilter : true;
     const matchesSearch = search ? (
       (r as any).patient_name?.toLowerCase().includes(search.toLowerCase()) || 
       (r as any).patient_id_code?.toLowerCase().includes(search.toLowerCase()) || 
       r.report_type?.toLowerCase().includes(search.toLowerCase())
     ) : true;
     return matchesStatus && matchesSearch;
  }) || [];

  const handleCreatePatient = async (patientData: Partial<Patient>) => {
    try {
      await createPatient(patientData);
      setIsPatientModalOpen(false);
      fetchDashData(); // Refresh stats
      addToast("Patient profile created successfully");
    } catch (err) {
      console.error(err);
      addToast("Failed to create patient profile", "error");
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-extrabold text-teal-900 tracking-tight font-headline">Clinical Overview</h2>
          <p className="text-slate-500 font-medium font-body">Real-time diagnostics and patient volume monitoring.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 justify-center md:justify-end">
          <div className="flex bg-surface-container rounded-full p-1 h-fit">
            <button onClick={() => setTimeframe('Day')} className={`px-4 sm:px-6 py-2 rounded-full text-xs font-bold transition-colors ${timeframe === 'Day' ? 'bg-white shadow-sm text-teal-900' : 'text-slate-500 hover:text-teal-900'}`}>Day</button>
            <button onClick={() => setTimeframe('Week')} className={`px-4 sm:px-6 py-2 rounded-full text-xs font-bold transition-colors ${timeframe === 'Week' ? 'bg-white shadow-sm text-teal-900' : 'text-slate-500 hover:text-teal-900'}`}>Week</button>
            <button onClick={() => setTimeframe('Month')} className={`px-4 sm:px-6 py-2 rounded-full text-xs font-bold transition-colors ${timeframe === 'Month' ? 'bg-white shadow-sm text-teal-900' : 'text-slate-500 hover:text-teal-900'}`}>Month</button>
          </div>
          <button 
            onClick={() => setIsPatientModalOpen(true)}
            className="px-6 py-2.5 rounded-full bg-gradient-to-r from-primary to-primary-container text-white font-bold shadow-lg shadow-teal-900/20 active:scale-95 transition-all flex items-center gap-2 text-sm"
          >
            <UserPlus size={18} />
            Add Patient
          </button>
        </div>
      </div>

      {/* Bento Grid Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <StatCard title="Total Patients" value={data?.total_patients ?? 0} icon={Users} color="teal" growth="+4.2%" loading={loading} />
        <StatCard title="Total Reports" value={data?.total_reports ?? 0} icon={FileText} color="slate" growth="Overall" loading={loading} />
        <StatCard title="Abnormal Reports" value={data?.abnormal_reports ?? 0} icon={AlertTriangle} color="error" urgent={true} loading={loading} />
        <StatCard title="Reports Today" value={data?.reports_today ?? 0} icon={Calendar} color="teal" growth="Live" loading={loading} />
      </div>

      <div className="bg-surface-container-lowest rounded-xl shadow-[0px_12px_32px_rgba(24,28,28,0.04)] overflow-hidden">
        <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-50">
          <div>
            <h3 className="text-xl font-bold text-teal-900 font-headline">Recent Reports</h3>
            <p className="text-sm text-slate-500 font-body font-medium">Overview of the last 10 diagnostic clinical files.</p>
          </div>
          
          <div className="flex items-center space-x-3">
             <div className="relative group">
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none bg-surface-container border-none rounded-lg text-xs font-bold text-teal-800 py-2.5 pl-4 pr-10 focus:ring-2 focus:ring-primary/20 cursor-pointer outline-none"
                >
                  <option value="">All Statuses</option>
                  <option value="Normal">Normal</option>
                  <option value="Abnormal">Abnormal</option>
                  <option value="Pending">Pending</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-teal-800 pointer-events-none">
                   <Filter size={14} />
                </div>
             </div>
             <button onClick={handleDownload} className="p-2.5 bg-surface-container rounded-lg text-teal-800 hover:bg-slate-200 transition-colors">
               <Download size={18} />
             </button>
          </div>
        </div>

        <div className="px-4 sm:px-6 lg:px-8 py-3 border-b border-slate-50 bg-slate-50/30">
           <SearchBar value={search} onChange={setSearch} placeholder="Search recent reports by patient name, ID, or report type..." />
        </div>

        <div className="overflow-x-auto">
          {loading ? (
             <div className="p-8 space-y-4">
                {[1, 2, 3].map(i => <div key={i} className="h-16 bg-slate-50 animate-pulse rounded-xl" />)}
             </div>
          ) : filteredReports.length > 0 ? (
             <ReportTable 
               reports={filteredReports} 
               showPatient={true} 
               onEdit={handleEdit}
               onView={handleView}
               onDelete={handleDelete}
             />
          ) : (
            <EmptyState 
              title="No Reports Found"
              message={search || statusFilter 
                ? "We couldn't find any reports matching your current search criteria or filters. Try broadening your scope."
                : "The clinical database for this period is currently empty. Start by adding a new patient and uploading their diagnostic files."}
              icon={FileText}
              action={(search || statusFilter) && (
                <button 
                  onClick={() => { setSearch(''); setStatusFilter(''); }}
                  className="px-8 py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-teal-900 font-bold text-sm transition-all active:scale-95 shadow-sm"
                >
                  Clear All Filters
                </button>
              )}
            />
          )}
        </div>
      </div>

      <Dialog
        open={isPatientModalOpen}
        onClose={() => setIsPatientModalOpen(false)}
        title="New Patient Profile"
      >
        <PatientForm
          onSubmit={handleCreatePatient}
          onCancel={() => setIsPatientModalOpen(false)}
          loading={false}
        />
      </Dialog>


      <Dialog
        open={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedReport(null);
        }}
        title="Diagnostic Report Overview"
        maxWidth="5xl"
      >
        {selectedReport && (
          <ReportViewer 
            report={selectedReport} 
            onClose={() => {
              setIsViewModalOpen(false);
              setSelectedReport(null);
            }} 
          />
        )}
      </Dialog>
    </div>
  );
};

export default Dashboard;
