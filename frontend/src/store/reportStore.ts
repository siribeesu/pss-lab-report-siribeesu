import { create } from "zustand";
import * as api from "../api/reports";
import { LabReport } from "../types";

interface ReportState {
  reports: LabReport[];
  loading: boolean;
  error: string | null;
  filters: Record<string, any>;
  setFilters: (filters: Record<string, any>) => void;
  fetchReports: (params?: Record<string, any>) => Promise<void>;
  createReport: (formData: FormData) => Promise<LabReport>;
  updateReport: (id: string, formData: FormData) => Promise<LabReport>;
  deleteReport: (id: string) => Promise<void>;
}

const useReportStore = create<ReportState>((set) => ({
  reports: [],
  loading: false,
  error: null,
  filters: {},

  setFilters: (filters) => set((state) => ({ 
    filters: { ...state.filters, ...filters } 
  })),

  fetchReports: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([_, v]) => v !== "" && v !== null && v !== undefined)
      );
      const response = await api.getReports(cleanParams);
      set({ reports: response.data, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  createReport: async (formData) => {
    try {
      const response = await api.createReport(formData);
      set((state) => ({ reports: [response.data, ...state.reports] }));
      return response.data;
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },

  updateReport: async (id, formData) => {
    try {
      const response = await api.updateReport(id, formData);
      set((state) => ({
        reports: state.reports.map((r) => (r.id === id ? response.data : r)),
      }));
      return response.data;
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },

  deleteReport: async (id) => {
    try {
      await api.deleteReport(id);
      set((state) => ({
        reports: state.reports.filter((r) => r.id !== id),
      }));
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },
}));

export default useReportStore;
