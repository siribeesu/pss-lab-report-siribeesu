import axiosInstance from "./axios";
import { DashboardStats } from "../types";

export const getDashboardData = (timeframe: string = "") => 
  axiosInstance.get<DashboardStats>("/api/dashboard/", { params: { timeframe } });

export const getDashboardSummary = (status: string = "") => 
  axiosInstance.get<DashboardStats>(`/api/dashboard/summary?status=${status}`);
