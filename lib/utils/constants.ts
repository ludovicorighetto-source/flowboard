export const APP_NAME = "FlowBoard";
export const ADMIN_EMAIL = "ludovico.righetto@gmail.com";
export const STORAGE_BUCKET =
  process.env.FLOWBOARD_STORAGE_BUCKET || "task-attachments";

export const LABEL_COLORS = [
  "#0071e3",
  "#34c759",
  "#30b0c7",
  "#5856d6",
  "#ff9f0a",
  "#ff6b6b",
  "#f45d22",
  "#bf5af2",
  "#64d2ff",
  "#8e8e93",
  "#32d74b",
  "#ff375f"
];

export const PRIORITY_META = {
  high: {
    label: "Alta",
    className: "bg-rose-50 text-rose-700 border-rose-200"
  },
  medium: {
    label: "Media",
    className: "bg-amber-50 text-amber-700 border-amber-200"
  },
  low: {
    label: "Bassa",
    className: "bg-sky-50 text-sky-700 border-sky-200"
  }
} as const;
