export type Event = {
  id: string;
  name: string;
  date_from: string;
  date_to: string;
  time_from: string;
  time_to: string;
  location: string | null;
  email: string | null;
  phone: string | null;
  highlight: string;
  created_at: string;
};
export const HIGHLIGHT_COLORS = [
  { label: "Purple", value: "#7F77DD" },
  { label: "Green", value: "#1D9E75" },
  { label: "Blue", value: "#378ADD" },
  { label: "Orange", value: "#D85A30" },
  { label: "Pink", value: "#D4537E" },
] as const;

export type HighlightColor = typeof HIGHLIGHT_COLORS[number]["value"];