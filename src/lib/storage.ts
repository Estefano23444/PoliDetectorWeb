import type { SavedRecord } from "../types";

const KEY = "polidetector.records.v1";

export function loadRecords(): SavedRecord[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveRecords(records: SavedRecord[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(records));
  } catch {
    // Storage full (images are heavy). Try saving without images as a fallback.
    try {
      const slim = records.map(({ imageDataUrl: _img, ...rest }) => rest);
      localStorage.setItem(KEY, JSON.stringify(slim));
    } catch {
      // Give up silently; the in-memory list still works for this session.
    }
  }
}

export function newId(): string {
  return (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
  );
}
