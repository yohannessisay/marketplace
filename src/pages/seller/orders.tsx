"use client";

import type React from "react";
import { useState, useEffect, useCallback } from "react";
import {
  Calendar,
  ShoppingBag,
  Clock,
  Info,
  ChevronDown,
  Filter,
  User,
  CheckCircle,
  Circle,
  AlertCircle,
  Search,
  Coffee,
  File,
  MapPin,
  Hand,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { apiService } from "@/services/apiService";
import { Link } from "react-router-dom";
import Header from "@/components/layout/header";
import { useNotification } from "@/hooks/useNotification";
import { APIErrorResponse } from "@/types/api";
import {
  SkeletonBidsTable,
  SkeletonOrdersTable,
  SkeletonSampleRequestsTable,
} from "./skeletons";

interface Seller {
  first_name?: string;
  last_name?: string;
}

interface Buyer {
  first_name?: string;
  last_name?: string;
}

interface Listing {
  id: string;
  coffee_variety?: string;
  farm_name?: string;
  region?: string;
  processing_method?: string;
  bean_type?: string;
  price_per_kg?: number;
  is_organic?: boolean;
  quantity_kg?: number;
  farm?: { farm_name: string; region: string | null };
}

interface Order {
  id: string;
  order_id: string;
  buyer_name: string;
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
  seller?: Seller;
}

interface SampleRequest {
  id: string;
  listing_id: string;
  buyer_id: string;
  weight: number;
  phone: string | null;
  delivery_address: string;
  delivery_status: string;
  expires_at: string;
  created_at: string;
  updated_at: string | null;
  listing: {
    id: string;
    coffee_variety: string;
    listing_status: string;
    farm: {
      farm_id: string;
      farm_name: string;
      region: string | null;
      country: string;
    } | null;
  } | null;
  buyer: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string;
    company_name: string | null;
  } | null;
}

interface Bid {
  id: string;
  buyer_id: string;
  seller_id: string;
  listing_id: string;
  quantity_kg: number;
  unit_price: number;
  total_amount: number;
  status: "pending" | "accepted" | "rejected" | "expired";
  expires_at: string;
  created_at: string;
  updated_at: string | null;
  listing?: Listing;
  buyer?: Buyer;
}

interface PaginationData {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

enum SampleRequestDeliveryStatus {
  PENDING = "pending",
  INPROGRESS = "inprogress",
  DELIVERED = "delivered",
  CANCELLED = "cancelled",
  ACCEPTED = "accepted",
}

enum OrderBidStatus {
  PENDING = "pending",
  ACCEPTED = "accepted",
  REJECTED = "rejected",
  EXPIRED = "expired",
}

interface OrderFilterState {
  status?: string;
  coffeeVariety?: string;
  dateFrom?: string;
  dateTo?: string;
  contractSigned?: boolean;
  coffeeProcessingCompleted?: boolean;
  coffeeReadyForShipment?: boolean;
  preShipmentSampleApproved?: boolean;
  containerLoaded?: boolean;
  containerOnBoard?: boolean;
  delivered?: boolean;
}

interface SampleFilterState {
  status?: SampleRequestDeliveryStatus;
  coffeeVariety?: string;
  dateFrom?: string;
  dateTo?: string;
}

interface BidFilterState {
  status?: OrderBidStatus;
  coffeeVariety?: string;
  dateFrom?: string;
  dateTo?: string;
}

interface FavoriteFilterState {
  listingStatus?: string;
  coffeeVariety?: string;
  dateFrom?: string;
  dateTo?: string;
}

export default function OrdersPage({ fmrId }: { fmrId?: string }) {
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [historicalOrders, setHistoricalOrders] = useState<Order[]>([]);
  const [sampleRequests, setSampleRequests] = useState<SampleRequest[]>([]);
  const [bids, setBids] = useState<Bid[]>([]);
  const [activePagination, setActivePagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 0,
  });
  const [historyPagination, setHistoryPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 0,
  });
  const [samplePagination, setSamplePagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 0,
  });
  const [bidsPagination, setBidsPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 0,
  });
  const [activeLoading, setActiveLoading] = useState<boolean>(true);
  const [historyLoading, setHistoryLoading] = useState<boolean>(true);
  const [sampleLoading, setSampleLoading] = useState<boolean>(true);
  const [bidsLoading, setBidsLoading] = useState<boolean>(true);
  const [generalLoading, setGeneralLoading] = useState<boolean>(false);
  const [activeError, setActiveError] = useState<string | null>(null);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [sampleError, setSampleError] = useState<string | null>(null);
  const [bidsError, setBidsError] = useState<string | null>(null);
  const [activeCurrentPage, setActiveCurrentPage] = useState<number>(1);
  const [historyCurrentPage, setHistoryCurrentPage] = useState<number>(1);
  const [sampleCurrentPage, setSampleCurrentPage] = useState<number>(1);
  const [bidsCurrentPage, setBidsCurrentPage] = useState<number>(1);
  const [activeSearchTerm, setActiveSearchTerm] = useState<string>("");
  const [historySearchTerm, setHistorySearchTerm] = useState<string>("");
  const [sampleSearchTerm, setSampleSearchTerm] = useState<string>("");
  const [bidsSearchTerm, setBidsSearchTerm] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("current");
  const [fetchedTabs, setFetchedTabs] = useState<{
    current: boolean;
    historical: boolean;
    sample: boolean;
    bids: boolean;
  }>({ current: false, historical: false, sample: false, bids: false });
  const [filters, setFilters] = useState<{
    current: OrderFilterState;
    historical: OrderFilterState;
    sample: SampleFilterState;
    bids: BidFilterState;
    favorites: FavoriteFilterState;
  }>({
    current: { status: "", coffeeVariety: "" },
    historical: { status: "", coffeeVariety: "" },
    sample: { status: undefined, coffeeVariety: "" },
    bids: { status: undefined, coffeeVariety: "" },
    favorites: { coffeeVariety: "" },
  });

  const { successMessage, errorMessage } = useNotification();

  const fetchActiveOrders = useCallback(async () => {
    setActiveLoading(true);
    try {
      const filterParams = new URLSearchParams({
        page: activeCurrentPage.toString(),
        limit: activePagination.limit.toString(),
        search: encodeURIComponent(activeSearchTerm),
        ...(filters!.current.status && { status: filters!.current.status }),
        ...(filters!.current.coffeeVariety && {
          coffee_variety: filters!.current.coffeeVariety,
        }),
        ...(filters!.current.dateFrom && {
          date_from: filters!.current.dateFrom,
        }),
        ...(filters!.current.dateTo && { date_to: filters!.current.dateTo }),
        ...(filters!.current.contractSigned !== undefined && {
          contract_signed: filters!.current.contractSigned.toString(),
        }),
        ...(filters!.current.coffeeProcessingCompleted !== undefined && {
          coffee_processing_completed:
            filters!.current.coffeeProcessingCompleted.toString(),
        }),
        ...(filters!.current.coffeeReadyForShipment !== undefined && {
          coffee_ready_for_shipment:
            filters!.current.coffeeReadyForShipment.toString(),
        }),
        ...(filters!.current.preShipmentSampleApproved !== undefined && {
          pre_shipment_sample_approved:
            filters!.current.preShipmentSampleApproved.toString(),
        }),
        ...(filters!.current.containerLoaded !== undefined && {
          container_loaded: filters!.current.containerLoaded.toString(),
        }),
        ...(filters!.current.containerOnBoard !== undefined && {
          container_on_board: filters!.current.containerOnBoard.toString(),
        }),
        ...(filters!.current.delivered !== undefined && {
          delivered: filters!.current.delivered.toString(),
        }),
      }).toString();

      const response: any = await apiService().get(
        `/orders/active-orders?${filterParams}`,
      );
      if (response.success) {
        setActiveOrders(response.data.orders || []);
        setActivePagination(
          response.data.pagination || {
            page: 1,
            limit: 10,
            totalItems: 0,
            totalPages: 0,
          },
        );
        setFetchedTabs((prev) => ({ ...prev, current: true }));
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
  }, [activeCurrentPage, activeSearchTerm, filters!.current]);

  const fetchHistoricalOrders = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const filterParams = new URLSearchParams({
        page: historyCurrentPage.toString(),
        limit: historyPagination.limit.toString(),
        search: encodeURIComponent(historySearchTerm),
        ...(filters!.historical.status && {
          status: filters!.historical.status,
        }),
        ...(filters!.historical.coffeeVariety && {
          coffee_variety: filters!.historical.coffeeVariety,
        }),
        ...(filters!.historical.dateFrom && {
          date_from: filters!.historical.dateFrom,
        }),
        ...(filters!.historical.dateTo && {
          date_to: filters!.historical.dateTo,
        }),
        ...(filters!.historical.contractSigned !== undefined && {
          contract_signed: filters!.historical.contractSigned.toString(),
        }),
        ...(filters!.historical.coffeeProcessingCompleted !== undefined && {
          coffee_processing_completed:
            filters!.historical.coffeeProcessingCompleted.toString(),
        }),
        ...(filters!.historical.coffeeReadyForShipment !== undefined && {
          coffee_ready_for_shipment:
            filters!.historical.coffeeReadyForShipment.toString(),
        }),
        ...(filters!.historical.preShipmentSampleApproved !== undefined && {
          pre_shipment_sample_approved:
            filters!.historical.preShipmentSampleApproved.toString(),
        }),
        ...(filters!.historical.containerLoaded !== undefined && {
          container_loaded: filters!.historical.containerLoaded.toString(),
        }),
        ...(filters!.historical.containerOnBoard !== undefined && {
          container_on_board: filters!.historical.containerOnBoard.toString(),
        }),
        ...(filters!.historical.delivered !== undefined && {
          delivered: filters!.historical.delivered.toString(),
        }),
      }).toString();

      const response: any = await apiService().get(
        `/orders/order-history?${filterParams}`,
      );
      if (response.success) {
        setHistoricalOrders(response.data.orders || []);
        setHistoryPagination(
          response.data.pagination || {
            page: 1,
            limit: 10,
            totalItems: 0,
            totalPages: 0,
          },
        );
        setFetchedTabs((prev) => ({ ...prev, historical: true }));
      } else {
        setHistoryError("Failed to fetch order history");
      }
    } catch (err: unknown) {
      const errorResponse = err as APIErrorResponse;
      setHistoryError(errorResponse.error?.message || "An error occurred");
      errorMessage(errorResponse);
    } finally {
      setHistoryLoading(false);
    }
  }, [historyCurrentPage, historySearchTerm, filters!.historical]);

  const fetchSampleRequests = useCallback(async () => {
    setSampleLoading(true);
    try {
      const filterParams = new URLSearchParams({
        page: sampleCurrentPage.toString(),
        limit: samplePagination.limit.toString(),
        search: encodeURIComponent(sampleSearchTerm),
        ...(filters!.sample.status && {
          delivery_status: filters!.sample.status,
        }),
        ...(filters!.sample.coffeeVariety && {
          coffee_variety: filters!.sample.coffeeVariety,
        }),
        ...(filters!.sample.dateFrom && {
          date_from: filters!.sample.dateFrom,
        }),
        ...(filters!.sample.dateTo && { date_to: filters!.sample.dateTo }),
      }).toString();

      const response: any = await apiService().get(
        `/sellers/samples/get-sample-requests?${filterParams}`,
      );
      if (response.success) {
        setSampleRequests(response.data.sampleRequests || []);
        setSamplePagination(
          response.data.pagination || {
            page: 1,
            limit: 10,
            totalItems: 0,
            totalPages: 0,
          },
        );
        setFetchedTabs((prev) => ({ ...prev, sample: true }));
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
  }, [sampleCurrentPage, sampleSearchTerm, filters!.sample]);

  const fetchSellerBids = useCallback(async () => {
    setBidsLoading(true);
    try {
      const filterParams = new URLSearchParams({
        page: bidsCurrentPage.toString(),
        limit: bidsPagination.limit.toString(),
        search: encodeURIComponent(bidsSearchTerm),
        ...(filters!.bids.status && { status: filters!.bids.status }),
        ...(filters!.bids.coffeeVariety && {
          coffee_variety: filters!.bids.coffeeVariety,
        }),
        ...(filters!.bids.dateFrom && { date_from: filters!.bids.dateFrom }),
        ...(filters!.bids.dateTo && { date_to: filters!.bids.dateTo }),
      }).toString();

      const response: any = await apiService().get(
        `/sellers/listings/bids/get-bids?${filterParams}`,
      );
      if (response.success) {
        setBids(response.data.bids || []);
        setBidsPagination(
          response.data.pagination || {
            page: 1,
            limit: 10,
            totalItems: 0,
            totalPages: 0,
          },
        );
        setFetchedTabs((prev) => ({ ...prev, bids: true }));
      } else {
        setBidsError("Failed to fetch bids");
      }
    } catch (err: unknown) {
      const errorResponse = err as APIErrorResponse;
      setBidsError(errorResponse.error?.message || "An error occurred");
      errorMessage(errorResponse);
    } finally {
      setBidsLoading(false);
    }
  }, [bidsCurrentPage, bidsSearchTerm, filters!.bids]);

  const fetchData = useCallback(async () => {
    setBidsLoading(true);
    try {
      const filterParams = new URLSearchParams({
        page: bidsCurrentPage.toString(),
        limit: bidsPagination.limit.toString(),
        search: encodeURIComponent(bidsSearchTerm),
        ...(filters!.bids.status && { status: filters!.bids.status }),
        ...(filters!.bids.coffeeVariety && {
          coffee_variety: filters!.bids.coffeeVariety,
        }),
        ...(filters!.bids.dateFrom && { date_from: filters!.bids.dateFrom }),
        ...(filters!.bids.dateTo && { date_to: filters!.bids.dateTo }),
      }).toString();

      const response: any = await apiService().get(
        `/sellers/listings/bids/get-bids?${filterParams}`,
      );
      if (response.success) {
        setBids(response.data.bids || []);
        setBidsPagination(
          response.data.pagination || {
            page: 1,
            limit: 10,
            totalItems: 0,
            totalPages: 0,
          },
        );
      } else {
        setBidsError("Failed to fetch bids");
      }
    } catch (err: unknown) {
      const errorResponse = err as APIErrorResponse;
      setBidsError(errorResponse.error?.message || "An error occurred");
      errorMessage(errorResponse);
    } finally {
      setBidsLoading(false);
    }
  }, [bidsCurrentPage, bidsSearchTerm, filters!.bids]);

  const acceptBid = async (bidId: string) => {
    try {
      setGeneralLoading(true);
      await apiService().post(
        `/sellers/listings/bids/accept-bid?bidId=${bidId}`,
        fmrId ? fmrId : "",
      );
      successMessage("Bid accepted successfully, and order is placed");
      fetchData();
    } catch (error: any) {
      console.error("Error accepting bid:", error);
      errorMessage(error as APIErrorResponse);
    } finally {
      setGeneralLoading(false);
    }
  };

  const rejectBid = async (bidId: string) => {
    try {
      setGeneralLoading(true);
      await apiService().post(
        `/sellers/listings/bids/reject-bid?bidId=${bidId}`,
        fmrId ? fmrId : "",
      );
      successMessage("Bid rejected successfully");
      fetchData();
    } catch (error: any) {
      console.error("Error rejecting bid:", error);
      errorMessage(error as APIErrorResponse);
    } finally {
      setGeneralLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "current" && !fetchedTabs.current) {
      fetchActiveOrders();
    }
  }, [activeTab, fetchActiveOrders, fetchedTabs.current]);

  useEffect(() => {
    if (activeTab === "historical" && !fetchedTabs.historical) {
      fetchHistoricalOrders();
    }
  }, [activeTab, fetchHistoricalOrders, fetchedTabs.historical]);

  useEffect(() => {
    if (activeTab === "sample" && !fetchedTabs.sample) {
      fetchSampleRequests();
    }
  }, [activeTab, fetchSampleRequests, fetchedTabs.sample]);

  useEffect(() => {
    if (activeTab === "bids" && !fetchedTabs.bids) {
      fetchSellerBids();
    }
  }, [activeTab, fetchSellerBids, fetchedTabs.bids]);

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setExpandedOrderId(null);
  };

  const handleFilterChange = (
    tab: string,
    filter: OrderFilterState | SampleFilterState | BidFilterState,
  ) => {
    setFilters((prev) => ({ ...prev, [tab]: filter }));
    setFetchedTabs((prev) => ({ ...prev, [tab]: false }));
    if (tab === "current") setActiveCurrentPage(1);
    if (tab === "historical") setHistoryCurrentPage(1);
    if (tab === "sample") setSampleCurrentPage(1);
    if (tab === "bids") setBidsCurrentPage(1);
  };

  const handleActiveSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveCurrentPage(1);
    setFetchedTabs((prev) => ({ ...prev, current: false }));
    fetchActiveOrders();
  };

  const handleHistorySearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHistoryCurrentPage(1);
    setFetchedTabs((prev) => ({ ...prev, historical: false }));
    fetchHistoricalOrders();
  };

  const handleSampleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSampleCurrentPage(1);
    setFetchedTabs((prev) => ({ ...prev, sample: false }));
    fetchSampleRequests();
  };

  const handleBidsSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setBidsCurrentPage(1);
    setFetchedTabs((prev) => ({ ...prev, bids: false }));
    fetchSellerBids();
  };

  const FilterMenu = ({ tab }: { tab: string }) => {
    const currentFilters = filters[tab as keyof typeof filters];
    const isOrderTab = tab === "current" || tab === "historical";
    const isSampleTab = tab === "sample";
    const isBidsTab = tab === "bids";
    const isFavoritesTab = tab === "favorites";

    const filterCount = Object.values(currentFilters).filter(
      (value) => value !== undefined && value !== "",
    ).length;

    const statusOptions = isSampleTab
      ? Object.values(SampleRequestDeliveryStatus)
      : isBidsTab
        ? Object.values(OrderBidStatus)
        : isOrderTab
          ? ["pending", "completed", "cancelled"]
          : [];
    const coffeeVarieties = [
      "Yirgacheffe",
      "Sidamo",
      "Guji",
      "Harrar",
      "Jimma",
    ];
    const listingStatusOptions = ["active", "inactive"];
    const booleanOptions = ["true", "false"];

    const getFilterStateWithoutStatus = () => {
      if (isOrderTab) {
        const { status: _status, ...rest } = currentFilters as OrderFilterState;
        return rest;
      } else if (isSampleTab) {
        const { status: _status, ...rest } = currentFilters as SampleFilterState;
        return rest;
      } else if (isBidsTab) {
        const { status: _status, ...rest } = currentFilters as BidFilterState;
        return rest;
      }
      return currentFilters;
    };

    const getFilterStateWithoutCoffeeVariety = () => {
      if (isOrderTab) {
        const { coffeeVariety: _coffeeVariety, ...rest } = currentFilters as OrderFilterState;
        return rest;
      } else if (isSampleTab) {
        const { coffeeVariety: _coffeeVariety, ...rest } = currentFilters as SampleFilterState;
        return rest;
      } else if (isBidsTab) {
        const { coffeeVariety: _coffeeVariety, ...rest } = currentFilters as BidFilterState;
        return rest;
      } else if (isFavoritesTab) {
        const { coffeeVariety: _coffeeVariety, ...rest } =
          currentFilters as FavoriteFilterState;
        return rest;
      }
      return currentFilters;
    };

    const getFilterStateWithoutListingStatus = () => {
      if (isFavoritesTab) {
        const { listingStatus: _listingStatus, ...rest } =
          currentFilters as FavoriteFilterState;
        return rest;
      }
      return currentFilters;
    };

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-10 relative">
            <Filter className="h-4 w-4 mr-2" />
            Filter
            {filterCount > 0 && (
              <Badge
                variant="secondary"
                className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center rounded-full bg-primary text-white"
              >
                {filterCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64 p-4">
          <DropdownMenuLabel>Filter Options</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {statusOptions.length > 0 && (
            <div className="mb-2">
              <label className="text-sm font-medium">Status</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {(isOrderTab &&
                      (currentFilters as OrderFilterState).status) ||
                      (isSampleTab &&
                        (currentFilters as SampleFilterState).status) ||
                      (isBidsTab &&
                        (currentFilters as BidFilterState).status) ||
                      "All Statuses"}
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onClick={() =>
                      handleFilterChange(tab, getFilterStateWithoutStatus())
                    }
                  >
                    All Statuses
                  </DropdownMenuItem>
                  {statusOptions.map((status) => (
                    <DropdownMenuItem
                      key={status}
                      onClick={() =>
                        handleFilterChange(tab, { ...currentFilters, status })
                      }
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
          {(isOrderTab || isSampleTab || isBidsTab || isFavoritesTab) && (
            <div className="mb-2">
              <label className="text-sm font-medium">Coffee Variety</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {(isOrderTab &&
                      (currentFilters as OrderFilterState).coffeeVariety) ||
                      (isSampleTab &&
                        (currentFilters as SampleFilterState).coffeeVariety) ||
                      (isBidsTab &&
                        (currentFilters as BidFilterState).coffeeVariety) ||
                      (isFavoritesTab &&
                        (currentFilters as FavoriteFilterState)
                          .coffeeVariety) ||
                      "All Varieties"}
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onClick={() =>
                      handleFilterChange(
                        tab,
                        getFilterStateWithoutCoffeeVariety(),
                      )
                    }
                  >
                    All Varieties
                  </DropdownMenuItem>
                  {coffeeVarieties.map((variety) => (
                    <DropdownMenuItem
                      key={variety}
                      onClick={() =>
                        handleFilterChange(tab, {
                          ...currentFilters,
                          coffeeVariety: variety,
                        })
                      }
                    >
                      {variety}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
          {isFavoritesTab && (
            <div className="mb-2">
              <label className="text-sm font-medium">Listing Status</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {(currentFilters as FavoriteFilterState).listingStatus ||
                      "All Statuses"}
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onClick={() =>
                      handleFilterChange(
                        tab,
                        getFilterStateWithoutListingStatus(),
                      )
                    }
                  >
                    All Statuses
                  </DropdownMenuItem>
                  {listingStatusOptions.map((status) => (
                    <DropdownMenuItem
                      key={status}
                      onClick={() =>
                        handleFilterChange(tab, {
                          ...(currentFilters as FavoriteFilterState),
                          status: status,
                        })
                      }
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
          {isOrderTab && (
            <>
              <div className="mb-2">
                <label className="text-sm font-medium">Contract Signed</label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                    >
                      {(currentFilters as OrderFilterState).contractSigned ===
                      undefined
                        ? "Any"
                        : ((
                            currentFilters as OrderFilterState
                          ).contractSigned?.toString() ?? "Any")}
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onClick={() =>
                        handleFilterChange(tab, {
                          ...(currentFilters as OrderFilterState),
                          contractSigned: undefined,
                        })
                      }
                    >
                      Any
                    </DropdownMenuItem>
                    {booleanOptions.map((value) => (
                      <DropdownMenuItem
                        key={value}
                        onClick={() =>
                          handleFilterChange(tab, {
                            ...(currentFilters as OrderFilterState),
                            contractSigned: value === "true",
                          })
                        }
                      >
                        {value.charAt(0).toUpperCase() + value.slice(1)}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="mb-2">
                <label className="text-sm font-medium">
                  Processing Completed
                </label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                    >
                      {(currentFilters as OrderFilterState)
                        .coffeeProcessingCompleted === undefined
                        ? "Any"
                        : ((
                            currentFilters as OrderFilterState
                          ).coffeeProcessingCompleted?.toString() ?? "Any")}
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onClick={() =>
                        handleFilterChange(tab, {
                          ...(currentFilters as OrderFilterState),
                          coffeeProcessingCompleted: undefined,
                        })
                      }
                    >
                      Any
                    </DropdownMenuItem>
                    {booleanOptions.map((value) => (
                      <DropdownMenuItem
                        key={value}
                        onClick={() =>
                          handleFilterChange(tab, {
                            ...(currentFilters as OrderFilterState),
                            coffeeProcessingCompleted: value === "true",
                          })
                        }
                      >
                        {value.charAt(0).toUpperCase() + value.slice(1)}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="mb-2">
                <label className="text-sm font-medium">
                  Ready for Shipment
                </label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                    >
                      {(currentFilters as OrderFilterState)
                        .coffeeReadyForShipment === undefined
                        ? "Any"
                        : ((
                            currentFilters as OrderFilterState
                          ).coffeeReadyForShipment?.toString() ?? "Any")}
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onClick={() =>
                        handleFilterChange(tab, {
                          ...(currentFilters as OrderFilterState),
                          coffeeReadyForShipment: undefined,
                        })
                      }
                    >
                      Any
                    </DropdownMenuItem>
                    {booleanOptions.map((value) => (
                      <DropdownMenuItem
                        key={value}
                        onClick={() =>
                          handleFilterChange(tab, {
                            ...(currentFilters as OrderFilterState),
                            coffeeReadyForShipment: value === "true",
                          })
                        }
                      >
                        {value.charAt(0).toUpperCase() + value.slice(1)}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="mb-2">
                <label className="text-sm font-medium">Sample Approved</label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                    >
                      {(currentFilters as OrderFilterState)
                        .preShipmentSampleApproved === undefined
                        ? "Any"
                        : ((
                            currentFilters as OrderFilterState
                          ).preShipmentSampleApproved?.toString() ?? "Any")}
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onClick={() =>
                        handleFilterChange(tab, {
                          ...(currentFilters as OrderFilterState),
                          preShipmentSampleApproved: undefined,
                        })
                      }
                    >
                      Any
                    </DropdownMenuItem>
                    {booleanOptions.map((value) => (
                      <DropdownMenuItem
                        key={value}
                        onClick={() =>
                          handleFilterChange(tab, {
                            ...(currentFilters as OrderFilterState),
                            preShipmentSampleApproved: value === "true",
                          })
                        }
                      >
                        {value.charAt(0).toUpperCase() + value.slice(1)}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="mb-2">
                <label className="text-sm font-medium">Container Loaded</label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                    >
                      {(currentFilters as OrderFilterState).containerLoaded ===
                      undefined
                        ? "Any"
                        : ((
                            currentFilters as OrderFilterState
                          ).containerLoaded?.toString() ?? "Any")}
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onClick={() =>
                        handleFilterChange(tab, {
                          ...(currentFilters as OrderFilterState),
                          containerLoaded: undefined,
                        })
                      }
                    >
                      Any
                    </DropdownMenuItem>
                    {booleanOptions.map((value) => (
                      <DropdownMenuItem
                        key={value}
                        onClick={() =>
                          handleFilterChange(tab, {
                            ...(currentFilters as OrderFilterState),
                            containerLoaded: value === "true",
                          })
                        }
                      >
                        {value.charAt(0).toUpperCase() + value.slice(1)}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="mb-2">
                <label className="text-sm font-medium">Shipped</label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                    >
                      {(currentFilters as OrderFilterState).containerOnBoard ===
                      undefined
                        ? "Any"
                        : ((
                            currentFilters as OrderFilterState
                          ).containerOnBoard?.toString() ?? "Any")}
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onClick={() =>
                        handleFilterChange(tab, {
                          ...(currentFilters as OrderFilterState),
                          containerOnBoard: undefined,
                        })
                      }
                    >
                      Any
                    </DropdownMenuItem>
                    {booleanOptions.map((value) => (
                      <DropdownMenuItem
                        key={value}
                        onClick={() =>
                          handleFilterChange(tab, {
                            ...(currentFilters as OrderFilterState),
                            containerOnBoard: value === "true",
                          })
                        }
                      >
                        {value.charAt(0).toUpperCase() + value.slice(1)}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="mb-2">
                <label className="text-sm font-medium">Delivered</label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                    >
                      {(currentFilters as OrderFilterState).delivered ===
                      undefined
                        ? "Any"
                        : ((
                            currentFilters as OrderFilterState
                          ).delivered?.toString() ?? "Any")}
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onClick={() =>
                        handleFilterChange(tab, {
                          ...(currentFilters as OrderFilterState),
                          delivered: undefined,
                        })
                      }
                    >
                      Any
                    </DropdownMenuItem>
                    {booleanOptions.map((value) => (
                      <DropdownMenuItem
                        key={value}
                        onClick={() =>
                          handleFilterChange(tab, {
                            ...(currentFilters as OrderFilterState),
                            delivered: value === "true",
                          })
                        }
                      >
                        {value.charAt(0).toUpperCase() + value.slice(1)}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </>
          )}
          <div className="mb-2">
            <label className="text-sm font-medium">Date From</label>
            <Input
              type="date"
              value={
                (isOrderTab && (currentFilters as OrderFilterState).dateFrom) ||
                (isSampleTab &&
                  (currentFilters as SampleFilterState).dateFrom) ||
                (isBidsTab && (currentFilters as BidFilterState).dateFrom) ||
                (isFavoritesTab &&
                  (currentFilters as FavoriteFilterState).dateFrom) ||
                ""
              }
              onChange={(e) =>
                handleFilterChange(tab, {
                  ...currentFilters,
                  dateFrom: e.target.value,
                })
              }
            />
          </div>
          <div className="mb-2">
            <label className="text-sm font-medium">Date To</label>
            <Input
              type="date"
              value={
                (isOrderTab && (currentFilters as OrderFilterState).dateTo) ||
                (isSampleTab && (currentFilters as SampleFilterState).dateTo) ||
                (isBidsTab && (currentFilters as BidFilterState).dateTo) ||
                (isFavoritesTab &&
                  (currentFilters as FavoriteFilterState).dateTo) ||
                ""
              }
              onChange={(e) =>
                handleFilterChange(tab, {
                  ...currentFilters,
                  dateTo: e.target.value,
                })
              }
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full mt-2"
            onClick={() => handleFilterChange(tab, {})}
          >
            Clear Filters
            <X className="h-4 w-4 ml-2" />
          </Button>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  const renderOrderProgress = (order: Order) => {
    const steps = [
      { key: "order_placed", label: "Order Placed", completed: true },
      {
        key: "contract_signed",
        label: "Contract Signed",
        completed: order.contract_signed,
      },
      {
        key: "coffee_processing_completed",
        label: "Processing Completed",
        completed: order.coffee_processing_completed,
      },
      {
        key: "coffee_ready_for_shipment",
        label: "Ready for Shipment",
        completed: order.coffee_ready_for_shipment,
      },
      {
        key: "pre_shipment_sample_approved",
        label: "Sample Approved",
        completed: order.pre_shipment_sample_approved,
      },
      {
        key: "container_loaded",
        label: "Container Loaded",
        completed: order.container_loaded,
      },
      {
        key: "container_on_board",
        label: "Shipped",
        completed: order.container_on_board,
      },
      {
        key: "delivered",
        label: "Delivered",
        completed: order.status === "completed",
      },
    ];

    const currentStepIndex = steps.findIndex((step) => !step.completed);

    return (
      <Card className="mt-6">
        <CardContent className="pt-6">
          <h4 className="text-sm font-semibold mb-4">Order Progress</h4>
          <div className="space-y-4">
            {steps.map((step, index) => {
              let statusClass = "";
              let StatusIcon = Circle;

              if (step.completed) {
                statusClass = "text-green-600";
                StatusIcon = CheckCircle;
              } else if (index === currentStepIndex) {
                statusClass = "text-primary";
                StatusIcon = AlertCircle;
              } else {
                statusClass = "text-muted-foreground/30";
                StatusIcon = Circle;
              }

              return (
                <div key={step.key} className="flex items-center">
                  <div className={`${statusClass}`}>
                    <StatusIcon className="h-5 w-5" />
                  </div>
                  <div
                    className={`ml-3 ${
                      step.completed
                        ? "text-foreground"
                        : index === currentStepIndex
                          ? "text-foreground font-medium"
                          : "text-muted-foreground"
                    }`}
                  >
                    {step.label}
                  </div>
                  {step.completed && index < steps.length - 1 && (
                    <div className="ml-auto text-xs text-green-600 font-medium">
                      Completed
                    </div>
                  )}
                  {!step.completed && index === currentStepIndex && (
                    <div className="ml-auto text-xs text-primary font-medium">
                      In Progress
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  };

  const OrderItem = ({ item, tabType }: { item: Order; tabType: string }) => {
    const isExpanded = expandedOrderId === item.id;
    const listing: Listing | undefined = item.listing;

    return (
      <Card className="mb-4 overflow-hidden transition-all duration-200 hover:shadow-md">
        <CardContent className="p-5">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <h3 className="font-bold text-lg">
                  {item.order_id || "Unknown Order"}
                </h3>
                {listing?.is_organic && (
                  <Badge
                    variant="outline"
                    className="ml-2 bg-green-500 text-white border-0"
                  >
                    Organic
                  </Badge>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-lg text-green-600">
                ${item.unit_price?.toFixed(2)}/kg
              </div>
              <div className="text-sm text-muted-foreground">
                {item.quantity_kg.toLocaleString()} kg
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center mt-2 text-sm text-muted-foreground gap-3">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              <span>
                Ordered: {new Date(item.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          <Separator className="my-3" />
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <User className="h-4 w-4 mr-1 text-muted-foreground" />
              <span className="text-sm font-medium">
                {item.buyer_name || "Unknown"}{" "}
              </span>
              {item.seller && (
                <Link
                  to={`/sellers/${item.seller.first_name?.toLowerCase()}-${item.seller.last_name?.toLowerCase()}`}
                  className="ml-2 text-xs text-green-600 hover:text-green-700 font-medium"
                >
                  View Seller
                </Link>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Badge
                variant={
                  item.status === "completed"
                    ? "default"
                    : item.status === "confirmed"
                      ? "default"
                      : item.status === "pending"
                        ? "warning"
                        : "outline"
                }
              >
                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => toggleOrderExpansion(item.id)}
              >
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                />
              </Button>
            </div>
          </div>

          {isExpanded && (
            <div className="mt-4 pt-4 border-t animate-in fade-in-50 duration-300">
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="text-sm font-semibold mb-2">Order Details</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Order ID:</span>
                      <span className="font-medium">
                        {item.order_id || item.id}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Unit Price:</span>
                      <span className="font-medium">
                        ${item.unit_price.toFixed(2)}/kg
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Quantity:</span>
                      <span className="font-medium">
                        {item.quantity_kg.toLocaleString()} kg
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Total Amount:
                      </span>
                      <span className="font-bold text-green-600">
                        ${item.total_amount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold mb-2">
                    Shipping Information
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Address:</span>
                      <span className="font-medium">
                        {item.ship_adrs || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Zip Code:</span>
                      <span className="font-medium">
                        {item.ship_zipcode || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Instructions:
                      </span>
                      <span className="font-medium">
                        {item.ship_instructions || "None"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {tabType === "current" && renderOrderProgress(item)}
            </div>
          )}

          <div className="flex items-center text-slate-500 text-sm mb-2">
            <Coffee className="h-4 w-4 mr-1" />
            <span>{listing?.bean_type || "Unknown"}</span>
          </div>
        </CardContent>
      </Card>
    );
  };

  const EmptyState = ({ tabType }: { tabType: string }) => {
    const message =
      tabType === "sample"
        ? "No sample requests found. Check back later or browse the marketplace."
        : tabType === "bids"
          ? "No bids found. Check back later or list more coffee in the marketplace."
          : "Head to the marketplace to place your first order of premium Ethiopian coffee.";

    return (
      <Card className="w-full">
        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
          <div className="rounded-full bg-muted p-3">
            <Info className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-medium">
            No{" "}
            {tabType === "current"
              ? "active orders"
              : tabType === "historical"
                ? "order history"
                : tabType === "sample"
                  ? "sample requests"
                  : "bids"}{" "}
            found
          </h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-md">
            {message}
          </p>
          <Link to="/market-place">
            <Button className="mt-6 bg-green-600 hover:bg-green-700">
              Browse Marketplace
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  };

  const SampleRequestItem = ({ item }: { item: SampleRequest }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isSubmmiting, setIsSubmmiting] = useState(false);
    const [deliveryStatus, setDeliveryStatus] = useState(item.delivery_status);
    const { successMessage, errorMessage } = useNotification();

    const toggleOrderExpansion = () => {
      setIsExpanded((prev) => !prev);
    };

    const handleUpdateStatus = async (id: string, status: string) => {
      try {
        setIsSubmmiting(true);
        await apiService().post(
          `/sellers/samples/update-sample-request-status?sampleRequestId=${id}`,
          {
            delivery_status: status.toLowerCase(),
          },
        );

        setDeliveryStatus(status.toLowerCase());
        successMessage(`Sample request status updated to ${status}`);
        setIsSubmmiting(false);
      } catch (error) {
        setIsSubmmiting(false);
        console.error("Error updating status:", error);
        errorMessage(error as APIErrorResponse);
      }
    };

    return (
      <Card className="mb-4 overflow-hidden transition-all duration-200 hover:shadow-md">
        <CardContent className="p-5">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <h3 className="font-bold text-lg">
                  {item.listing?.coffee_variety || "Unknown Coffee"}
                </h3>
                {item.listing?.listing_status === "active" && (
                  <Badge
                    variant="outline"
                    className="ml-2 bg-green-500 text-white border-0"
                  >
                    Active Listing
                  </Badge>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                {item.listing?.coffee_variety || "Unknown Variety"}
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
              <MapPin className="h-4 w-4 mr-1" />
              <span>{item.listing?.farm?.farm_name || "Unknown Farm"}</span>
            </div>
          </div>

          <Separator className="my-3" />
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <User className="h-4 w-4 mr-1 text-muted-foreground" />
              <span className="text-sm font-medium">
                {item.buyer?.first_name || "Unknown"}{" "}
                {item.buyer?.last_name || ""}
              </span>
              {item.buyer && (
                <Link
                  to={`/buyers/${item.buyer_id}`}
                  className="ml-2 text-xs text-green-600 hover:text-green-700 font-medium"
                >
                  View Buyer
                </Link>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  deliveryStatus === "delivered"
                    ? "default"
                    : deliveryStatus === "inprogress"
                      ? "warning"
                      : deliveryStatus === "accepted"
                        ? "default"
                        : deliveryStatus === "pending"
                          ? "warning"
                          : "destructive"
                }
              >
                {deliveryStatus.charAt(0).toUpperCase() +
                  deliveryStatus.slice(1)}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleOrderExpansion}
              >
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                />
              </Button>
            </div>
          </div>

          {isExpanded && (
            <div className="mt-4 pt-4 border-t animate-in fade-in-50 duration-300">
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="text-sm font-semibold mb-2">
                    Sample Request Details
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Request ID:</span>
                      <span className="font-medium">{item.id}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Coffee Variety:
                      </span>
                      <span className="font-medium">
                        {item.listing?.coffee_variety || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Weight:</span>
                      <span className="font-medium">
                        {item.weight.toFixed(2)} kg
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Expires At:</span>
                      <span className="font-medium">
                        {new Date(item.expires_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-2">
                    Buyer & Delivery
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Company:</span>
                      <span className="font-medium">
                        {item.buyer?.company_name || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Email:</span>
                      <span className="font-medium">
                        {item.buyer?.email || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Phone:</span>
                      <span className="font-medium">{item.phone || "N/A"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Address:</span>
                      <span className="font-medium">
                        {item.delivery_address || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex justify-end space-x-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      disabled={
                        isSubmmiting ||
                        item.delivery_status === "delivered" ||
                        item.delivery_status === "cancelled"
                      }
                    >
                      {isSubmmiting ? "Updating..." : "Update Status"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onClick={() => handleUpdateStatus(item.id, "accepted")}
                      className="cursor-pointer"
                    >
                      Accept
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => handleUpdateStatus(item.id, "inprogress")}
                    >
                      Inprogress
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => handleUpdateStatus(item.id, "delivered")}
                    >
                      Delivered
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => handleUpdateStatus(item.id, "cancelled")}
                    >
                      Cancel
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Link to={`/listing/${item.listing_id}`}>
                  <Button>View Listing</Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen pt-20 bg-primary/5 p-8">
      <Header />
      <main className="container mx-auto px-4 py-6 max-w-5xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">My Orders</h1>
        </div>

        <Tabs
          defaultValue="current"
          className="mb-6"
          onValueChange={handleTabChange}
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger
              value="current"
              className="flex items-center justify-center h-12"
            >
              <Clock className="h-4 w-4 mr-2" />
              Current Orders
            </TabsTrigger>
            <TabsTrigger
              value="historical"
              className="flex items-center justify-center h-12"
            >
              <ShoppingBag className="h-4 w-4 mr-2" />
              Order History
            </TabsTrigger>
            <TabsTrigger
              value="sample"
              className="flex items-center justify-center h-12"
            >
              <File className="h-4 w-4 mr-2" />
              Sample Requests
            </TabsTrigger>
            <TabsTrigger
              value="bids"
              className="flex items-center justify-center h-12"
            >
              <Hand className="h-4 w-4 mr-2" />
              All Bids
            </TabsTrigger>
          </TabsList>

          <TabsContent value="current" className="mt-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 shadow-md bg-white p-2 rounded-md">
              <p className="text-sm text-muted-foreground font-medium">
                {activeLoading
                  ? "Loading..."
                  : `${activeOrders.length} Active Orders`}
              </p>
              <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                <form
                  onSubmit={handleActiveSearch}
                  className="flex gap-2 w-full md:w-auto"
                >
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search orders with order id e.g. AV-G1WKYIQN..."
                      value={activeSearchTerm}
                      onChange={(e) => setActiveSearchTerm(e.target.value)}
                      className="w-full md:w-[500px] pl-8"
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="outline"
                    size="sm"
                    className="h-10"
                  >
                    Search
                  </Button>
                </form>
                <FilterMenu tab="current" />
              </div>
            </div>

            <div className="space-y-5">
              {activeLoading ? (
                <SkeletonOrdersTable />
              ) : activeError ? (
                <Card className="p-6 text-center text-red-500">
                  {activeError}
                </Card>
              ) : activeOrders.length > 0 ? (
                <>
                  {activeOrders.map((item) => (
                    <OrderItem key={item.id} item={item} tabType="current" />
                  ))}
                  {activePagination.totalPages > 1 && (
                    <Pagination className="mt-6">
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              if (activeCurrentPage > 1)
                                setActiveCurrentPage(activeCurrentPage - 1);
                            }}
                            className={
                              activeCurrentPage <= 1
                                ? "pointer-events-none opacity-50"
                                : ""
                            }
                          />
                        </PaginationItem>
                        {Array.from(
                          { length: activePagination.totalPages },
                          (_, i) => i + 1,
                        ).map((page) => (
                          <PaginationItem key={page}>
                            <PaginationLink
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                setActiveCurrentPage(page);
                              }}
                              isActive={page === activeCurrentPage}
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        <PaginationItem>
                          <PaginationNext
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              if (
                                activeCurrentPage < activePagination.totalPages
                              )
                                setActiveCurrentPage(activeCurrentPage + 1);
                            }}
                            className={
                              activeCurrentPage >= activePagination.totalPages
                                ? "pointer-events-none opacity-50"
                                : ""
                            }
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  )}
                </>
              ) : (
                <EmptyState tabType="current" />
              )}
            </div>
          </TabsContent>

          <TabsContent value="historical" className="mt-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 shadow-md bg-white p-2 rounded-md">
              <p className="text-sm text-muted-foreground font-medium">
                {historyLoading
                  ? "Loading..."
                  : `${historicalOrders.length} Past Orders`}
              </p>
              <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                <form
                  onSubmit={handleHistorySearch}
                  className="flex gap-2 w-full md:w-auto"
                >
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search history with order id e.g. AV-G1WKYIQN..."
                      value={historySearchTerm}
                      onChange={(e) => setHistorySearchTerm(e.target.value)}
                      className="w-full md:w-[500px] pl-8"
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="outline"
                    size="sm"
                    className="h-10"
                  >
                    Search
                  </Button>
                </form>
                <FilterMenu tab="historical" />
              </div>
            </div>

            <div className="space-y-5">
              {historyLoading ? (
                <SkeletonOrdersTable />
              ) : historyError ? (
                <Card className="p-6 text-center text-red-500">
                  {historyError}
                </Card>
              ) : historicalOrders.length > 0 ? (
                <>
                  {historicalOrders.map((item) => (
                    <OrderItem key={item.id} item={item} tabType="historical" />
                  ))}
                  {historyPagination.totalPages > 1 && (
                    <Pagination className="mt-6">
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              if (historyCurrentPage > 1)
                                setHistoryCurrentPage(historyCurrentPage - 1);
                            }}
                            className={
                              historyCurrentPage <= 1
                                ? "pointer-events-none opacity-50"
                                : ""
                            }
                          />
                        </PaginationItem>
                        {Array.from(
                          { length: historyPagination.totalPages },
                          (_, i) => i + 1,
                        ).map((page) => (
                          <PaginationItem key={page}>
                            <PaginationLink
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                setHistoryCurrentPage(page);
                              }}
                              isActive={page === historyCurrentPage}
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        <PaginationItem>
                          <PaginationNext
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              if (
                                historyCurrentPage <
                                historyPagination.totalPages
                              )
                                setHistoryCurrentPage(historyCurrentPage + 1);
                            }}
                            className={
                              historyCurrentPage >= historyPagination.totalPages
                                ? "pointer-events-none opacity-50"
                                : ""
                            }
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  )}
                </>
              ) : (
                <EmptyState tabType="historical" />
              )}
            </div>
          </TabsContent>

          <TabsContent value="sample" className="mt-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 shadow-md bg-white p-2 rounded-md">
              <p className="text-sm text-muted-foreground font-medium">
                {sampleLoading
                  ? "Loading..."
                  : `${sampleRequests.length} Sample Requests`}
              </p>
              <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                <form
                  onSubmit={handleSampleSearch}
                  className="flex gap-2 w-full md:w-auto"
                >
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search sample requests with coffee variety..."
                      value={sampleSearchTerm}
                      onChange={(e) => setSampleSearchTerm(e.target.value)}
                      className="w-full md:w-[500px] pl-8"
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="outline"
                    size="sm"
                    className="h-10"
                  >
                    Search
                  </Button>
                </form>
                <FilterMenu tab="sample" />
              </div>
            </div>

            <div className="space-y-5">
              {sampleLoading ? (
                <SkeletonSampleRequestsTable />
              ) : sampleError ? (
                <Card className="p-6 text-center text-red-500">
                  {sampleError}
                </Card>
              ) : sampleRequests.length > 0 ? (
                <>
                  {sampleRequests.map((item) => (
                    <SampleRequestItem key={item.id} item={item} />
                  ))}
                  {samplePagination.totalPages > 1 && (
                    <Pagination className="mt-6">
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              if (sampleCurrentPage > 1)
                                setSampleCurrentPage(sampleCurrentPage - 1);
                            }}
                            className={
                              sampleCurrentPage <= 1
                                ? "pointer-events-none opacity-50"
                                : ""
                            }
                          />
                        </PaginationItem>
                        {Array.from(
                          { length: samplePagination.totalPages },
                          (_, i) => i + 1,
                        ).map((page) => (
                          <PaginationItem key={page}>
                            <PaginationLink
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                setSampleCurrentPage(page);
                              }}
                              isActive={page === sampleCurrentPage}
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        <PaginationItem>
                          <PaginationNext
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              if (
                                sampleCurrentPage < samplePagination.totalPages
                              )
                                setSampleCurrentPage(sampleCurrentPage + 1);
                            }}
                            className={
                              sampleCurrentPage >= samplePagination.totalPages
                                ? "pointer-events-none opacity-50"
                                : ""
                            }
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  )}
                </>
              ) : (
                <EmptyState tabType="sample" />
              )}
            </div>
          </TabsContent>

          <TabsContent value="bids" className="mt-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 shadow-md bg-white p-2 rounded-md">
              <p className="text-sm text-muted-foreground font-medium">
                {bidsLoading ? "Loading..." : `${bids.length} Bids`}
              </p>
              <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                <form
                  onSubmit={handleBidsSearch}
                  className="flex gap-2 w-full md:w-auto"
                >
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search bids with coffee variety..."
                      value={bidsSearchTerm}
                      onChange={(e) => setBidsSearchTerm(e.target.value)}
                      className="w-full md:w-[500px] pl-8"
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="outline"
                    size="sm"
                    className="h-10"
                  >
                    Search
                  </Button>
                </form>
                <FilterMenu tab="bids" />
              </div>
            </div>

            <div className="space-y-5">
              {bidsLoading ? (
                <SkeletonBidsTable />
              ) : bidsError ? (
                <Card className="p-6 text-center text-red-500">
                  {bidsError}
                </Card>
              ) : bids.length > 0 ? (
                <>
                  <Card>
                    <CardContent className="p-6">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Bid ID</TableHead>
                            <TableHead>Listing</TableHead>
                            <TableHead>Buyer</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Unit Price</TableHead>
                            <TableHead>Total Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Expires At</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {bids.map((bid) => (
                            <TableRow key={bid.id}>
                              <TableCell>{bid.id}</TableCell>
                              <TableCell>
                                <div>
                                  <Link
                                    to={`/manage-listing/${bid.listing_id}`}
                                    className="text-green-600 hover:text-green-700"
                                  >
                                    {bid.listing?.coffee_variety || "Unknown"}
                                  </Link>
                                  <div className="text-sm text-muted-foreground">
                                    {bid.listing?.farm?.farm_name ||
                                      "Unknown Farm"}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                {bid.buyer ? (
                                  <Link
                                    to={`/buyers/${bid.buyer_id}`}
                                    className="text-green-600 hover:text-green-700"
                                  >
                                    {bid.buyer.first_name || "Unknown"}{" "}
                                    {bid.buyer.last_name || ""}
                                  </Link>
                                ) : (
                                  "Unknown"
                                )}
                              </TableCell>
                              <TableCell>
                                {bid.quantity_kg.toLocaleString()} kg
                              </TableCell>
                              <TableCell>
                                ${bid.unit_price.toFixed(2)}/kg
                              </TableCell>
                              <TableCell>
                                ${bid.total_amount.toLocaleString()}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    bid.status === "accepted"
                                      ? "default"
                                      : bid.status === "pending"
                                        ? "warning"
                                        : bid.status === "rejected"
                                          ? "destructive"
                                          : "outline"
                                  }
                                >
                                  {bid.status.charAt(0).toUpperCase() +
                                    bid.status.slice(1)}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {new Date(bid.expires_at).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button
                                    variant="default"
                                    size="sm"
                                    onClick={() => acceptBid(bid.id)}
                                    disabled={
                                      bid.status !== "pending" ||
                                      bidsLoading ||
                                      generalLoading
                                    }
                                  >
                                    Accept
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => rejectBid(bid.id)}
                                    disabled={
                                      bid.status !== "pending" ||
                                      bidsLoading ||
                                      generalLoading
                                    }
                                  >
                                    Reject
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                  {bidsPagination.totalPages > 1 && (
                    <Pagination className="mt-6">
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              if (bidsCurrentPage > 1)
                                setBidsCurrentPage(bidsCurrentPage - 1);
                            }}
                            className={
                              bidsCurrentPage <= 1
                                ? "pointer-events-none opacity-50"
                                : ""
                            }
                          />
                        </PaginationItem>
                        {Array.from(
                          { length: bidsPagination.totalPages },
                          (_, i) => i + 1,
                        ).map((page) => (
                          <PaginationItem key={page}>
                            <PaginationLink
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                setBidsCurrentPage(page);
                              }}
                              isActive={page === bidsCurrentPage}
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        <PaginationItem>
                          <PaginationNext
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              if (bidsCurrentPage < bidsPagination.totalPages)
                                setBidsCurrentPage(bidsCurrentPage + 1);
                            }}
                            className={
                              bidsCurrentPage >= bidsPagination.totalPages
                                ? "pointer-events-none opacity-50"
                                : ""
                            }
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  )}
                </>
              ) : (
                <EmptyState tabType="bids" />
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
