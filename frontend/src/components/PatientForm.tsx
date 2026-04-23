import React from "react";
import { useForm } from "react-hook-form";
import { Input } from "./ui/Input";
import { Select } from "./ui/Select";
import { Button } from "./ui/Button";
import { GENDER_OPTIONS } from "../constants";
import { Patient } from "../types";

interface PatientFormProps {
  initialData?: Patient;
  onSubmit: (data: Partial<Patient>) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
}

const PatientForm: React.FC<PatientFormProps> = ({ initialData, onSubmit, onCancel, loading }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Partial<Patient>>({
    defaultValues: initialData || {
      name: "",
      age: undefined,
      gender: "Male",
      contact_number: "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Full Patient Name</label>
          <Input
            {...register("name", { required: "Name is required" })}
            placeholder="e.g. Julianna Simmons"
            className="rounded-xl border-slate-200"
            error={errors.name?.message}
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Age</label>
          <Input
            type="number"
            {...register("age", { required: "Age is required", min: { value: 1, message: "Age must be at least 1" } })}
            placeholder="34"
            className="rounded-xl border-slate-200"
            error={errors.age?.message}
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Gender</label>
          <Select {...register("gender")} className="rounded-xl border-slate-200">
            {GENDER_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Contact Number</label>
          <Input
            {...register("contact_number", { required: "Contact is required" })}
            placeholder="+1 (555) 000-0000"
            className="rounded-xl border-slate-200"
            error={errors.contact_number?.message}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-slate-50">
        <Button 
          type="button" 
          variant="ghost" 
          onClick={onCancel}
          className="rounded-xl font-bold text-slate-400 hover:text-slate-600"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          isLoading={loading}
          className="rounded-xl bg-primary hover:bg-teal-800 text-white font-black px-8 py-2.5 shadow-lg shadow-teal-900/10"
        >
          {initialData ? "Update Profile" : "Create Profile"}
        </Button>
      </div>
    </form>
  );
};

export default PatientForm;
