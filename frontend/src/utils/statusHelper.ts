export const computeReportStatus = (
  value: string | number,
  min: string | number | null,
  max: string | number | null
): "Normal" | "Abnormal" | "Pending" => {
  const val = typeof value === 'string' ? parseFloat(value) : value;
  const rMin = typeof min === 'string' ? parseFloat(min) : min;
  const rMax = typeof max === 'string' ? parseFloat(max) : max;

  if (isNaN(val)) return "Pending";
  if ((rMin === null || isNaN(rMin as number)) && (rMax === null || isNaN(rMax as number))) return "Pending";
  if (rMin !== null && !isNaN(rMin as number) && val < (rMin as number)) return "Abnormal";
  if (rMax !== null && !isNaN(rMax as number) && val > (rMax as number)) return "Abnormal";
  
  return "Normal";
};
