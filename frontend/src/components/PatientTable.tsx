import React from "react";
import { ChevronRight, Pen, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Patient } from "../types";

interface PatientTableProps {
  patients: Patient[];
  onEdit: (patient: Patient) => void;
  onDelete: (id: string) => void;
}

const PatientTable: React.FC<PatientTableProps> = ({ patients, onEdit, onDelete }) => {
  const navigate = useNavigate();

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border border-slate-200">
        <thead>
          <tr className="bg-slate-50/50 border-b border-slate-200">
            <th className="px-8 py-5 text-left text-[11px] font-black text-slate-500 uppercase tracking-widest font-body whitespace-nowrap">Patient Name</th>
            <th className="px-8 py-5 text-left text-[11px] font-black text-slate-500 uppercase tracking-widest font-body whitespace-nowrap">Patient ID</th>
            <th className="px-8 py-5 text-center text-[11px] font-black text-on-surface-variant uppercase tracking-widest font-body whitespace-nowrap">Age / Gender</th>
            <th className="px-8 py-5 text-left text-[11px] font-black text-on-surface-variant uppercase tracking-widest font-body whitespace-nowrap">Contact Number</th>
            <th className="px-8 py-5 text-right text-[11px] font-black text-slate-500 uppercase tracking-widest font-body whitespace-nowrap">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white">
          {patients.map((patient) => (
            <tr 
              key={patient.id} 
              className="group hover:bg-surface-container-low transition-colors cursor-pointer"
              onClick={() => navigate(`/patients/${patient.id}`)}
            >
              <td className="px-8 py-5 whitespace-nowrap">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-black shadow-inner border border-primary/10">
                    {patient.name?.charAt(0).toUpperCase() || 'P'}
                  </div>
                  <div>
                    <div className="text-[15px] font-bold text-teal-950 group-hover:text-primary transition-colors font-body">
                      {patient.name || 'Unknown Patient'}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-8 py-5 whitespace-nowrap">
                <span className="font-mono text-[11px] font-black text-on-surface-variant bg-surface-container py-1.5 px-2.5 rounded tracking-tight border border-slate-200/50">
                  #{patient.patient_id || 'N/A'}
                </span>
              </td>
              <td className="px-8 py-5 text-center whitespace-nowrap">
                <div className="text-sm font-bold text-slate-700 font-body">
                  {patient.age} <span className="text-slate-300 mx-1 font-normal">|</span> {patient.gender?.charAt(0) || '?'}
                </div>
              </td>
              <td className="px-8 py-5 whitespace-nowrap">
                <div className="text-sm font-bold text-slate-600 font-body">{patient.contact_number}</div>
              </td>

              <td className="px-8 py-5 text-right">
                <div className="flex items-center gap-2 justify-end whitespace-nowrap">
                  <button onClick={(e) => { e.stopPropagation(); onEdit(patient); }} className="p-2 text-primary hover:bg-primary/5 rounded-lg transition-colors" title="Edit Patient">
                    <Pen size={18} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); onDelete(patient.id); }} className="p-2 text-error hover:bg-error/5 rounded-lg transition-colors" title="Delete Patient">
                    <Trash2 size={18} />
                  </button>
                  <button className="p-2 text-slate-300 group-hover:text-primary transition-colors bg-slate-50 group-hover:bg-primary/5 rounded-xl">
                    <ChevronRight size={18} />
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

export default PatientTable;
