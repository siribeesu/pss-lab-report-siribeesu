import axiosInstance from "./axios";
import { Patient } from "../types";

export const getPatients = (search: string = "") => 
  axiosInstance.get<Patient[]>(`/api/patients/?search=${search}`);

export const getPatientById = (id: string) => 
  axiosInstance.get<Patient>(`/api/patients/${id}`);

export const createPatient = (data: Partial<Patient>) => 
  axiosInstance.post<Patient>("/api/patients/", data);

export const updatePatient = (id: string, data: Partial<Patient>) => 
  axiosInstance.put<Patient>(`/api/patients/${id}`, data);

export const deletePatient = (id: string) => 
  axiosInstance.delete(`/api/patients/${id}`);

export const bulkUploadPatients = (formData: FormData) =>
  axiosInstance.post<{ message: string; added_count: number }>(`/api/patients/bulk_upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
