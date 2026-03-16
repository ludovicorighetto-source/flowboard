import { addDays, endOfMonth, format } from "date-fns";

import type { Priority } from "@/types";

export type SmartTaskDraft = {
  title: string;
  description: string;
  priority: Priority;
  due_date: string | null;
  checklist: string[];
};

function containsAny(text: string, words: string[]) {
  return words.some((word) => text.includes(word));
}

function capitalizeFirst(value: string) {
  if (!value) return value;
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}

function extractTitle(input: string) {
  const cleaned = input
    .trim()
    .replace(/^(crea task|task per|descrivi e crea)\s*/i, "")
    .replace(/\s+/g, " ");
  return capitalizeFirst(cleaned || "Nuovo task");
}

function extractPriority(text: string): Priority {
  if (containsAny(text, ["urgente", "subito", "alta priorità", "alta priorita"])) {
    return "high";
  }
  if (containsAny(text, ["bassa priorità", "bassa priorita"])) {
    return "low";
  }
  return "medium";
}

function extractDueDate(text: string) {
  const now = new Date();
  if (text.includes("oggi")) return format(now, "yyyy-MM-dd");
  if (text.includes("domani")) return format(addDays(now, 1), "yyyy-MM-dd");
  if (text.includes("entro fine mese")) return format(endOfMonth(now), "yyyy-MM-dd");
  return null;
}

function suggestChecklist(text: string) {
  if (containsAny(text, ["marketing", "instagram", "contenuti", "ads"])) {
    return [
      "Definire obiettivo",
      "Scrivere copy",
      "Preparare creatività",
      "Pubblicare contenuto"
    ];
  }

  if (containsAny(text, ["lancio", "beta", "launch"])) {
    return [
      "Definire deliverable",
      "Preparare landing page",
      "Preparare comunicazione",
      "Verificare test"
    ];
  }

  return ["Definire i dettagli", "Eseguire attività", "Verificare completamento"];
}

export function generateSmartTaskDraft(input: string): SmartTaskDraft {
  const text = input.trim();
  const normalized = text.toLowerCase();

  return {
    title: extractTitle(text),
    description: `Bozza generata automaticamente dalla descrizione utente.\n\nRichiesta originale:\n${text}`,
    priority: extractPriority(normalized),
    due_date: extractDueDate(normalized),
    checklist: suggestChecklist(normalized)
  };
}
