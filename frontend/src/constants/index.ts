export const REPORT_TYPES = ["Blood Test", "Urine Test", "Lipid Panel", "Custom"] as const;
export const GENDER_OPTIONS = ["Male", "Female", "Other"] as const;
export const STATUS_OPTIONS = ["Normal", "Abnormal", "Pending"] as const;
export const UNITS = ["mg/dL", "g/L", "mmol/L", "U/L", "µmol/L", "%", "cells/µL"] as const;

export const API_BASE_URL = "http://localhost:8000";

export const STATUS_COLORS = {
  Normal: "bg-green-100 text-green-700",
  Abnormal: "bg-red-100 text-red-700",
  Pending: "bg-gray-100 text-gray-600",
} as const;
