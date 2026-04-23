import React, { useEffect, useState } from "react";
import { Upload, FileText } from "lucide-react";
import { useSearchParams, useNavigate, useParams } from "react-router-dom";
import { useForm, useWatch } from "react-hook-form";
import usePatientStore from "../store/patientStore";
import useReportStore from "../store/reportStore";
import useUIStore from "../store/uiStore";
import useSettingsStore from "../store/settingsStore";
import { getReportById } from "../api/reports";
import { UNITS } from "../constants";

export const API_BASE_URL = "";

interface ReportFormData {
  patient_id: string;
  report_type: string;
  report_date: string;
  result_value: string | number;
  unit: string;
  ref_range_min: string | number;
  ref_range_max: string | number;
  notes: string;
  custom_report_type: string;
  file?: FileList;
}

const UploadReport: React.FC = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const patientIdFromQuery = searchParams.get("patientId");
  
  const { patients, fetchPatients } = usePatientStore();
  const { createReport, updateReport } = useReportStore();
  const { addToast } = useUIStore();
  const { reportTypes } = useSettingsStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingReport, setLoadingReport] = useState(!!reportId);
  const [patientSearch, setPatientSearch] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [fileResetKey, setFileResetKey] = useState(0);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset
  } = useForm<ReportFormData>({
    defaultValues: {
      patient_id: patientIdFromQuery || "",
      report_type: (typeof reportTypes?.[0] === 'string' ? reportTypes[0] : reportTypes?.[0]?.name) || "Blood Test",
      report_date: new Date().toISOString().split('T')[0],
      result_value: "",
      unit: "mg/dL",
      ref_range_min: "",
      ref_range_max: "",
      notes: "",
      custom_report_type: ""
    }
  });

  const resultValue = useWatch({ control, name: "result_value" });
  const refMin = useWatch({ control, name: "ref_range_min" });
  const refMax = useWatch({ control, name: "ref_range_max" });
  const selectedType = useWatch({ control, name: "report_type" });
  const [statusPreview, setStatusPreview] = useState<string>("Pending");

  useEffect(() => {
    if (!reportId && selectedType) {
      const typeConfig = reportTypes.find(t => (typeof t === 'string' ? t : t.name) === selectedType);
      if (typeConfig && typeof typeConfig !== 'string') {
        if (typeConfig.min !== null && typeConfig.min !== undefined) setValue("ref_range_min", typeConfig.min);
        if (typeConfig.max !== null && typeConfig.max !== undefined) setValue("ref_range_max", typeConfig.max);
      }
    }
  }, [selectedType, reportTypes, setValue, reportId]);

  useEffect(() => {
    fetchPatients();
    if (reportId) {
      const loadReport = async () => {
        try {
          const res = await getReportById(reportId);
          reset(res.data);
        } catch (err) {
          console.error("Failed to load report for editing:", err);
        } finally {
          setLoadingReport(false);
        }
      };
      loadReport();
    }
  }, [reportId, reset]);

  useEffect(() => {
    if (patientIdFromQuery) {
      setValue("patient_id", patientIdFromQuery);
    }
  }, [patientIdFromQuery, setValue]);

  useEffect(() => {
    const hasResult = resultValue !== "" && resultValue !== null && resultValue !== undefined;
    const hasMin = refMin !== "" && refMin !== null && refMin !== undefined;
    const hasMax = refMax !== "" && refMax !== null && refMax !== undefined;

    if (hasResult && (hasMin || hasMax)) {
      const val = parseFloat(resultValue.toString());
      const min = hasMin ? parseFloat(refMin.toString()) : -Infinity;
      const max = hasMax ? parseFloat(refMax.toString()) : Infinity;
      
      if (val >= min && val <= max) setStatusPreview("Normal");
      else setStatusPreview("Abnormal");
    } else {
      setStatusPreview("Pending");
    }
  }, [resultValue, refMin, refMax]);

  const filteredPatientsForSelect = patients.filter(p => !patientSearch || p.name.toLowerCase().includes(patientSearch.toLowerCase()) || p.patient_id.toLowerCase().includes(patientSearch.toLowerCase()));
  const currentPatientId = watch("patient_id");
  const selectedPatient = patients.find(p => p.id === currentPatientId);

  if (loadingReport) return <div className="p-10 font-bold text-primary text-center">Loading clinical record...</div>;

  const onSubmit = async (data: ReportFormData, stayOnPage: any = false) => {
    const shouldStay = stayOnPage === true;
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'file') {
            if (value?.[0]) formData.append('file', value[0]);
        } else if (key === 'custom_report_type') {
            return;
        } else if (key === 'report_type') {
            formData.append('report_type', data.report_type === 'Custom' ? data.custom_report_type : data.report_type);
        } else if (value !== "" && value !== null && value !== undefined) {
            formData.append(key, value.toString());
        }
      });
      
      if (reportId) {
        await updateReport(reportId, formData);
        addToast("Clinical record updated successfully");
        navigate(`/patients/${data.patient_id}`);
      } else {
        await createReport(formData);
        addToast(shouldStay ? "Report saved. Ready for next entry." : "Laboratory report uploaded successfully");
        
        if (shouldStay) {
          setFileResetKey(prev => prev + 1);
          
          const defaultTypeName = (typeof reportTypes?.[0] === 'string' ? reportTypes[0] : (reportTypes?.[0] as any)?.name) || "Blood Test";
          const typeConfig = reportTypes.find(t => (typeof t === 'string' ? t : t.name) === defaultTypeName);
          let defaultMin = "";
          let defaultMax = "";
          
          if (typeConfig && typeof typeConfig !== 'string') {
            defaultMin = typeConfig.min?.toString() || "";
            defaultMax = typeConfig.max?.toString() || "";
          }

          reset({
            patient_id: data.patient_id,
            report_type: defaultTypeName,
            report_date: new Date().toISOString().split('T')[0],
            result_value: "",
            unit: "mg/dL",
            ref_range_min: defaultMin,
            ref_range_max: defaultMax,
            notes: "",
            custom_report_type: "",
            file: undefined
          });
        } else {
          navigate(`/patients/${data.patient_id}`);
        }
      }
    } catch (err: any) {
      console.error("SUBMIT_ERROR:", err);
      addToast("Failed to save laboratory report", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-10 w-full font-body animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h2 className="font-headline text-3xl font-extrabold text-teal-900 tracking-tight">
            {reportId ? "Modify Clinical Entry" : "Diagnostic Data Entry"}
          </h2>
          <p className="text-slate-500 mt-1 font-medium">
            {reportId ? "Updating existing laboratory results for this patient." : "Validate and register new clinical diagnostic results."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8 items-start">
        <section className="col-span-12 space-y-8">
          <div className="bg-surface-container-lowest rounded-xl p-8 shadow-sm border border-slate-100">
            <h3 className="font-headline text-lg font-bold mb-6 flex items-center gap-2 text-teal-900">
              <FileText className="text-primary" size={20} />
              {reportId ? "Edit Entry Details" : "New Entry Details"}
            </h3>

            <form className="grid grid-cols-1 md:grid-cols-3 gap-8" onSubmit={handleSubmit(onSubmit)}>
              <div className="md:col-span-2 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2 md:col-span-1 border-none relative">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1 flex justify-between">
                    Select Patient
                  </label>
                  <div className="relative">
                    <input 
                      type="text" 
                      disabled={!!reportId}
                      placeholder="Type name or ID to search..." 
                      value={isDropdownOpen ? patientSearch : (selectedPatient ? `${selectedPatient.name} (${selectedPatient.patient_id})` : "")}
                      onChange={(e) => {
                         setPatientSearch(e.target.value);
                         setIsDropdownOpen(true);
                         if (e.target.value === "") setValue("patient_id", "");
                      }}
                      onFocus={() => !reportId && setIsDropdownOpen(true)}
                      onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
                      className={`w-full border-none py-3 px-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all font-semibold text-slate-700 outline-none ${reportId ? 'bg-surface-container-low opacity-50 cursor-not-allowed' : 'bg-surface-container-low focus:bg-surface-container-lowest hover:bg-slate-100'} ${isDropdownOpen ? 'rounded-t-xl' : 'rounded-xl'}`}
                    />
                    
                    <input type="hidden" {...register("patient_id", { required: true })} />

                    {isDropdownOpen && !reportId && (
                      <div className="absolute z-50 w-full bg-white border border-slate-200 border-t-0 rounded-b-xl shadow-xl max-h-48 overflow-y-auto">
                        {filteredPatientsForSelect.length > 0 ? filteredPatientsForSelect.map(p => (
                          <div 
                            key={p.id}
                            className="px-4 py-3 hover:bg-slate-50 cursor-pointer text-sm font-semibold text-slate-700 border-b border-slate-50 last:border-0"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              setValue("patient_id", p.id);
                              setPatientSearch("");
                              setIsDropdownOpen(false);
                            }}
                          >
                            {p.name} <span className="text-slate-400 font-bold ml-1 text-xs">({p.patient_id})</span>
                          </div>
                        )) : (
                          <div className="px-4 py-3 text-sm text-slate-400 font-semibold">No patients found.</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1 flex justify-between items-center">
                    Report Type
                    {selectedType === 'Custom' && (
                      <button 
                        type="button" 
                        onClick={() => {
                          setValue("report_type", (typeof reportTypes?.[0] === 'string' ? reportTypes[0] : (reportTypes?.[0] as any)?.name) || "Blood Test");
                          setValue("custom_report_type", "");
                        }}
                        className="text-[10px] text-slate-400 font-bold hover:text-primary transition-colors cursor-pointer"
                      >
                         Cancel Custom
                      </button>
                    )}
                  </label>
                  
                  {selectedType !== 'Custom' ? (
                    <select {...register("report_type")} className="w-full bg-surface-container-low border-none rounded-xl py-3 px-4 text-sm focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 transition-all font-semibold text-slate-700 outline-none hover:bg-slate-100">
                       {reportTypes.map(rt => {
                          const name = typeof rt === 'string' ? rt : (rt as any).name;
                          return <option key={name} value={name}>{name}</option>;
                       })}
                       <option value="Custom">Custom (Type Manually)</option>
                    </select>
                  ) : (
                    <input 
                       {...register("custom_report_type", { required: selectedType === 'Custom' })}
                       type="text"
                       autoFocus
                       placeholder="Enter custom report type..."
                       className="w-full bg-surface-container-low border-none rounded-xl py-3 px-4 text-sm focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 transition-all font-semibold text-slate-700 outline-none"
                    />
                  )}
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Report Date</label>
                  <input {...register("report_date")} type="date" className="w-full bg-surface-container-low border-none rounded-xl py-3 px-4 text-sm focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 transition-all font-semibold text-slate-700 outline-none" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Result Value</label>
                  <input {...register("result_value")} type="number" step="any" placeholder="0.00" className="w-full bg-surface-container-low border-none rounded-xl py-3 px-4 text-sm focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 transition-all font-semibold text-slate-700 outline-none" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Unit</label>
                  <select {...register("unit")} className="w-full bg-surface-container-low border-none rounded-xl py-3 px-4 text-sm focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 transition-all font-semibold text-slate-700 outline-none">
                     {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div className="col-span-2 md:col-span-1 grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Ref Min</label>
                    <input {...register("ref_range_min")} type="number" step="any" placeholder="Min" className="w-full bg-surface-container-low border-none rounded-xl py-3 px-4 text-sm focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 transition-all font-semibold text-slate-700 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Ref Max</label>
                    <input {...register("ref_range_max")} type="number" step="any" placeholder="Max" className="w-full bg-surface-container-low border-none rounded-xl py-3 px-4 text-sm focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 transition-all font-semibold text-slate-700 outline-none" />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Predicted Status:</span>
                 <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${
                   statusPreview === 'Normal' ? 'bg-primary/10 text-primary' : 
                   statusPreview === 'Abnormal' ? 'bg-error-container text-on-error-container' : 'bg-slate-200 text-slate-500'
                 }`}>
                   <div className={`w-1.5 h-1.5 rounded-full ${
                     statusPreview === 'Normal' ? 'bg-primary' : 
                     statusPreview === 'Abnormal' ? 'bg-error' : 'bg-slate-400'
                   }`} />
                   {statusPreview}
                 </div>
              </div>

              <div>
                 <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Clinical Notes</label>
                 <textarea {...register("notes")} placeholder="Enter clinical observations..." className="w-full bg-surface-container-low border-none rounded-xl py-3 px-4 text-sm focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 transition-all font-semibold text-slate-700 outline-none min-h-[80px]" />
              </div>

              </div>

              <div className="md:col-span-1 flex flex-col">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Upload Source Document</label>
                <div key={fileResetKey} className="border-2 border-dashed border-outline-variant rounded-xl p-6 flex-1 flex flex-col items-center justify-center bg-slate-50 hover:bg-white hover:border-primary/50 transition-all cursor-pointer group relative overflow-hidden h-full min-h-[300px]">
                  <input {...register("file")} type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
                  <Upload className="text-slate-300 group-hover:text-primary transition-colors mb-3" size={32} />
                  {watch("file")?.[0] ? (
                    <div className="text-center">
                      <p className="text-sm font-bold text-primary">{watch("file")![0].name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">File Selected Successfully</p>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm font-bold text-slate-600 text-center">Drag and drop report files here</p>
                      <p className="text-xs font-bold text-slate-400 mt-1 text-center">Accepts PDF, PNG, or JPG formats</p>
                      <button className="mt-4 px-6 py-2 bg-white text-primary text-xs font-bold border border-slate-200 rounded-full shadow-sm hover:bg-slate-50 relative z-10" type="button">Browse Files</button>
                    </>
                  )}
                </div>
              </div>

              <div className="col-span-1 md:col-span-3 flex items-center justify-end gap-4 pt-4 border-t border-slate-100">
                <button onClick={() => navigate(-1)} className="px-8 py-3 text-slate-400 font-bold text-sm hover:text-error transition-all" type="button">Cancel</button>
                
                {!reportId && (
                  <button 
                    type="button"
                    onClick={handleSubmit((data) => onSubmit(data, true))}
                    className="px-8 py-3 border-2 border-primary/20 text-primary rounded-xl font-bold hover:bg-primary/5 transition-all text-sm"
                  >
                    Save & Add Another
                  </button>
                )}

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="px-10 py-3 bg-gradient-to-r from-primary to-primary-container text-white rounded-full font-bold shadow-xl shadow-primary/20 active:scale-95 transition-all text-sm disabled:opacity-50" 
                >
                  {isSubmitting ? "Processing..." : (reportId ? "Update Record" : "Confirm & Save")}
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
};

export default UploadReport;
