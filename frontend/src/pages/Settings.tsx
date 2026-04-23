import React, { useState } from "react";
import useSettingsStore from "../store/settingsStore";
import useUIStore from "../store/uiStore";
import { Plus, Trash2, Beaker, Settings2, Pen, X } from "lucide-react";
import { ReportTypeConfig } from "../types";

const Settings: React.FC = () => {
  const { reportTypes, addReportType, removeReportType } = useSettingsStore();
  const { addToast } = useUIStore();
  const [newType, setNewType] = useState({ name: "", min: "", max: "" });
  const [editingName, setEditingName] = useState<string | null>(null);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newType.name.trim()) {
      const isEditing = !!editingName;
      
      if (editingName && editingName !== newType.name.trim()) {
        removeReportType(editingName);
      }

      addReportType({
        name: newType.name.trim(),
        min: newType.min === "" || newType.min === null ? null : parseFloat(newType.min),
        max: newType.max === "" || newType.max === null ? null : parseFloat(newType.max),
        unit: "mg/dL"
      });
      
      addToast(isEditing ? "Parameters updated successfully" : "New test registered successfully");
      setNewType({ name: "", min: "", max: "" });
      setEditingName(null);
    }
  };

  const handleRemove = (name: string) => {
    removeReportType(name);
    addToast("Test parameters removed", "warning");
  };

  const startEdit = (type: ReportTypeConfig) => {
    setNewType({
      name: type.name,
      min: type.min?.toString() ?? "",
      max: type.max?.toString() ?? ""
    });
    setEditingName(type.name);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="p-8 w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-center md:items-end gap-6 text-center md:text-left">
        <div>
          <h1 className="text-3xl font-extrabold text-teal-900 tracking-tight font-headline">System Settings</h1>
          <p className="text-slate-500 font-medium mt-1 font-body">Configure default clinical parameters and test library.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <section className="bg-white rounded-[2rem] p-6 md:p-8 border border-slate-100 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
              <Beaker size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-teal-900 font-headline">Diagnostic Test Library</h3>
              <p className="text-sm text-slate-500 font-medium font-body">Manage report types and their default clinical ranges.</p>
            </div>
          </div>

          <form onSubmit={handleAdd} className={`p-6 rounded-3xl transition-all duration-300 ${editingName ? 'bg-primary/5 border-2 border-primary/20 shadow-inner' : 'bg-slate-50'}`}>
             <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Test Name</label>
                   <input 
                     type="text" 
                     value={newType.name}
                     onChange={(e) => setNewType({ ...newType, name: e.target.value })}
                     placeholder="e.g. Blood Test"
                     className="w-full bg-white border-2 border-slate-100 rounded-xl px-5 py-3 text-sm font-semibold focus:border-primary outline-none transition-all"
                   />
                </div>
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Default Min</label>
                   <input 
                     type="number" 
                     step="any"
                     value={newType.min}
                     onChange={(e) => setNewType({ ...newType, min: e.target.value })}
                     placeholder="0.00"
                     className="w-full bg-white border-2 border-slate-100 rounded-xl px-5 py-3 text-sm font-semibold focus:border-primary outline-none transition-all"
                   />
                </div>
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Default Max</label>
                   <input 
                     type="number" 
                     step="any"
                     value={newType.max}
                     onChange={(e) => setNewType({ ...newType, max: e.target.value })}
                     placeholder="0.00"
                     className="w-full bg-white border-2 border-slate-100 rounded-xl px-5 py-3 text-sm font-semibold focus:border-primary outline-none transition-all"
                   />
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="flex-grow bg-primary text-white rounded-xl py-3.5 px-4 font-black text-[11px] uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-teal-800 transition-all shadow-lg shadow-primary/20 h-[48px]">
                    {editingName ? <Pen size={16} /> : <Plus size={16} />}
                    {editingName ? 'Update Parameters' : 'Register Parameters'}
                  </button>
                  {editingName && (
                    <button 
                      type="button" 
                      onClick={() => {
                        setEditingName(null);
                        setNewType({ name: "", min: "", max: "" });
                      }}
                      className="bg-slate-200 text-slate-600 rounded-xl px-4 py-3.5 hover:bg-slate-300 transition-all"
                    >
                      <X size={20} />
                    </button>
                  )}
                </div>
             </div>
          </form>

          <div className="flex flex-col gap-4 pt-4">
            {reportTypes.map((type) => (
              <div key={type.name} className="group relative bg-white border border-slate-100 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all w-full gap-6">
                <div className="flex flex-col md:flex-row items-center gap-10 flex-grow text-center md:text-left">
                    <div className="min-w-[240px]">
                      <h4 className="text-lg font-extrabold text-teal-900 font-headline">{type.name}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 font-body">Diagnostic Parameter</p>
                   </div>
                   
                   <div className="flex items-center gap-8 md:border-l border-slate-100 md:pl-8 font-body">
                      <div className="flex flex-col">
                         <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Default Min</p>
                         <p className="text-base font-bold text-teal-900 text-center md:text-left">{type.min !== null ? type.min : '—'}</p>
                      </div>
                      <div className="flex flex-col">
                         <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Default Max</p>
                         <p className="text-base font-bold text-teal-900 text-center md:text-left">{type.max !== null ? type.max : '—'}</p>
                      </div>
                      <div className="flex flex-col">
                         <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Standard Unit</p>
                         <p className="text-sm font-bold text-primary text-center md:text-left">{type.unit || 'mg/dL'}</p>
                      </div>
                   </div>
                </div>

                <div className="flex items-center gap-3">
                   <button 
                     onClick={() => startEdit(type)}
                     className="p-3 text-slate-300 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                     title="Edit Parameters"
                   >
                     <Pen size={18} />
                   </button>
                    <button 
                      onClick={() => handleRemove(type.name)}
                      className="p-3 text-slate-300 hover:text-error hover:bg-error/10 rounded-xl transition-all"
                      title="Delete Entry"
                    >
                      <Trash2 size={20} />
                    </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Settings;
