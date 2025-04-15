import { APIErrorResponse } from "@/types/api";
import { toast } from "sonner";

export const useNotification = () => {
  const successMessage = (message: string) => {
    toast.success(message);
  };

  const errorMessage = (error: APIErrorResponse | any) => {
    toast.error(
      error.error.message ||
        error.error.details ||
        "An error occurred. Please try again.",
    );
  };

  const warningMessage = (message: string) => {
    toast.warning(message);
  };

  return { successMessage, errorMessage, warningMessage };
};
