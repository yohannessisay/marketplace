export interface ApiResponse<T> {
  Status: "success" | "error";
  Messages: string[];
  Data: T;
}
export interface ApiError {
  message: string;
  status: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
}
