import type { AppData } from './types';

const STORAGE_KEY = 'remindly-data';

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { events: [], tasks: [] };
    const parsed = JSON.parse(raw) as AppData;
    return {
      events: Array.isArray(parsed.events) ? parsed.events : [],
      tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [],
    };
  } catch {
    return { events: [], tasks: [] };
  }
}

export function saveData(data: AppData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function createId(): string {
  return crypto.randomUUID();
}
