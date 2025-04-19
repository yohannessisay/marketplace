import { useState, useEffect, useCallback } from "react";
import { apiService } from "@/services/apiService";
import { APIErrorResponse } from "@/types/api";
import { useAuth } from "./useAuth";

interface UseBuyerOrderDataState {
  hasBid: boolean | null;
  loading: boolean;
  error: string | null;
  checkBid: (listingId: string) => Promise<void>;
}

export const useBuyerOrderData = (): UseBuyerOrderDataState => {
  const [hasBid, setHasBid] = useState<boolean | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, user, loading: authLoading } = useAuth();

  const checkBid = useCallback(
    async (listingId: string) => {
      if (!isAuthenticated || !user) {
        setError("User must be authenticated to check bids");
        setHasBid(null);
        return;
      }

      if (user.userType === "seller") {
        setHasBid(false);
        setError(null);
        setLoading(false);
        return;
      }

      if (user.userType !== "buyer") {
        setError("User must be a buyer to check bids");
        setHasBid(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response: any = await apiService().get(
          `/buyers/bids/check-buyer-bid?listing_id=${listingId}`,
        );

        if (response.success) {
          setHasBid(response.data.hasBid);
        } else {
          const errorResponse = response as APIErrorResponse;
          setError(errorResponse.error.message || "Failed to check bid");
          setHasBid(null);
        }
      } catch (err) {
        const errorResponse = err as APIErrorResponse;
        setError(
          errorResponse.error?.message || "An unexpected error occurred",
        );
        setHasBid(null);
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, user],
  );

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated || !user) {
      setHasBid(null);
      setError("User must be authenticated to check bids");
      setLoading(false);
      return;
    }

    if (user.userType === "seller") {
      setHasBid(false);
      setError(null);
      setLoading(false);
      return;
    }

    if (user.userType !== "buyer") {
      setHasBid(null);
      setError("User must be a buyer to check bids");
      setLoading(false);
    }
  }, [isAuthenticated, user, authLoading]);

  return {
    hasBid,
    loading,
    error,
    checkBid,
  };
};
