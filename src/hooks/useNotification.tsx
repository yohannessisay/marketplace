 
import { ApiError } from "@/types/api";
import { toast } from "sonner";

export const useNotification = () => {
  const successMessage = (message: string) => {
    toast.success(message);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const errorMessage = (error: ApiError | any) => {
    toast.error(
      error?.response?.data?.message ||
        error?.message ||
        error?.response?.data ||
        error?.response ||
        error?.details ||
        "An error occurred. Please try again."
    );
  };

  const warningMessage = (message: string) => {
    toast.warning(message);
  };

  return { successMessage, errorMessage, warningMessage };
};
