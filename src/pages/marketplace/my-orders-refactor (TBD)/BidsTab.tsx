import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { apiService } from "@/services/apiService";
import { useNotification } from "@/hooks/useNotification";
import { APIErrorResponse } from "@/types/api";
import { Hand } from "lucide-react";

interface Listing {
  id: string;
  coffee_variety?: string;
  farm_name?: string;
  region?: string;
  processing_method?: string;
  bean_type?: string;
  price_per_kg?: number;
  seller: any;
  cup_score?: string;
  is_organic?: boolean;
  quantity_kg?: number;
  farm?: {
    farm_id: string;
    farm_name: string;
    region: string | null;
    country: string;
  };
}

interface Seller {
  first_name?: string;
  last_name?: string;
}

interface Bid {
  id: string;
  listing_id: string;
  seller_id: string;
  buyer_id: string;
  quantity_kg: number;
  unit_price: number;
  total_amount: number;
  status: string;
  created_at: string;
  expires_at: string;
  updated_at: string | null;
  listing?: Listing;
  seller?: Seller;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

const BidsTab: React.FC = () => {
  const [bids, setBids] = useState<Bid[]>([]);
  const [bidPagination, setBidPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    total: 0,
    total_pages: 0,
  });
  const [bidLoading, setBidLoading] = useState<boolean>(true);
  const [bidError, setBidError] = useState<string | null>(null);
  const [bidCurrentPage, setBidCurrentPage] = useState<number>(1);
  const [bidSearchTerm, setBidSearchTerm] = useState<string>("");
  const { errorMessage } = useNotification();

  useEffect(() => {
    const fetchBids = async () => {
      setBidLoading(true);
      try {
        const response: any = await apiService().get(
          `/orders/bids?page=${bidCurrentPage}&limit=${
            bidPagination.limit
          }&search=${encodeURIComponent(bidSearchTerm)}`
        );
        if (response.success) {
          setBids(response.data.bids || []);
          setBidPagination(
            response.data.pagination || {
              page: 1,
              limit: 10,
              total: 0,
              total_pages: 0,
            }
          );
        } else {
          setBidError("Failed to fetch bids");
        }
      } catch (err: unknown) {
        const errorResponse = err as APIErrorResponse;
        setBidError(errorResponse.error?.message || "An error occurred");
        errorMessage(errorResponse);
      } finally {
        setBidLoading(false);
      }
    };

    fetchBids();
  }, [bidCurrentPage, bidSearchTerm]);

  return (
    <div>
      <div className="flex items-center mb-4">
        <Input
          placeholder="Search bids..."
          value={bidSearchTerm}
          onChange={(e) => setBidSearchTerm(e.target.value)}
          className="max-w-xs"
        />
      </div>
      {bidLoading ? (
        <div>Loading...</div>
      ) : bidError ? (
        <div className="text-red-500">{bidError}</div>
      ) : (
        <div>
          {bids.length === 0 ? (
            <div>No bids found.</div>
          ) : (
            bids.map((bid) => (
              <Card key={bid.id} className="mb-4">
                <CardContent className="p-5">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-bold text-lg">
                        {bid.listing?.coffee_variety || "Unknown Coffee"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {bid.listing?.farm_name || "Unknown Farm"}
                        {bid.listing?.region ? `, ${bid.listing.region}` : ""}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">
                        {bid.quantity_kg} kg
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Quantity
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center mt-2 text-sm text-muted-foreground gap-3">
                    <div className="flex items-center">
                      <Hand className="h-4 w-4 mr-1" />
                      <span>Status: {bid.status}</span>
                    </div>
                    <div className="flex items-center">
                      <span>
                        Bid Amount: ${bid.total_amount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() =>
                    setBidCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  aria-disabled={bidCurrentPage === 1}
                />
              </PaginationItem>
              {[...Array(bidPagination.total_pages)].map((_, idx) => (
                <PaginationItem key={idx}>
                  <PaginationLink
                    isActive={bidCurrentPage === idx + 1}
                    onClick={() => setBidCurrentPage(idx + 1)}
                  >
                    {idx + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    setBidCurrentPage((prev) =>
                      Math.min(prev + 1, bidPagination.total_pages)
                    )
                  }
                  aria-disabled={bidCurrentPage === bidPagination.total_pages}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
};

export default BidsTab;