import { APIErrorResponse, APISuccessResponse } from "@/types/api";
import Cookies from "js-cookie";

class ApiService {
  constructor(private baseURL: string) {}

  private async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get("content-type");
    let data: unknown;

    try {
      data = contentType?.includes("application/json")
        ? await response.json()
        : await response.text();
      if (typeof data === "string") {
        try {
          data = JSON.parse(data);
        } catch {
          // Keep as text if parsing fails
        }
      }
    } catch {
      if (!response.ok) {
        data = await response.text();
      }
    }

    if (!response.ok) {
      const errorData = typeof data === "object" && data ? data : {};
      const errorResponse: APIErrorResponse = {
        success: false,
        error: {
          message:
            (errorData as any)?.error?.message ||
            (errorData as any)?.message ||
            response.statusText ||
            "Unknown error",
          details:
            (errorData as any)?.error?.details ||
            (errorData as any)?.details ||
            `HTTP ${response.status}: ${response.statusText}`,
          code: (errorData as any)?.error?.code || response.status,
          hint:
            (errorData as any)?.error?.hint ||
            "Check the request data and try again",
        },
      }; 
      return Promise.reject(errorResponse);
    }

    const successResponse: APISuccessResponse = {
      success: true,
      message: (data as any)?.message || "Request successful",
      data: (data as any)?.data !== undefined ? (data as any).data : data,
    };

    return successResponse as T;
  }

  private async makeJsonRequest<T>(
    url: string,
    method: string,
    body?: unknown,
    useAuth = false,
    xFmrId?: string,
  ): Promise<T> {
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (useAuth) {
      const token = Cookies.get("accessToken");
      if (!token) window.location.href = "/login";
      headers["Authorization"] = `Bearer ${token}`;
    }
    if (xFmrId) {
      headers["x-fmr-id"] = xFmrId;
    }
    try {
      const response = await fetch(`${this.baseURL}${url}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      return this.handleResponse<T>(response);
    } catch (err) {
      const errorResponse: APIErrorResponse = {
        success: false,
        error: {
          message: (err as any)?.message || "Network error",
          details: "Failed to connect to the server",
          code: 500,
          hint: "Check your network connection",
        },
      };
      return Promise.reject(errorResponse);
    }
  }

  private async makeFormDataRequest<T>(
    url: string,
    method: string,
    body?: FormData,
    useAuth = false,
    xFmrId?: string,
  ): Promise<T> {
    const headers: HeadersInit = {};

    if (useAuth) {
      const token = Cookies.get("accessToken");
      if (!token) window.location.href = "/login";
      headers["Authorization"] = `Bearer ${token}`;
    }

    if (xFmrId) {
      headers["x-fmr-id"] = xFmrId;
    }

    try {
      const response = await fetch(`${this.baseURL}${url}`, {
        method,
        headers,
        body,
      });
      return this.handleResponse<T>(response);
    } catch (err) {
      const errorResponse: APIErrorResponse = {
        success: false,
        error: {
          message: (err as any)?.message || "Network error",
          details: "Failed to connect to the server",
          code: 500,
          hint: "Check your network connection",
        },
      };
      return Promise.reject(errorResponse);
    }
  }

  // JSON Request Methods
  get<T>(url: string, xFmrId?: string): Promise<T> {
    return this.makeJsonRequest<T>(url, "GET", undefined, true, xFmrId);
  }
  getWithoutAuth<T>(url: string): Promise<T> {
    return this.makeJsonRequest<T>(url, "GET", undefined, false);
  }
  post<T>(url: string, body: unknown, xFmrId?: string): Promise<T> {
    return this.makeJsonRequest<T>(url, "POST", body, true, xFmrId);
  }
  postWithoutAuth<T>(url: string, body: unknown): Promise<T> {
    return this.makeJsonRequest<T>(url, "POST", body, false);
  }
  put<T>(url: string, body: unknown, xFmrId?: string): Promise<T> {
    return this.makeJsonRequest<T>(url, "PUT", body, true, xFmrId);
  }
  patch<T>(url: string, body: unknown, xFmrId?: string): Promise<T> {
    return this.makeJsonRequest<T>(url, "PATCH", body, true, xFmrId);
  }
  delete<T>(url: string): Promise<T> {
    return this.makeJsonRequest<T>(url, "DELETE", undefined, true);
  }

  // FormData Request Methods
  postFormData<T>(
    url: string,
    formData: FormData,
    useAuth = false,
    xFmrId?: string,
  ): Promise<T> {
    return this.makeFormDataRequest<T>(url, "POST", formData, useAuth, xFmrId);
  }

  putFormData<T>(
    url: string,
    formData: FormData,
    useAuth = true,
    xFmrId?: string,
  ): Promise<T> {
    return this.makeFormDataRequest<T>(url, "PUT", formData, useAuth, xFmrId);
  }

  patchFormData<T>(
    url: string,
    formData: FormData,
    useAuth = true,
    xFmrId?: string,
  ): Promise<T> {
    return this.makeFormDataRequest<T>(url, "PATCH", formData, useAuth, xFmrId);
  }
}

let apiServiceInstance: ApiService | null = null;

export const initializeApiService = (baseURL: string) => {
  apiServiceInstance = apiServiceInstance || new ApiService(baseURL);
};

export const apiService = () => {
  if (!apiServiceInstance) throw new Error("ApiService not initialized.");
  return apiServiceInstance;
};
