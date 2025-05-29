import { USER_PROFILE_KEY } from "@/types/constants";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type PolygonCoord = {
  lat: number;
  lng: number;
};

export function calculateApproxArea(coords: PolygonCoord[]): number {
  if (!coords || coords.length < 3) return 0;

  const R = 6371000;
  let area = 0;

  for (let i = 0; i < coords.length; i++) {
    const j = (i + 1) % coords.length;

    const lat1 = (coords[i].lat * Math.PI) / 180;
    const lng1 = (coords[i].lng * Math.PI) / 180;
    const lat2 = (coords[j].lat * Math.PI) / 180;
    const lng2 = (coords[j].lng * Math.PI) / 180;

    area += (lng2 - lng1) * (2 + Math.sin(lat1) + Math.sin(lat2));
  }

  area = Math.abs((area * R * R) / 2);
  return area / 10000;
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
  verification_status: string;
}

export function getUserId() {
  const userProfile = localStorage.getItem(USER_PROFILE_KEY);
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

export function getUserProfile() {
  const userProfile = localStorage.getItem(USER_PROFILE_KEY);
  if (!userProfile) {
    console.warn("[CoffeeDetails] No userProfile in localStorage");
    return null;
  }

  try {
    const user: UserProfile = JSON.parse(userProfile);
    return user;
  } catch (error) {
    console.error("[CoffeeDetails] Failed to parse userProfile:", error);
    return null;
  }
}
