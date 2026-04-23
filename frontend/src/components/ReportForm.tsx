import React, { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Input, Textarea } from "./ui/Input";
import { Select } from "./ui/Select";
import { Button } from "./ui/Button";
import { UNITS } from "../constants";
import { Upload as UploadIcon, ShieldCheck } from "lucide-react";
import useSettingsStore from "../store/settingsStore";
import { LabReport } from "../types";

interface ReportFormProps {
  initialData?: any;
  onSubmit: (formData: FormData) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
}

const ReportForm: React.FC<ReportFormProps> = ({ initialData, onSubmit, onCancel, loading }) => {
  const { reportTypes } = useSettingsStore();
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: initialData || {
      report_type: typeof reportTypes[0] === 'string' ? reportTypes[0] : (reportTypes[0] as any).name,
      report_date: new Date().toISOString().split("T")[0],
      result_value: "",
      unit: UNITS[0],
      ref_range_min: "",
      ref_range_max: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
  }, [initialData, reset]);

  const resultValue = useWatch({ control, name: "result_value" });
  const refMin = useWatch({ control, name: "ref_range_min" });
  const refMax = useWatch({ control, name: "ref_range_max" });

  const [statusPreview, setStatusPreview] = useState<string>("Pending");

  useEffect(() => {
    const hasResult = resultValue !== "" && resultValue !== null && resultValue !== undefined;
    const hasMin = refMin !== "" && refMin !== null && refMin !== undefined;
    const hasMax = refMax !== "" && refMax !== null && refMax !== undefined;

    if (hasResult && (hasMin || hasMax)) {
      const val = parseFloat(resultValue);
      const min = hasMin ? parseFloat(refMin) : -Infinity;
      const max = hasMax ? parseFloat(refMax) : Infinity;
      
      if (val >= min && val <= max) setStatusPreview("Normal");
      else setStatusPreview("Abnormal");
    } else {
      setStatusPreview("Pending");
    }
  }, [resultValue, refMin, refMax]);

  const onInternalSubmit = async (data: any) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'file' && (value as FileList)?.[0]) {
        formData.append('file', (value as FileList)[0]);
      } else if (value !== "" && value !== null && value !== undefined) {
        formData.append(key, value.toString());
      }
    });
    await onSubmit(formData);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
      <form onSubmit={handleSubmit(onInternalSubmit)} className="lg:col-span-2 space-y-6">
        <div className="flex items-center gap-2 mb-4">
           <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <UploadIcon size={18} />
           </div>
           <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Entry Details</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Selected Patient</label>
            <div className="rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-700">
               {initialData?.patient_name || initialData?.patient?.name || 'Current Patient'}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Report Type</label>
            <Select {...register("report_type")} className="rounded-xl border-slate-200">
              {reportTypes.map((t) => {
                const name = typeof t === 'string' ? t : (t as any).name;
                return <option key={name} value={name}>{name}</option>;
              })}
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Report Date</label>
            <Input type="date" {...register("report_date")} className="rounded-xl border-slate-200" />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Result Value</label>
            <Input
              type="number"
              step="any"
              {...register("result_value")}
              className="rounded-xl border-slate-200"
              placeholder="0.00"
              error={errors.result_value?.message as string}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Unit</label>
            <Select {...register("unit")} className="rounded-xl border-slate-200">
              {UNITS.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
             <div className="space-y-2">
               <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ref Min</label>
               <Input type="number" step="any" {...register("ref_range_min")} className="rounded-xl border-slate-200" placeholder="Min" />
             </div>
             <div className="space-y-2">
               <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ref Max</label>
               <Input type="number" step="any" {...register("ref_range_max")} className="rounded-xl border-slate-200" placeholder="Max" />
             </div>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
           <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status Preview:</span>
           <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${
             statusPreview === 'Normal' ? 'bg-emerald-100 text-emerald-700' : 
             statusPreview === 'Abnormal' ? 'bg-red-100 text-red-700' : 'bg-slate-200 text-slate-500'
           }`}>
             <div className={`w-1.5 h-1.5 rounded-full ${
               statusPreview === 'Normal' ? 'bg-emerald-500' : 
               statusPreview === 'Abnormal' ? 'bg-red-500' : 'bg-slate-400'
             }`} />
             {statusPreview}
           </div>
        </div>

        <div className="space-y-2">
           <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Notes</label>
           <Textarea {...register("notes")} className="rounded-xl border-slate-200 min-h-24" placeholder="Any additional clinical observations..." />
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-slate-50">
          <Button type="button" variant="ghost" onClick={onCancel} className="font-bold text-slate-400">Cancel</Button>
          <Button type="submit" isLoading={loading} className="bg-primary text-white font-black px-10 py-3 rounded-xl shadow-lg shadow-primary/10 hover:bg-teal-800">
            Save Report
          </Button>
        </div>
      </form>

      <div className="space-y-6">
         <div className="p-6 bg-slate-900 text-white rounded-3xl space-y-6">
            <h4 className="text-sm font-black uppercase tracking-widest">Auto-Flagging Logic</h4>
            <div className="space-y-4">
               <div className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-black">1</div>
                  <p className="text-[11px] text-slate-400 leading-relaxed"><strong className="text-white">Input Result</strong>: Enter the absolute clinical value.</p>
               </div>
               <div className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-black">2</div>
                  <p className="text-[11px] text-slate-400 leading-relaxed"><strong className="text-white">Ref Range</strong>: Define thresholds.</p>
               </div>
               <div className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-black">3</div>
                  <p className="text-[11px] text-slate-400 leading-relaxed"><strong className="text-white">Flagging</strong>: System tags <span className="bg-red-500 text-white px-1 rounded uppercase text-[8px] font-black">Abnormal</span> if out of range.</p>
               </div>
            </div>
         </div>

         <div className="p-6 bg-slate-50 border border-slate-100 rounded-3xl">
            <div className="flex items-center gap-3 mb-4">
               <ShieldCheck className="text-emerald-500" size={20} />
               <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-800">Security Standards</h4>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
               All uploads are encrypted via AES-256 and compliant with HIPAA regulations.
            </p>
         </div>
      </div>
    </div>
  );
};

export default ReportForm;
