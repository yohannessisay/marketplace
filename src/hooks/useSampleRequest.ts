import { useState, useEffect, useCallback } from "react";
import { apiService } from "@/services/apiService";
import { APIErrorResponse } from "@/types/api";
import { useAuth } from "./useAuth";

interface UseSampleRequestState {
  hasSampleRequest: boolean | null;
  loading: boolean;
  error: string | null;
  checkSampleRequest: (listingId: string) => Promise<void>;
}

export const useSampleRequest = (): UseSampleRequestState => {
  const [hasSampleRequest, setHasSampleRequest] = useState<boolean | null>(
    null,
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, user, loading: authLoading } = useAuth();

  const checkSampleRequest = useCallback(
    async (listingId: string) => {
      if (!isAuthenticated || !user) {
        setError("User must be authenticated to check sample requests");
        setHasSampleRequest(null);
        return;
      }

      if (user.userType === "seller" || user.userType === "agent") {
        setHasSampleRequest(false);
        setError(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response: any = await apiService().get(
          `/buyers/samples/check-sample-request?listing_id=${listingId}`,
        );

        if (response.success) {
          setHasSampleRequest(response.data.hasSampleRequest);
        } else {
          const errorResponse = response as APIErrorResponse;
          setError(
            errorResponse.error.message || "Failed to check sample request",
          );
          setHasSampleRequest(null);
        }
      } catch (err) {
        const errorResponse = err as APIErrorResponse;
        setError(
          errorResponse.error?.message || "An unexpected error occurred",
        );
        setHasSampleRequest(null);
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, user],
  );

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated || !user) {
      setHasSampleRequest(null);
      setError("User must be authenticated to check sample requests");
      setLoading(false);
      return;
    }

    if (user.userType === "seller" || user.userType === "agent") {
      setHasSampleRequest(false);
      setError(null);
      setLoading(false);
      return;
    }
  }, [isAuthenticated, user, authLoading]);

  return {
    hasSampleRequest,
    loading,
    error,
    checkSampleRequest,
  };
};
