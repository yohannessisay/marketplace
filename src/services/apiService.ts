import { ApiError, ApiResponse } from "@/types/api";
import Cookies from "js-cookie";



class ApiService {
  constructor(private baseURL: string) {}

  private async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get("content-type");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let data: any;

    try {
      data = contentType?.includes("application/json") ? await response.json() : await response.text();
      if (typeof data === "string") data = JSON.parse(data);
    } catch {
      if (!response.ok) data = await response.text();
    }

    if (!response.ok) {
      const error: ApiError = {
        message: data?.Messages?.join(", ") || data?.message || response.statusText,
        status: response.status,
        data: data?.Data || data,
      };
      return Promise.reject(error);
    }

    const apiResponse = data as ApiResponse<T>;
    if (apiResponse?.Status === "success" && apiResponse.Data !== undefined) {
      return apiResponse.Data;
    }

    if (response.status >= 200 && response.status < 400) {
      return data as T;
    }

    return Promise.reject( { message: "Unexpected response format.", status: response.status, data });
  }

  private async makeRequest<T>(
    url: string,
    method: string,
    body?: unknown,
    useAuth = false
  ): Promise<T> {
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (useAuth) {
      const token = Cookies.get("accessToken");
      if (!token) throw { message: "Auth token missing.", status: 401 };
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${this.baseURL}${url}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });
      return this.handleResponse<T>(response);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      return Promise.reject({ message: err?.message || "Network error.", status: err?.status || 500, data: err });
    }
  }

  get<T>(url: string): Promise<T> { return this.makeRequest<T>(url, "GET"); }
  getWithoutAuth<T>(url: string): Promise<T> { return this.makeRequest<T>(url, "GET", undefined, false); }
  post<T>(url: string, body: unknown): Promise<T> { return this.makeRequest<T>(url, "POST", body); }
  postWithoutAuth<T>(url: string, body: unknown): Promise<T> { return this.makeRequest<T>(url, "POST", body, false); }
  put<T>(url: string, body: unknown): Promise<T> { return this.makeRequest<T>(url, "PUT", body, true); }
  patch<T>(url: string, body: unknown): Promise<T> { return this.makeRequest<T>(url, "PATCH", body, true); }
  delete<T>(url: string): Promise<T> { return this.makeRequest<T>(url, "DELETE", undefined, true); }
}

let apiServiceInstance: ApiService | null = null;

export const initializeApiService = (baseURL: string) => {
  apiServiceInstance = apiServiceInstance || new ApiService(baseURL);
};

export const apiService = () => {
  if (!apiServiceInstance) throw new Error("ApiService not initialized.");
  return apiServiceInstance;
};