import React, { useEffect, useState, useRef } from "react";
import { UserPlus, Filter, Upload, X, Download as DownloadIcon, RotateCcw } from "lucide-react";
import usePatientStore from "../store/patientStore";
import useUIStore from "../store/uiStore";
import PatientTable from "../components/PatientTable";
import SearchBar from "../components/SearchBar";
import { Dialog } from "../components/ui/Dialog";
import PatientForm from "../components/PatientForm";
import EmptyState from "../components/EmptyState";
import { bulkUploadPatients } from "../api/patients";
import { Patient } from "../types";

const PatientList: React.FC = () => {
  const { patients, loading, fetchPatients, createPatient, updatePatient, deletePatient } = usePatientStore();
  const { addToast } = useUIStore();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [search, setSearch] = useState<string>("");
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [filters, setFilters] = useState({ gender: "", minAge: "", maxAge: "" });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredPatients = (patients || []).filter(p => {
    if (!p) return false;
    
    // Search filter
    const matchesSearch = !search || (
      (p.name?.toLowerCase().includes(search.toLowerCase())) ||
      (p.patient_id?.toLowerCase().includes(search.toLowerCase()))
    );
    if (!matchesSearch) return false;

    // Gender filter
    if (filters.gender && p.gender !== filters.gender) return false;
    
    // Age filter
    const pAge = Number(p.age);
    if (filters.minAge) {
      const min = parseInt(filters.minAge);
      if (!isNaN(min) && pAge < min) return false;
    }
    if (filters.maxAge) {
      const max = parseInt(filters.maxAge);
      if (!isNaN(max) && pAge > max) return false;
    }
    
    return true;
  });

  // Ultra-defensive check
  const patientCount = Array.isArray(patients) ? patients.length : 0;
  const list = Array.isArray(filteredPatients) ? filteredPatients : [];

  useEffect(() => {
    fetchPatients(search);
  }, [search]);

  const handleCreate = async (data: Partial<Patient>) => {
    try {
      await createPatient(data);
      setIsModalOpen(false);
      addToast("Patient profile created successfully");
    } catch (err) {
      console.error(err);
      addToast("Failed to create patient profile", "error");
    }
  };

  const handleUpdate = async (data: Partial<Patient>) => {
    if (!editingPatient) return;
    try {
      await updatePatient(editingPatient.id, data);
      setIsModalOpen(false);
      setEditingPatient(null);
      addToast("Patient registry updated successfully");
    } catch (err) {
      console.error(err);
      addToast("Failed to update patient registry", "error");
    }
  };

  const handleClearAll = () => {
    setSearch("");
    setFilters({
      gender: "",
      minAge: "",
      maxAge: ""
    });
  };

  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    addToast("Starting clinical data import...", "info");

    try {
      const response = await bulkUploadPatients(formData);
      const result = response.data;
      await fetchPatients(search);
      
      const count = result?.added_count || 0;
      const errors = result?.errors || [];
      if (count > 0) {
        addToast(`Successfully imported ${count} patient records`);
      } else if (errors.length > 0) {
        addToast(`Import failed. First error: ${errors[0]}`, "error");
        console.error("All bulk import errors:", errors);
      } else {
        addToast(`No records found in file. Detected columns: ${result?.message || 'unknown'}`, "info");
      }
    } catch (err: any) {
      console.error("Bulk upload failed:", err);
      const errorMsg = err.response?.data?.detail || "Connection failed or invalid file format";
      addToast(`Import Failed: ${errorMsg}`, "error");
    } finally {
      if (fileInputRef.current) {
          fileInputRef.current.value = "";
      }
    }
  };

  const handleExport = () => {
    if (!list.length) {
      return;
    }

    const headers = ["Patient ID", "Name", "Age", "Gender", "Contact Number"];
    const csvRows = [
      headers.join(","),
      ...list.map(p => [
        `"${p.patient_id || 'N/A'}"`,
        `"${p.name || 'N/A'}"`,
        p.age || '0',
        p.gender || 'N/A',
        `"${p.contact_number || 'N/A'}"`
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Patient_Directory_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPatient(null);
  };

  return (
    <div className="p-8 w-full space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Hero Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-extrabold text-teal-900 tracking-tight font-headline text-center md:text-left">Patient Directory</h1>
          <p className="text-on-surface-variant font-medium font-body leading-relaxed text-center md:text-left">Manage and monitor {patientCount} active clinical profiles.</p>
        </div>
        
        <div className="flex items-center justify-center gap-3">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleBulkUpload} 
            accept=".csv, .xlsx, .xls" 
            className="hidden" 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="px-5 py-2.5 rounded-full border border-slate-200 text-primary font-bold hover:bg-surface-container-low transition-colors flex items-center gap-2 text-sm"
          >
            <Upload size={18} />
            Bulk Import
          </button>
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


          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-2.5 rounded-full bg-gradient-to-r from-primary to-primary-container text-white font-bold shadow-lg shadow-primary/10 hover:shadow-primary/20 active:scale-95 transition-all flex items-center gap-2 text-sm"
          >
            <UserPlus size={18} />
            Add Patient
          </button>
        </div>
      </div>


      {/* Main Table Section */}
      <div className="bg-surface-container-lowest rounded-xl shadow-[0px_12px_32px_rgba(24,28,28,0.04)] overflow-hidden">
        <div className="px-8 py-4 border-b border-slate-50 bg-slate-50/30 flex items-center gap-3">
           <SearchBar value={search} onChange={setSearch} placeholder="Filter directory by patient name, ID, or condition..." />
           

           <button 
             onClick={handleExport}
             className="px-6 py-3 rounded-2xl bg-primary text-white font-bold shadow-lg shadow-primary/10 hover:shadow-primary/20 hover:bg-teal-800 transition-all flex items-center gap-2 text-sm shrink-0"
           >
             <DownloadIcon size={18} />
             Export Data
           </button>
        </div>
        
        {showFilters && (
          <div className="px-8 py-5 bg-white border-b border-slate-100 animate-in slide-in-from-top-2 duration-300">
              <div className="flex flex-wrap items-end gap-6">
                {/* Gender Filter */}
                <div className="space-y-2.5 min-w-[180px]">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Gender</label>
                  <select 
                    value={filters.gender}
                    onChange={(e) => setFilters({...filters, gender: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/20 transition-all text-slate-700"
                  >
                    <option value="">All Genders</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Age Range Filter */}
                <div className="space-y-2.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Age Range</label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={filters.minAge}
                      onChange={(e) => setFilters({...filters, minAge: e.target.value.replace(/[^0-9]/g, '')})}
                      placeholder="Min Age"
                      className="w-24 bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                    <div className="w-3 h-0.5 bg-slate-200 rounded-full" />
                    <input 
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={filters.maxAge}
                      onChange={(e) => setFilters({...filters, maxAge: e.target.value.replace(/[^0-9]/g, '')})}
                      placeholder="Max Age"
                      className="w-24 bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                </div>

                {/* Spacer to push button to right */}
                <div className="flex-grow hidden md:block" />

                {/* Clear Button at Right Corner */}
                <div className="pb-0.5">
                  <button 
                    onClick={handleClearAll}
                    className="px-6 py-3 rounded-xl bg-error/10 border border-error/20 text-xs font-black uppercase tracking-widest text-error hover:bg-error/20 transition-all flex items-center gap-2"
                  >
                    <RotateCcw size={16} />
                    Clear Filters
                  </button>
                </div>
              </div>
          </div>
        )}

        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-16 bg-slate-50 animate-pulse rounded-xl" />)}
          </div>
        ) : list.length > 0 ? (
          <PatientTable 
            patients={list} 
            onEdit={(p) => { setEditingPatient(p); setIsModalOpen(true); }} 
            onDelete={async (id) => {
              try {
                await deletePatient(id);
                addToast("Patient record deleted permanently", "warning");
              } catch (err) {
                addToast("Failed to delete patient record", "error");
              }
            }} 
          />
        ) : (
          <EmptyState 
            title="No Patients Found"
            message={search || Object.values(filters).some(v => v !== "")
              ? "No clinical profiles match your current search criteria or active filters."
              : "Your patient directory is currently empty. Start by adding a new patient profile."}
            icon={UserPlus}
            action={(search || Object.values(filters).some(v => v !== "")) && (
              <button 
                onClick={handleClearAll}
                className="px-8 py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-teal-900 font-bold text-sm transition-all active:scale-95 shadow-sm"
              >
                Clear All Filters
              </button>
            )}
          />
        )}
      </div>

      <Dialog
        open={isModalOpen}
        onClose={closeModal}
        title={editingPatient ? "Modify Registry" : "New Patient Profile"}
      >
        <PatientForm
          initialData={editingPatient || undefined}
          onSubmit={editingPatient ? handleUpdate : handleCreate}
          onCancel={closeModal}
          loading={false}
        />
      </Dialog>
    </div>
  );
};

export default PatientList;
