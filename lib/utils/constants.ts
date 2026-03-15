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

export const LIST_COLOR_CLASSES = [
  "bg-gray-400",
  "bg-blue-500",
  "bg-orange-500",
  "bg-green-500",
  "bg-purple-500",
  "bg-cyan-500"
] as const;

export function getListColorClass(listTitle: string, position: number) {
  const normalized = listTitle.trim().toLowerCase();

  if (normalized.includes("todo") || normalized.includes("to do")) {
    return "bg-gray-400";
  }

  if (normalized.includes("doing") || normalized.includes("in progress")) {
    return "bg-blue-500";
  }

  if (normalized.includes("review")) {
    return "bg-orange-500";
  }

  if (normalized.includes("done")) {
    return "bg-green-500";
  }

  return LIST_COLOR_CLASSES[position % LIST_COLOR_CLASSES.length];
}
