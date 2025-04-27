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
import { Calendar, File } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SampleRequest {
  id: string;
  weight: number;
  phone: string | null;
  delivery_address: string;
  delivery_status: string;
  expires_at: string;
  created_at: string;
  updated_at: string | null;
  coffee_listing: {
    id: string;
    coffee_variety: string;
    bean_type: string;
    is_organic: boolean;
    quantity_kg: number;
    price_per_kg: number;
    readiness_date: string;
    listing_status: string;
  };
  farm: {
    id: string;
    farm_name: string;
    region: string;
    country: string;
    altitude_meters: number;
  };
  seller: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    telegram: string | null;
  };
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

const SampleRequestsTab: React.FC = () => {
  const [sampleRequests, setSampleRequests] = useState<SampleRequest[]>([]);
  const [samplePagination, setSamplePagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    total: 0,
    total_pages: 0,
  });
  const [sampleLoading, setSampleLoading] = useState<boolean>(true);
  const [sampleError, setSampleError] = useState<string | null>(null);
  const [sampleCurrentPage, setSampleCurrentPage] = useState<number>(1);
  const [sampleSearchTerm, setSampleSearchTerm] = useState<string>("");
  const { errorMessage } = useNotification();

  useEffect(() => {
    const fetchSampleRequests = async () => {
      setSampleLoading(true);
      try {
        const response: any = await apiService().get(
          `/orders/sample-requests?page=${sampleCurrentPage}&limit=${
            samplePagination.limit
          }&search=${encodeURIComponent(sampleSearchTerm)}`
        );
        if (response.success) {
          setSampleRequests(response.data.requests || []);
          setSamplePagination(
            response.data.pagination || {
              page: 1,
              limit: 10,
              total: 0,
              total_pages: 0,
            }
          );
        } else {
          setSampleError("Failed to fetch sample requests");
        }
      } catch (err: unknown) {
        const errorResponse = err as APIErrorResponse;
        setSampleError(errorResponse.error?.message || "An error occurred");
        errorMessage(errorResponse);
      } finally {
        setSampleLoading(false);
      }
    };

    fetchSampleRequests();
  }, [sampleCurrentPage, sampleSearchTerm]);

  return (
    <div>
      <div className="flex items-center mb-4">
        <Input
          placeholder="Search sample requests..."
          value={sampleSearchTerm}
          onChange={(e) => setSampleSearchTerm(e.target.value)}
          className="max-w-xs"
        />
      </div>
      {sampleLoading ? (
        <div>Loading...</div>
      ) : sampleError ? (
        <div className="text-red-500">{sampleError}</div>
      ) : (
        <div>
          {sampleRequests.length === 0 ? (
            <div>No sample requests found.</div>
          ) : (
            sampleRequests.map((item) => (
              <Card key={item.id} className="mb-4 overflow-hidden transition-all duration-200 hover:shadow-md">
                <CardContent className="p-5">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="font-bold text-lg">
                          {item.coffee_listing?.coffee_variety || "Unknown Coffee"}
                        </h3>
                        {item.coffee_listing?.listing_status === "active" && (
                          <Badge
                            variant="outline"
                            className="ml-2 bg-green-500 text-white border-0"
                          >
                            Active Listing
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {item.farm?.farm_name || "Unknown Farm"}
                        {item.farm?.region ? `, ${item.farm.region}` : ""}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">
                        {item.weight.toFixed(2)} kg
                      </div>
                      <div className="text-sm text-muted-foreground">Sample Weight</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center mt-2 text-sm text-muted-foreground gap-3">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>
                        Requested: {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <File className="h-4 w-4 mr-1" />
                      <span>Status: {item.delivery_status}</span>
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
                    setSampleCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  aria-disabled={sampleCurrentPage === 1}
                />
              </PaginationItem>
              {[...Array(samplePagination.total_pages)].map((_, idx) => (
                <PaginationItem key={idx}>
                  <PaginationLink
                    isActive={sampleCurrentPage === idx + 1}
                    onClick={() => setSampleCurrentPage(idx + 1)}
                  >
                    {idx + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    setSampleCurrentPage((prev) =>
                      Math.min(prev + 1, samplePagination.total_pages)
                    )
                  }
                  aria-disabled={sampleCurrentPage === samplePagination.total_pages}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
};

export default SampleRequestsTab;