import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Local storage helpers
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function saveToLocalStorage(key: string, data: any) {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, JSON.stringify(data))
  }
}

export function getFromLocalStorage<T>(key: string, defaultValue: T): T {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        return JSON.parse(stored) as T;
      } catch (error) {
        console.error(`Error parsing stored data for key "${key}":`, error);
        return defaultValue;
      }
    }
  }
  return defaultValue;
}

export function removeFromLocalStorage(key: string) {
  if (typeof window !== "undefined") {
    localStorage.removeItem(key);
  }
}

