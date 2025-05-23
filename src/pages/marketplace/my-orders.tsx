"use client";

import type React from "react";
import { useState, useEffect, useCallback } from "react";
import { ShoppingBag, Clock, Search, File, Hand, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/layout/header";
import { useNotification } from "@/hooks/useNotification";
import { APIErrorResponse } from "@/types/api";
import { ReviewModal } from "./review-modal";
import { FileUploadModal } from "@/components/modals/FileUploadModal";
import { FilePreviewModal } from "@/components/modals/FilePreviewModal";
import { FilterMenu } from "./my-orders/filter";
import { OrderItem } from "./my-orders/order-item";
import { FavoriteItem } from "./my-orders/favorite-item";
import { SampleRequestItem } from "./my-orders/sample-request-item";
import { EmptyState } from "./my-orders/empty-state";
import { LoadingSkeleton } from "./my-orders/loading-skeleton";
import { FileUpdateModal } from "@/components/modals/FileUpdateModal";
import {
  BidFilterState,
  FavoriteFilterState,
  OrderFilterState,
  SampleFilterState,
} from "@/types/orders";

export interface Buyer {
  first_name?: string;
  last_name?: string;
}

export interface Listing {
  id: string;
  coffee_variety?: string;
  farm_name?: string;
  region?: string;
  processing_method?: string;
  bean_type?: string;
  price_per_kg?: number;
  is_organic?: boolean;
  quantity_kg?: number;
  farm?: {
    farm_name: string;
    region: string | null;
    country: string;
  };
  listing_status?: string;
  seller: Seller;
}

export interface OrderDocument {
  id: string;
  url: string;
  type:
    | "contract"
    | "commercial_invoice"
    | "packing_list"
    | "certificate_of_origin"
    | "phytosanitary_certificate"
    | "bill_of_lading"
    | "ico"
    | "payment_slip";
  name?: string;
  created_at: string;
}

export interface Review {
  rating: number;
  comment: string | null;
  created_at: string;
  reviewer_buyer_id: string | null;
}

export interface Order {
  id: string;
  order_id: string;
  buyer_name: string;
  buyer_id: string;
  seller_id: string;
  listing_id: string;
  quantity_kg: number;
  unit_price: number;
  total_amount: number;
  cancelled_reason: string | null;
  cancelled_by: string | null;
  ship_zipcode: string;
  ship_adrs: string;
  ship_instructions: string;
  status: string;
  created_at: string;
  updated_at: string | null;
  created_by_agent_id: string | null;
  current_progress_status?: OrderProgressStatus;
  listing?: Listing;
  seller?: Seller;
  buyer?: Buyer;
  documents?: OrderDocument[];
  reviews: Review[];
}

export interface SampleRequest {
  id: string;
  weight: number;
  phone: string | null;
  delivery_address: string;
  delivery_status: string;
  expires_at: string;
  created_at: string | null;
  updated_at: string | null;
  coffee_listing: {
    id: string;
    coffee_variety: string;
    bean_type: string | null;
    is_organic: boolean;
    quantity_kg: number;
    price_per_kg: number;
    readiness_date: string | null;
    listing_status: string;
    farm: {
      id: string;
      farm_name: string;
      region: string | null;
      country: string;
      altitude_meters: string | null;
    };
    seller: {
      id: string;
      first_name: string;
      last_name: string;
      email: string;
      telegram: string | null;
    };
  };
}

export interface Bid {
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
  seller?: Seller;
}

export interface Seller {
  id: string;
  first_name: string;
  last_name: string;
}

export interface Favorite {
  id: string;
  listing_id: string;
  buyer_id: string;
  created_at: string;
  listing: Listing;
}

interface PaginationData {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

enum OrderProgressStatus {
  OrderPlaced = "order_placed",
  ContractSigned = "contract_signed",
  ProcessingCompleted = "processing_completed",
  ReadyForShipment = "ready_for_shipment",
  PreShipmentSampleApproved = "pre_shipment_sample_approved",
  ContainerLoaded = "container_loaded",
  ContainerArrivedToPort = "container_arrived_to_port",
  DocumentationsCompleted = "documentations_completed",
  PaymentCompleted = "payment_completed",
  DeliveryCompleted = "delivery_completed",
}

export default function OrdersPage() {
  const { user, loading } = useAuth();
  const { successMessage, errorMessage } = useNotification();
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [historicalOrders, setHistoricalOrders] = useState<Order[]>([]);
  const [sampleRequests, setSampleRequests] = useState<SampleRequest[] | null>(
    null,
  );
  const [bids, setBids] = useState<Bid[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
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
  const [bidPagination, setBidPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 0,
  });
  const [favoritesPagination, setFavoritesPagination] =
    useState<PaginationData>({
      page: 1,
      limit: 10,
      totalItems: 0,
      totalPages: 0,
    });
  const [activeLoading, setActiveLoading] = useState<boolean>(true);
  const [historyLoading, setHistoryLoading] = useState<boolean>(true);
  const [sampleLoading, setSampleLoading] = useState<boolean>(true);
  const [bidLoading, setBidLoading] = useState<boolean>(true);
  const [favoritesLoading, setFavoritesLoading] = useState<boolean>(true);
  const [activeError, setActiveError] = useState<string | null>(null);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [sampleError, setSampleError] = useState<string | null>(null);
  const [bidError, setBidError] = useState<string | null>(null);
  const [favoritesError, setFavoritesError] = useState<string | null>(null);
  const [activeCurrentPage, setActiveCurrentPage] = useState<number>(1);
  const [historyCurrentPage, setHistoryCurrentPage] = useState<number>(1);
  const [sampleCurrentPage, setSampleCurrentPage] = useState<number>(1);
  const [bidCurrentPage, setBidCurrentPage] = useState<number>(1);
  const [favoritesCurrentPage, setFavoritesCurrentPage] = useState<number>(1);
  const [activeSearchTerm, setActiveSearchTerm] = useState<string>("");
  const [historySearchTerm, setHistorySearchTerm] = useState<string>("");
  const [sampleSearchTerm, setSampleSearchTerm] = useState<string>("");
  const [bidSearchTerm, setBidSearchTerm] = useState<string>("");
  const [favoritesSearchTerm, setFavoritesSearchTerm] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("current");
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [reviewType, setReviewType] = useState<string | null>(null);
  const [fetchedTabs, setFetchedTabs] = useState<{
    current: boolean;
    historical: boolean;
    sample: boolean;
    bids: boolean;
    favorites: boolean;
  }>({
    current: false,
    historical: false,
    sample: false,
    bids: false,
    favorites: false,
  });
  const [filters, setFilters] = useState<{
    current: OrderFilterState;
    historical: OrderFilterState;
    sample: SampleFilterState;
    bids: BidFilterState;
    favorites: FavoriteFilterState;
  }>({
    current: { status: "", coffeeOrigin: "" },
    historical: { status: "", coffeeOrigin: "" },
    sample: { status: undefined, coffeeOrigin: "" },
    bids: { status: undefined, coffeeOrigin: "" },
    favorites: { coffeeOrigin: "" },
  });
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<
    "contract" | "documents" | "payment_slip"
  >("contract");
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);

  const handleUploadModalClose = useCallback(() => {
    setUploadModalOpen(false);
    setCurrentOrderId(null);
  }, []);

  const handleUpdateModalClose = useCallback(() => {
    setUpdateModalOpen(false);
    setCurrentOrderId(null);
  }, []);

  const handlePreviewModalClose = useCallback(() => {
    setPreviewModalOpen(false);
    setCurrentOrderId(null);
  }, []);

  const handleUploadSuccess = useCallback(
    (mode: "contract" | "documents" | "payment_slip", orderId: string) => {
      if (mode === "contract") {
        setActiveOrders((prev) =>
          prev.map((order) =>
            order.id === orderId ? { ...order, contract_signed: true } : order,
          ),
        );
        setHistoricalOrders((prev) =>
          prev.map((order) =>
            order.id === orderId ? { ...order, contract_signed: true } : order,
          ),
        );
      }
      fetchActiveOrders();
      fetchHistoricalOrders();
      successMessage(
        `${mode === "contract" ? "Contract" : "Payment Slip"} uploaded successfully`,
      );
    },
    [successMessage],
  );

  const handleUpdateModalSuccess = useCallback(
    (mode: "contract" | "documents" | "payment_slip", orderId: string) => {
      if (mode === "contract") {
        setActiveOrders((prev) =>
          prev.map((order) =>
            order.id === orderId ? { ...order, contract_signed: true } : order,
          ),
        );
        setHistoricalOrders((prev) =>
          prev.map((order) =>
            order.id === orderId ? { ...order, contract_signed: true } : order,
          ),
        );
      }
      fetchActiveOrders();
      fetchHistoricalOrders();
      successMessage(
        `${mode === "contract" ? "Contract" : "Payment Slip"} updated successfully`,
      );
    },
    [successMessage],
  );

  const fetchActiveOrders = useCallback(async () => {
    if (!user) {
      setActiveError("User not authenticated");
      setActiveLoading(false);
      return;
    }

    try {
      setActiveLoading(true);
      setActiveError(null);
      const filterParams = new URLSearchParams({
        page: activeCurrentPage.toString(),
        limit: activePagination.limit.toString(),
        search: encodeURIComponent(activeSearchTerm),
        ...(filters.current.status && { status: filters.current.status }),
        ...(filters.current.coffeeOrigin && {
          origin: filters.current.coffeeOrigin,
        }),
        ...(filters.current.dateFrom && {
          date_from: filters.current.dateFrom,
        }),
        ...(filters.current.dateTo && { date_to: filters.current.dateTo }),
        ...(filters.current.progressStatus && {
          progress_status: filters.current.progressStatus,
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
        throw new Error(
          response.error?.message || "Failed to fetch active orders",
        );
      }
    } catch (err: unknown) {
      const errorResponse = err as APIErrorResponse;
      setActiveError(errorResponse.error?.message || "An error occurred");
      errorMessage(errorResponse);
    } finally {
      setActiveLoading(false);
    }
  }, [
    user,
    activeCurrentPage,
    activeSearchTerm,
    filters.current,
    errorMessage,
  ]);

  const fetchHistoricalOrders = useCallback(async () => {
    if (!user) {
      setHistoryError("User not authenticated");
      setHistoryLoading(false);
      return;
    }

    try {
      setHistoryLoading(true);
      setHistoryError(null);
      const filterParams = new URLSearchParams({
        page: historyCurrentPage.toString(),
        limit: historyPagination.limit.toString(),
        search: encodeURIComponent(historySearchTerm),
        ...(filters.historical.status && { status: filters.historical.status }),
        ...(filters.historical.coffeeOrigin && {
          origin: filters.historical.coffeeOrigin,
        }),
        ...(filters.historical.dateFrom && {
          date_from: filters.historical.dateFrom,
        }),
        ...(filters.historical.dateTo && {
          date_to: filters.historical.dateTo,
        }),
        ...(filters.historical.progressStatus && {
          progress_status: filters.historical.progressStatus,
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
        throw new Error(
          response.error?.message || "Failed to fetch order history",
        );
      }
    } catch (err: unknown) {
      const errorResponse = err as APIErrorResponse;
      setHistoryError(errorResponse.error?.message || "An error occurred");
      errorMessage(errorResponse);
    } finally {
      setHistoryLoading(false);
    }
  }, [
    user,
    historyCurrentPage,
    historySearchTerm,
    filters.historical,
    errorMessage,
  ]);

  const fetchSampleRequests = useCallback(async () => {
    if (!user) {
      setSampleError("User not authenticated");
      setSampleLoading(false);
      return;
    }

    try {
      setSampleLoading(true);
      setSampleError(null);
      const filterParams = new URLSearchParams({
        page: sampleCurrentPage.toString(),
        limit: samplePagination.limit.toString(),
        search: encodeURIComponent(sampleSearchTerm),
        ...(filters.sample.status && {
          delivery_status: filters.sample.status,
        }),
        ...(filters.sample.coffeeOrigin && {
          origin: filters.sample.coffeeOrigin,
        }),
        ...(filters.sample.dateFrom && { date_from: filters.sample.dateFrom }),
        ...(filters.sample.dateTo && { date_to: filters.sample.dateTo }),
      }).toString();

      const response: any = await apiService().get(
        `/buyers/samples/get-sample-requests?${filterParams}`,
      );

      if (response.success && response.data) {
        setSampleRequests(response.data.sample_requests || null);
        setSamplePagination({
          page: response.data.pagination.page,
          limit: response.data.pagination.limit,
          totalItems: response.data.pagination.total,
          totalPages: response.data.pagination.total_pages,
        });
        setFetchedTabs((prev) => ({ ...prev, sample: true }));
      } else {
        throw new Error(
          response.error?.message || "Failed to fetch sample requests",
        );
      }
    } catch (err: unknown) {
      const errorResponse = err as APIErrorResponse;
      setSampleError(errorResponse.error?.message || "An error occurred");
      setSampleRequests(null);
      errorMessage(errorResponse);
    } finally {
      setSampleLoading(false);
    }
  }, [user, sampleCurrentPage, sampleSearchTerm, filters.sample, errorMessage]);

  const fetchBids = useCallback(async () => {
    if (loading || !user) {
      setBidError("User not authenticated");
      setBidLoading(false);
      return;
    }

    try {
      setBidLoading(true);
      setBidError(null);
      const filterParams = new URLSearchParams({
        page: bidCurrentPage.toString(),
        limit: bidPagination.limit.toString(),
        search: encodeURIComponent(bidSearchTerm),
        ...(filters.bids.status && { status: filters.bids.status }),
        ...(filters.bids.coffeeOrigin && {
          origin: filters.bids.coffeeOrigin,
        }),
        ...(filters.bids.dateFrom && { date_from: filters.bids.dateFrom }),
        ...(filters.bids.dateTo && { date_to: filters.bids.dateTo }),
      }).toString();

      const response: any = await apiService().get(
        `/buyers/bids/get-all-bids?${filterParams}`,
      );

      if (response.success) {
        setBids(response.data.bids || []);
        setBidPagination(
          response.data.pagination || {
            page: 1,
            limit: 10,
            totalItems: 0,
            totalPages: 0,
          },
        );
        setFetchedTabs((prev) => ({ ...prev, bids: true }));
      } else {
        throw new Error(response.error?.message || "Failed to fetch bids");
      }
    } catch (err: unknown) {
      const errorResponse = err as APIErrorResponse;
      setBidError(errorResponse.error?.message || "An error occurred");
      errorMessage(errorResponse);
    } finally {
      setBidLoading(false);
    }
  }, [
    loading,
    user,
    bidCurrentPage,
    bidSearchTerm,
    filters.bids,
    errorMessage,
  ]);

  const fetchFavorites = useCallback(async () => {
    if (!user?.id) {
      setFavoritesError("User not authenticated");
      setFavoritesLoading(false);
      return;
    }

    try {
      setFavoritesLoading(true);
      setFavoritesError(null);
      const filterParams = new URLSearchParams({
        page: favoritesCurrentPage.toString(),
        limit: favoritesPagination.limit.toString(),
        search: encodeURIComponent(favoritesSearchTerm),
        ...(filters.favorites.listingStatus && {
          listing_status: filters.favorites.listingStatus,
        }),
        ...(filters.favorites.coffeeOrigin && {
          origin: filters.favorites.coffeeOrigin,
        }),
        ...(filters.favorites.dateFrom && {
          date_from: filters.favorites.dateFrom,
        }),
        ...(filters.favorites.dateTo && { date_to: filters.favorites.dateTo }),
      }).toString();

      const response: any = await apiService().get(
        `/buyers/listings/favorites/get-favorite-listings?${filterParams}`,
      );

      if (response.success) {
        setFavorites(response.data.favorites || []);
        setFavoritesPagination(
          response.data.pagination || {
            page: 1,
            limit: 10,
            totalItems: 0,
            totalPages: 0,
          },
        );
        setFetchedTabs((prev) => ({ ...prev, favorites: true }));
      } else {
        throw new Error(response.error?.message || "Failed to fetch favorites");
      }
    } catch (err: unknown) {
      const errorResponse = err as APIErrorResponse;
      setFavoritesError(errorResponse.error?.message || "An error occurred");
      errorMessage(errorResponse);
    } finally {
      setFavoritesLoading(false);
    }
  }, [
    user?.id,
    favoritesCurrentPage,
    favoritesSearchTerm,
    filters.favorites,
    errorMessage,
  ]);

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
      fetchBids();
    }
  }, [activeTab, fetchBids, fetchedTabs.bids]);

  useEffect(() => {
    if (activeTab === "favorites" && !fetchedTabs.favorites) {
      fetchFavorites();
    }
  }, [activeTab, fetchFavorites, fetchedTabs.favorites]);

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setExpandedOrderId(null);
  };

  const handleFilterChange = (
    tab: string,
    filter:
      | OrderFilterState
      | SampleFilterState
      | BidFilterState
      | FavoriteFilterState,
  ) => {
    setFilters((prev) => ({ ...prev, [tab]: filter }));
    setFetchedTabs((prev) => ({ ...prev, [tab]: false }));
    if (tab === "current") setActiveCurrentPage(1);
    if (tab === "historical") setHistoryCurrentPage(1);
    if (tab === "sample") setSampleCurrentPage(1);
    if (tab === "bids") setBidCurrentPage(1);
    if (tab === "favorites") setFavoritesCurrentPage(1);
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

  const handleBidSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setBidCurrentPage(1);
    setFetchedTabs((prev) => ({ ...prev, bids: false }));
    fetchBids();
  };

  const handleFavoritesSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFavoritesCurrentPage(1);
    setFetchedTabs((prev) => ({ ...prev, favorites: false }));
    fetchFavorites();
  };

  const handlePreviewDocs = (order: Order) => {
    setModalMode("documents");
    setCurrentOrderId(order.id);
    setPreviewModalOpen(true);
  };

  const openReviewModal = (order: Order, type: string) => {
    setSelectedOrder(order);
    setShowReviewModal(true);
    setReviewType(type || "add");
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
          <TabsList className="flex flex-wrap justify-between gap-2 p-2 bg-gray-100 rounded-md sm:grid sm:grid-cols-5 sm:gap-4 sm:p-4 w-full">
            <TabsTrigger
              value="current"
              className="flex items-center justify-center h-12 text-xs sm:text-sm px-2 sm:px-4 py-2 font-medium transition-all duration-200 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md flex-1 sm:flex-none text-center"
            >
              <Clock className="h-4 w-4 mr-1 sm:mr-2" />
              Current Orders
            </TabsTrigger>
            <TabsTrigger
              value="historical"
              className="flex items-center justify-center h-12 text-xs sm:text-sm px-2 sm:px-4 py-2 font-medium transition-all duration-200 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md flex-1 sm:flex-none text-center"
            >
              <ShoppingBag className="h-4 w-4 mr-1 sm:mr-2" />
              Order History
            </TabsTrigger>
            <TabsTrigger
              value="sample"
              className="flex items-center justify-center h-12 text-xs sm:text-sm px-2 sm:px-4 py-2 font-medium transition-all duration-200 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md flex-1 sm:flex-none text-center"
            >
              <File className="h-4 w-4 mr-1 sm:mr-2" />
              Sample Requests
            </TabsTrigger>
            <TabsTrigger
              value="bids"
              className="flex items-center justify-center h-12 text-xs sm:text-sm px-2 sm:px-4 py-2 font-medium transition-all duration-200 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md flex-1 sm:flex-none text-center"
            >
              <Hand className="h-4 w-4 mr-1 sm:mr-2" />
              All Bids
            </TabsTrigger>
            <TabsTrigger
              value="favorites"
              className="flex items-center justify-center h-12 text-xs sm:text-sm px-2 sm:px-4 py-2 font-medium transition-all duration-200 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md flex-1 sm:flex-none text-center"
            >
              <Heart className="h-4 w-4 mr-1 sm:mr-2" />
              Favorites
            </TabsTrigger>
          </TabsList>

          <TabsContent value="current" className="mt-33 sm:mt-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 shadow-md bg-white p-2 rounded-md">
              <div className="text-sm text-muted-foreground font-medium">
                {activeLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
                    Loading...
                  </div>
                ) : (
                  `${activeOrders.length} Active Orders`
                )}
              </div>
              <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                <form
                  onSubmit={handleActiveSearch}
                  className="flex gap-2 w-full md:w-auto"
                >
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search orders with order id..."
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
                <FilterMenu
                  tab="current"
                  handleFilterChange={handleFilterChange}
                  filters={filters}
                />
              </div>
            </div>

            <div className="space-y-5">
              {activeLoading ? (
                <LoadingSkeleton />
              ) : activeError ? (
                <Card className="p-6 text-center text-red-500">
                  {activeError}
                </Card>
              ) : activeOrders.length > 0 ? (
                <>
                  {activeOrders.map((item) => (
                    <OrderItem
                      key={item.id}
                      item={item}
                      tabType="current"
                      expandedOrderId={expandedOrderId ?? ""}
                      toggleOrderExpansion={toggleOrderExpansion}
                      openReviewModal={openReviewModal}
                      setModalMode={setModalMode}
                      setCurrentOrderId={setCurrentOrderId}
                      setUploadModalOpen={setUploadModalOpen}
                      setPreviewModalOpen={setPreviewModalOpen}
                      handlePreviewDocs={handlePreviewDocs}
                      setUpdateModalOpen={setUpdateModalOpen}
                    />
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

          <TabsContent value="historical" className="mt-33 sm:mt-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 shadow-md bg-white p-2 rounded-md">
              <div className="text-sm text-muted-foreground font-medium">
                {historyLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
                    Loading...
                  </div>
                ) : historicalOrders.length === 0 ? (
                  "No past orders"
                ) : (
                  `${historicalOrders.length} Past Orders`
                )}
              </div>
              <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                <form
                  onSubmit={handleHistorySearch}
                  className="flex gap-2 w-full md:w-auto"
                >
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search order history with order id..."
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
                <FilterMenu
                  tab="historical"
                  handleFilterChange={handleFilterChange}
                  filters={filters}
                />
              </div>
            </div>

            <div className="space-y-5">
              {historyLoading ? (
                <LoadingSkeleton />
              ) : historyError ? (
                <Card className="p-6 text-center text-red-500">
                  {historyError}
                </Card>
              ) : historicalOrders.length > 0 ? (
                <>
                  {historicalOrders.map((item) => (
                    <OrderItem
                      key={item.id}
                      item={item}
                      tabType="historical"
                      expandedOrderId={expandedOrderId ?? ""}
                      toggleOrderExpansion={toggleOrderExpansion}
                      openReviewModal={openReviewModal}
                      setModalMode={setModalMode}
                      setCurrentOrderId={setCurrentOrderId}
                      setUploadModalOpen={setUploadModalOpen}
                      setPreviewModalOpen={setPreviewModalOpen}
                      handlePreviewDocs={handlePreviewDocs}
                      setUpdateModalOpen={setUpdateModalOpen}
                    />
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

          <TabsContent value="sample" className="mt-33 sm:mt-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 shadow-md bg-white p-2 rounded-md">
              <div className="text-sm text-muted-foreground font-medium">
                {sampleLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
                    Loading...
                  </div>
                ) : sampleRequests?.length === 0 ? (
                  "No sample requests"
                ) : (
                  `${sampleRequests?.length} Sample Requests`
                )}
              </div>
              <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                <form
                  onSubmit={handleSampleSearch}
                  className="flex gap-2 w-full md:w-auto"
                >
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search sample requests with coffee variety, or farm name..."
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
                <FilterMenu
                  tab="sample"
                  handleFilterChange={handleFilterChange}
                  filters={filters}
                />
              </div>
            </div>

            <div className="space-y-5">
              {sampleLoading ? (
                <LoadingSkeleton />
              ) : sampleError ? (
                <Card className="p-6 text-center text-red-500">
                  {sampleError}
                </Card>
              ) : sampleRequests && sampleRequests.length > 0 ? (
                <>
                  {sampleRequests.map((item) => (
                    <SampleRequestItem
                      key={item.id}
                      item={item}
                      expandedOrderId={expandedOrderId ?? ""}
                      toggleOrderExpansion={toggleOrderExpansion}
                    />
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

          <TabsContent value="bids" className="mt-33 sm:mt-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 shadow-md bg-white p-2 rounded-md">
              <div className="text-sm text-muted-foreground font-medium">
                {bidLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
                    Loading...
                  </div>
                ) : bids?.length === 0 ? (
                  "No bids"
                ) : (
                  `${bids?.length} Bids`
                )}
              </div>
              <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                <form
                  onSubmit={handleBidSearch}
                  className="flex gap-2 w-full md:w-auto"
                >
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search bids with coffee variety, or farm name..."
                      value={bidSearchTerm}
                      onChange={(e) => setBidSearchTerm(e.target.value)}
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
                <FilterMenu
                  tab="bids"
                  handleFilterChange={handleFilterChange}
                  filters={filters}
                />
              </div>
            </div>

            <div className="space-y-5">
              {bidLoading ? (
                <LoadingSkeleton />
              ) : bidError ? (
                <Card className="p-6 text-center text-red-500">{bidError}</Card>
              ) : bids.length > 0 ? (
                <>
                  {bids.map((item) => (
                    <OrderItem
                      key={item.id}
                      item={item}
                      tabType="bids"
                      expandedOrderId={expandedOrderId ?? ""}
                      toggleOrderExpansion={toggleOrderExpansion}
                      openReviewModal={openReviewModal}
                      setModalMode={setModalMode}
                      setCurrentOrderId={setCurrentOrderId}
                      setUploadModalOpen={setUploadModalOpen}
                      setPreviewModalOpen={setPreviewModalOpen}
                      handlePreviewDocs={handlePreviewDocs}
                      setUpdateModalOpen={setUpdateModalOpen}
                    />
                  ))}
                  {bidPagination.totalPages > 1 && (
                    <Pagination className="mt-6">
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              if (bidCurrentPage > 1)
                                setBidCurrentPage(bidCurrentPage - 1);
                            }}
                            className={
                              bidCurrentPage <= 1
                                ? "pointer-events-none opacity-50"
                                : ""
                            }
                          />
                        </PaginationItem>
                        {Array.from(
                          { length: bidPagination.totalPages },
                          (_, i) => i + 1,
                        ).map((page) => (
                          <PaginationItem key={page}>
                            <PaginationLink
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                setBidCurrentPage(page);
                              }}
                              isActive={page === bidCurrentPage}
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
                              if (bidCurrentPage < bidPagination.totalPages)
                                setBidCurrentPage(bidCurrentPage + 1);
                            }}
                            className={
                              bidCurrentPage >= bidPagination.totalPages
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

          <TabsContent value="favorites" className="mt-33 sm:mt-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 shadow-md bg-white p-2 rounded-md">
              <div className="text-sm text-muted-foreground font-medium">
                {favoritesLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
                    Loading...
                  </div>
                ) : favorites?.length === 0 ? (
                  "No favorites"
                ) : (
                  `${favorites?.length} Favorites`
                )}
              </div>
              <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                <form
                  onSubmit={handleFavoritesSearch}
                  className="flex gap-2 w-full md:w-auto"
                >
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search favorites with coffee variety, farm name..."
                      value={favoritesSearchTerm}
                      onChange={(e) => setFavoritesSearchTerm(e.target.value)}
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
                <FilterMenu
                  tab="favorites"
                  handleFilterChange={handleFilterChange}
                  filters={filters}
                />
              </div>
            </div>

            <div className="space-y-5">
              {favoritesLoading ? (
                <LoadingSkeleton />
              ) : favoritesError ? (
                <Card className="p-6 text-center text-red-500">
                  {favoritesError}
                </Card>
              ) : favorites.length > 0 ? (
                <>
                  {favorites.map((item) => (
                    <FavoriteItem
                      key={item.id}
                      item={item}
                      expandedOrderId={expandedOrderId ?? ""}
                      toggleOrderExpansion={toggleOrderExpansion}
                    />
                  ))}
                  {favoritesPagination.totalPages > 1 && (
                    <Pagination className="mt-6">
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              if (favoritesCurrentPage > 1)
                                setFavoritesCurrentPage(
                                  favoritesCurrentPage - 1,
                                );
                            }}
                            className={
                              favoritesCurrentPage <= 1
                                ? "pointer-events-none opacity-50"
                                : ""
                            }
                          />
                        </PaginationItem>
                        {Array.from(
                          { length: favoritesPagination.totalPages },
                          (_, i) => i + 1,
                        ).map((page) => (
                          <PaginationItem key={page}>
                            <PaginationLink
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                setFavoritesCurrentPage(page);
                              }}
                              isActive={page === favoritesCurrentPage}
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
                                favoritesCurrentPage <
                                favoritesPagination.totalPages
                              )
                                setFavoritesCurrentPage(
                                  favoritesCurrentPage + 1,
                                );
                            }}
                            className={
                              favoritesCurrentPage >=
                              favoritesPagination.totalPages
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
                <EmptyState tabType="favorites" />
              )}
            </div>
          </TabsContent>
        </Tabs>

        {showReviewModal && selectedOrder && (
          <ReviewModal
            viewData={selectedOrder.reviews[0]}
            type={reviewType ?? "add"}
            orderId={selectedOrder.id}
            sellerId={selectedOrder.seller_id}
            onClose={() => {
              setShowReviewModal(false);
              setSelectedOrder(null);
              fetchActiveOrders();
            }}
          />
        )}

        {currentOrderId && (
          <>
            <FileUploadModal
              isOpen={uploadModalOpen}
              onClose={handleUploadModalClose}
              orderId={currentOrderId}
              mode={modalMode}
              onUploadSuccess={() =>
                handleUploadSuccess(modalMode, currentOrderId)
              }
            />
            <FileUpdateModal
              isOpen={updateModalOpen}
              onClose={handleUpdateModalClose}
              orderId={currentOrderId}
              mode={modalMode}
              onUploadSuccess={() =>
                handleUpdateModalSuccess(modalMode, currentOrderId)
              }
            />
            <FilePreviewModal
              isOpen={previewModalOpen}
              onClose={handlePreviewModalClose}
              orderId={currentOrderId}
              mode={modalMode}
            />
          </>
        )}
      </main>
    </div>
  );
}
