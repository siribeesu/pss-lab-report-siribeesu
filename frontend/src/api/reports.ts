import axiosInstance from "./axios";
import { LabReport } from "../types";

export const getReports = (params: Record<string, any> = {}) => 
  axiosInstance.get<LabReport[]>("/api/reports/", { params });

export const getReportById = (id: string) => 
  axiosInstance.get<LabReport>(`/api/reports/${id}`);

export const createReport = (formData: FormData) => 
  axiosInstance.post<LabReport>("/api/reports/", formData);

export const updateReport = (id: string, formData: FormData) => 
  axiosInstance.put<LabReport>(`/api/reports/${id}`, formData);

export const deleteReport = (id: string) => 
  axiosInstance.delete(`/api/reports/${id}`);

export const bulkUploadReports = (formData: FormData) => 
  axiosInstance.post<{ message: string; added_count: number }>("/api/reports/bulk_upload", formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
