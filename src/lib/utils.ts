import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function saveToLocalStorage(key: string, data: any) {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, JSON.stringify(data));
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

interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  userType: string;
  identity_verified: boolean;
  onboarding_stage: string;
  last_login_at: string;
  verifican_status: string;
}

export function getUserId() {
  const userProfile = localStorage.getItem("userProfile");
  if (!userProfile) {
    console.warn("[CoffeeDetails] No userProfile in localStorage");
    return null;
  }

  try {
    const user: UserProfile = JSON.parse(userProfile);
    return user.id;
  } catch (error) {
    console.error("[CoffeeDetails] Failed to parse userProfile:", error);
    return null;
  }
}
