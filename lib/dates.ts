export const addDaysToDate = (dateStr: string, days: number): string => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "";
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
};

export const daysBetweenInclusive = (startDate: string, finishDate: string): number => {
  if (!startDate || !finishDate) return 0;
  const start = new Date(startDate);
  const end = new Date(finishDate);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
  const diff = end.getTime() - start.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
};

export const formatDate = (dateStr: string): string => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
};
