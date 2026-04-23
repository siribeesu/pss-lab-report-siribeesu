import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ReportTypeConfig } from "../types";

interface SettingsState {
  reportTypes: ReportTypeConfig[];
  addReportType: (typeData: ReportTypeConfig) => void;
  removeReportType: (name: string) => void;
  resetReportTypes: () => void;
}

const DEFAULT_TYPES: ReportTypeConfig[] = [
  { name: "Blood Test", min: 70, max: 105, unit: "mg/dL" },
  { name: "Urine Test", min: 0, max: 20, unit: "mg/dL" },
  { name: "Lipid Panel", min: 100, max: 200, unit: "mg/dL" },
  { name: "Custom", min: null, max: null, unit: "mg/dL" }
];

const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      reportTypes: DEFAULT_TYPES,
      
      addReportType: (typeData) => set((state) => {
        if (state.reportTypes.some(t => t.name === typeData.name)) {
          return {
            reportTypes: state.reportTypes.map(t => t.name === typeData.name ? { ...t, ...typeData } : t)
          };
        }
        return { reportTypes: [...state.reportTypes, typeData] };
      }),
      
      removeReportType: (name) => set((state) => ({
        reportTypes: state.reportTypes.filter(t => t.name !== name)
      })),
      
      resetReportTypes: () => set({
        reportTypes: DEFAULT_TYPES
      })
    }),
    {
      name: "lab-insight-settings-v2"
    }
  )
);

export default useSettingsStore;
