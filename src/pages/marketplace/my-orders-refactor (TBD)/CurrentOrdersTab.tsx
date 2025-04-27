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
import { Calendar, Clock } from "lucide-react";  

 

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

interface Order {
  id: string;
  order_id: string;
  buyer_id: string;
  seller_id: string;
  listing_id: string;
  quantity_kg: number;
  unit_price: number;
  total_amount: number;
  contract_signed: boolean;
  coffee_processing_completed: boolean;
  coffee_ready_for_shipment: boolean;
  pre_shipment_sample_approved: boolean;
  pre_shipment_sample_ready: boolean;
  container_loaded: boolean;
  container_on_board: boolean;
  cancelled_reason: string | null;
  cancelled_by: string | null;
  ship_zipcode: string;
  ship_adrs: string;
  ship_instructions: string;
  status: string;
  created_at: string;
  updated_at: string | null;
  created_by_agent_id: string | null;
  listing?: Listing;
  seller_name?: string;
  buyer_name?: string;
  review: any;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

const CurrentOrdersTab: React.FC = () => { 
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [activePagination, setActivePagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    total: 0,
    total_pages: 0,
  });
  const [activeLoading, setActiveLoading] = useState<boolean>(true);
  const [activeError, setActiveError] = useState<string | null>(null);
  const [activeCurrentPage, setActiveCurrentPage] = useState<number>(1);
  const [activeSearchTerm, setActiveSearchTerm] = useState<string>("");
  const { errorMessage } = useNotification();

  useEffect(() => {
    const fetchActiveOrders = async () => {
      setActiveLoading(true);
      try {
        const response: any = await apiService().get(
          `/orders/active-orders?page=${activeCurrentPage}&limit=${
            activePagination.limit
          }&search=${encodeURIComponent(activeSearchTerm)}`
        );
        if (response.success) {
          setActiveOrders(response.data.orders || []);
          setActivePagination(
            response.data.pagination || {
              page: 1,
              limit: 10,
              total: 0,
              total_pages: 0,
            }
          );
        } else {
          setActiveError("Failed to fetch active orders");
        }
      } catch (err: unknown) {
        const errorResponse = err as APIErrorResponse;
        setActiveError(errorResponse.error?.message || "An error occurred");
        errorMessage(errorResponse);
      } finally {
        setActiveLoading(false);
      }
    };

    fetchActiveOrders();
  }, [activeCurrentPage, activeSearchTerm]);

  return (
    <div>
      <div className="flex items-center mb-4">
        <Input
          placeholder="Search orders..."
          value={activeSearchTerm}
          onChange={(e) => setActiveSearchTerm(e.target.value)}
          className="max-w-xs"
        />
      </div>
      {activeLoading ? (
        <div>Loading...</div>
      ) : activeError ? (
        <div className="text-red-500">{activeError}</div>
      ) : (
        <div>
          {activeOrders.length === 0 ? (
            <div>No current orders found.</div>
          ) : (
            activeOrders.map((order) => (
              <Card key={order.id} className="mb-4">
                <CardContent className="p-5">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-bold text-lg">
                        {order.listing?.coffee_variety || "Unknown Coffee"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {order.listing?.farm_name || "Unknown Farm"}
                        {order.listing?.region ? `, ${order.listing.region}` : ""}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">
                        {order.quantity_kg} kg
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Quantity
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center mt-2 text-sm text-muted-foreground gap-3">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>
                        Ordered: {new Date(order.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>Status: {order.status}</span>
                    </div>
                  </div>
                  {/* Add more order details/actions as needed */}
                </CardContent>
              </Card>
            ))
          )}
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() =>
                    setActiveCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  aria-disabled={activeCurrentPage === 1}
                />
              </PaginationItem>
              {[...Array(activePagination.total_pages)].map((_, idx) => (
                <PaginationItem key={idx}>
                  <PaginationLink
                    isActive={activeCurrentPage === idx + 1}
                    onClick={() => setActiveCurrentPage(idx + 1)}
                  >
                    {idx + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    setActiveCurrentPage((prev) =>
                      Math.min(prev + 1, activePagination.total_pages)
                    )
                  }
                  aria-disabled={activeCurrentPage === activePagination.total_pages}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
};

export default CurrentOrdersTab;