export const formatDate = (dateString?: string | null): string => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatPatientId = (id?: string | null): string => {
  return id || "PSS-0000";
};
