import Cookies from 'js-cookie'
export interface ApiError {
    message: string;
    status?: number;
    data?: unknown;
  }
  
  class ApiService {
    private baseURL: string;
  
    constructor(baseURL: string) {
      this.baseURL = baseURL;
    }
  
    private async handleResponse<T>(response: Response): Promise<T> {
      const contentType = response.headers.get('content-type');
      let data;
  
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }
  
      if (!response.ok) {
        const error: ApiError = {
          message: data?.message || response.statusText,
          status: response.status,
          data: data,
        };
        throw error;
      }
  
      return data as T;
    }
  
    private async makeRequest<T>(
      url: string,
      method: string,
      body?: unknown,
      useAuth = false,
    ): Promise<T> {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
  
      if (useAuth) {
        const token = this.getToken();
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        } else {
          throw { message: 'Authentication token not available', status: 401 };
        }
      }
  
      const options: RequestInit = {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      };
  
      const response = await fetch(`${this.baseURL}${url}`, options);
      return this.handleResponse<T>(response);
    }
  
    private getToken(): string | null {
      return Cookies.get('accessToken') || null;
    }
  
    async get<T>(url: string): Promise<T> {
      return this.makeRequest<T>(url, 'GET');
    }
  
    async getWithAuth<T>(url: string): Promise<T> {
      return this.makeRequest<T>(url, 'GET', undefined, true);
    }
  
    async post<T>(url: string, body: unknown): Promise<T> {
      return this.makeRequest<T>(url, 'POST', body);
    }
  
    async postWithAuth<T>(url: string, body: unknown): Promise<T> {
      return this.makeRequest<T>(url, 'POST', body, true);
    }
  
    async put<T>(url: string, body: unknown): Promise<T> {
      return this.makeRequest<T>(url, 'PUT', body, true);
    }
  
    async patch<T>(url: string, body: unknown): Promise<T> {
      return this.makeRequest<T>(url, 'PATCH', body, true);
    }
  
    async delete<T>(url: string): Promise<T> {
      return this.makeRequest<T>(url, 'DELETE', undefined, true);
    }
  }
  
  
  let apiServiceInstance: ApiService | null = null;
  
  export const initializeApiService = (baseURL: string) => {
    if (!apiServiceInstance) {
      apiServiceInstance = new ApiService(baseURL);
    }
  };
  
  export const apiService = () => {
    if (!apiServiceInstance) {
      throw new Error('ApiService not initialized. Call initializeApiService first.');
    }
    return apiServiceInstance;
  };