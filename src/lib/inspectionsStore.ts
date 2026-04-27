const STORAGE_KEY = "inspections.v1";

export interface StoredInspection {
  id: string;
  patente: string;
  updatedAt: number;
  data: unknown;
}

export const loadInspections = (): StoredInspection[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredInspection[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const persist = (items: StoredInspection[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

export const saveInspection = (id: string, patente: string, data: unknown): StoredInspection => {
  const items = loadInspections();
  const idx = items.findIndex((i) => i.id === id);
  const entry: StoredInspection = { id, patente, updatedAt: Date.now(), data };
  if (idx >= 0) items[idx] = entry;
  else items.unshift(entry);
  persist(items);
  return entry;
};

export const deleteInspection = (id: string) => {
  persist(loadInspections().filter((i) => i.id !== id));
};

export const getInspection = (id: string): StoredInspection | undefined =>
  loadInspections().find((i) => i.id === id);

export const newId = () =>
  `insp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
