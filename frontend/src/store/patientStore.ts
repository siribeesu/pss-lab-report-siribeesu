import { create } from "zustand";
import * as api from "../api/patients";
import { Patient } from "../types";

interface PatientState {
  patients: Patient[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  fetchPatients: (search?: string) => Promise<void>;
  createPatient: (data: Partial<Patient>) => Promise<Patient>;
  updatePatient: (id: string, data: Partial<Patient>) => Promise<Patient>;
  deletePatient: (id: string) => Promise<void>;
}

const usePatientStore = create<PatientState>((set) => ({
  patients: [],
  loading: false,
  error: null,
  searchQuery: "",

  setSearchQuery: (query) => set({ searchQuery: query }),

  fetchPatients: async (search = "") => {
    set({ loading: true, error: null });
    try {
      const response = await api.getPatients(search);
      set({ patients: response.data, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  createPatient: async (data) => {
    try {
      const response = await api.createPatient(data);
      set((state) => ({ patients: [response.data, ...state.patients] }));
      return response.data;
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },

  updatePatient: async (id, data) => {
    try {
      const response = await api.updatePatient(id, data);
      set((state) => ({
        patients: state.patients.map((p) => (p.id === id ? response.data : p)),
      }));
      return response.data;
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },

  deletePatient: async (id) => {
    try {
      await api.deletePatient(id);
      set((state) => ({
        patients: state.patients.filter((p) => p.id !== id),
      }));
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },
}));

export default usePatientStore;
