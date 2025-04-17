"use client";

import type React from "react";
import { useState, useEffect } from "react";
import {
  Calendar,
  Heart,
  ShoppingBag,
  Clock,
  Info,
  ChevronDown,
  Filter,
  User,
  ArrowRight,
  CheckCircle,
  Circle,
  AlertCircle,
  Search,
  Coffee,
  X,
  Hand,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
import { Link } from "react-router-dom";
import Header from "@/components/layout/header";
import { LoadingState } from "@/components/common/loading";
import { useNotification } from "@/hooks/useNotification";
import { APIErrorResponse } from "@/types/api";
import { ReviewModal } from "./review-modal";
import {
  CancelFormData,
  CancelModalData,
  CancelOrderModal,
} from "@/components/modals/CancelOrderModal";

interface Seller {
  first_name?: string;
  last_name?: string;
}

interface Farm {
  id: string;
  farm_name: string;
  region: string | null;
}

interface Listing {
  id: string;
  coffee_variety: string;
  bean_type: string | null;
  is_organic: boolean;
  processing_method: string | null;
  quantity_kg: number;
  price_per_kg: number;
  farm: Farm | null;
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
  seller?: Seller;
}

interface Bid {
  id: string;
  buyer_id: string;
  seller_id: string;
  listing_id: string;
  quantity_kg: number;
  unit_price: number;
  total_amount: number;
  status: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
  listing?: Listing;
  seller?: Seller;
}

interface PaginationData {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

interface Favorite {
  id: string;
  listing_id: string;
  created_at: string;
  updated_at: string | null;
  listing?: Listing;
}

export default function MyOrdersPage() {
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [historicalOrders, setHistoricalOrders] = useState<Order[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [bids, setBids] = useState<Bid[]>([]);
  const [favoritesPagination, setFavoritesPagination] =
    useState<PaginationData>({
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
  const [favoritesCurrentPage, setFavoritesCurrentPage] = useState<number>(1);
  const [bidsCurrentPage, setBidsCurrentPage] = useState<number>(1);
  const [favoritesLoading, setFavoritesLoading] = useState<boolean>(true);
  const [bidsLoading, setBidsLoading] = useState<boolean>(true);
  const [favoritesError, setFavoritesError] = useState<string | null>(null);
  const [bidsError, setBidsError] = useState<string | null>(null);
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
  const [activeLoading, setActiveLoading] = useState<boolean>(true);
  const [historyLoading, setHistoryLoading] = useState<boolean>(true);
  const [activeError, setActiveError] = useState<string | null>(null);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [activeCurrentPage, setActiveCurrentPage] = useState<number>(1);
  const [historyCurrentPage, setHistoryCurrentPage] = useState<number>(1);
  const [activeSearchTerm, setActiveSearchTerm] = useState<string>("");
  const [historySearchTerm, setHistorySearchTerm] = useState<string>("");
  const [favoritesSearchTerm, setFavoritesSearchTerm] = useState<string>("");
  const [bidsSearchTerm, setBidsSearchTerm] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("current");
  const [reviewModalData, setReviewModalData] = useState<{
    orderId: string;
    sellerId: string | undefined;
  } | null>(null);
  const [cancelModalData, setCancelModalData] =
    useState<CancelModalData | null>(null);
  const [favoriteLoading, setFavoriteLoading] = useState<{
    [listingId: string]: boolean;
  }>({});
  const [favoriteState, setFavoriteState] = useState<{
    [listingId: string]: boolean;
  }>({});
  const [hasFetched, setHasFetched] = useState<{
    active: boolean;
    historical: boolean;
    favorites: boolean;
    bids: boolean;
  }>({ active: false, historical: false, favorites: false, bids: false });

  const { successMessage, errorMessage } = useNotification();

  // Initial data fetch
  useEffect(() => {
    const fetchInitialData = async () => {
      // Fetch active orders
      setActiveLoading(true);
      try {
        const activeResponse: any = await apiService().get(
          `/orders/active-orders?page=1&limit=${activePagination.limit}`,
        );
        if (activeResponse.success) {
          setActiveOrders(activeResponse.data.orders);
          setActivePagination(activeResponse.data.pagination);
          setHasFetched((prev) => ({ ...prev, active: true }));
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

      // Fetch historical orders
      setHistoryLoading(true);
      try {
        const historyResponse: any = await apiService().get(
          `/orders/order-history?page=1&limit=${historyPagination.limit}`,
        );
        if (historyResponse.success) {
          setHistoricalOrders(historyResponse.data.orders);
          setHistoryPagination(historyResponse.data.pagination);
          setHasFetched((prev) => ({ ...prev, historical: true }));
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

      // Fetch favorites
      setFavoritesLoading(true);
      try {
        const favoritesResponse: any = await apiService().get(
          `/buyers/listings/favorites/get-favorite-listings?page=1&limit=${favoritesPagination.limit}`,
        );
        if (favoritesResponse.success) {
          const fetchedFavorites: Favorite[] = favoritesResponse.data.favorites;
          setFavorites(fetchedFavorites);
          setFavoritesPagination(
            favoritesResponse.data.pagination || {
              page: 1,
              limit: 10,
              totalItems: fetchedFavorites.length,
              totalPages: Math.ceil(fetchedFavorites.length / 10),
            },
          );
          const loadingState: { [listingId: string]: boolean } = {};
          const favoriteStateUpdate: { [listingId: string]: boolean } = {};
          fetchedFavorites.forEach((favorite) => {
            loadingState[favorite.listing_id] = false;
            favoriteStateUpdate[favorite.listing_id] = true;
          });
          setFavoriteLoading(loadingState);
          setFavoriteState(favoriteStateUpdate);
          setHasFetched((prev) => ({ ...prev, favorites: true }));
        } else {
          setFavoritesError("Failed to fetch favorites");
        }
      } catch (err: unknown) {
        const errorResponse = err as APIErrorResponse;
        setFavoritesError(errorResponse.error?.message || "An error occurred");
        errorMessage(errorResponse);
      } finally {
        setFavoritesLoading(false);
      }

      // Fetch bids
      setBidsLoading(true);
      try {
        const bidsResponse: any = await apiService().get(
          `/buyers/bids/get-all-bids?page=1&limit=${bidsPagination.limit}`,
        );
        if (bidsResponse.success) {
          setBids(bidsResponse.data.bids);
          setBidsPagination(bidsResponse.data.pagination);
          setHasFetched((prev) => ({ ...prev, bids: true }));
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
    };

    fetchInitialData();
  }, []);

  // Fetch active orders on search or pagination change
  useEffect(() => {
    if (!hasFetched.active) return;
    const fetchActiveOrders = async () => {
      setActiveLoading(true);
      try {
        const response: any = await apiService().get(
          `/orders/active-orders?page=${activeCurrentPage}&limit=${activePagination.limit}&search=${encodeURIComponent(activeSearchTerm)}`,
        );
        if (response.success) {
          setActiveOrders(response.data.orders);
          setActivePagination(response.data.pagination);
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

  // Fetch historical orders on search or pagination change
  useEffect(() => {
    if (!hasFetched.historical) return;
    const fetchHistoricalOrders = async () => {
      setHistoryLoading(true);
      try {
        const response: any = await apiService().get(
          `/orders/order-history?page=${historyCurrentPage}&limit=${historyPagination.limit}&search=${encodeURIComponent(historySearchTerm)}`,
        );
        if (response.success) {
          setHistoricalOrders(response.data.orders);
          setHistoryPagination(response.data.pagination);
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
    };

    fetchHistoricalOrders();
  }, [historyCurrentPage, historySearchTerm]);

  // Fetch favorites on search or pagination change
  useEffect(() => {
    if (!hasFetched.favorites) return;
    const fetchFavorites = async () => {
      setFavoritesLoading(true);
      try {
        const response: any = await apiService().get(
          `/buyers/listings/favorites/get-favorite-listings?page=${favoritesCurrentPage}&limit=${favoritesPagination.limit}&search=${encodeURIComponent(favoritesSearchTerm)}`,
        );
        if (response.success) {
          const fetchedFavorites: Favorite[] = response.data.favorites;
          setFavorites(fetchedFavorites);
          setFavoritesPagination(
            response.data.pagination || {
              page: 1,
              limit: 10,
              totalItems: fetchedFavorites.length,
              totalPages: Math.ceil(fetchedFavorites.length / 10),
            },
          );
          const loadingState: { [listingId: string]: boolean } = {};
          const favoriteStateUpdate: { [listingId: string]: boolean } = {};
          fetchedFavorites.forEach((favorite) => {
            loadingState[favorite.listing_id] = false;
            favoriteStateUpdate[favorite.listing_id] = true;
          });
          setFavoriteLoading(loadingState);
          setFavoriteState(favoriteStateUpdate);
        } else {
          setFavoritesError("Failed to fetch favorites");
        }
      } catch (err: unknown) {
        const errorResponse = err as APIErrorResponse;
        setFavoritesError(errorResponse.error?.message || "An error occurred");
        errorMessage(errorResponse);
      } finally {
        setFavoritesLoading(false);
      }
    };

    fetchFavorites();
  }, [favoritesCurrentPage, favoritesSearchTerm]);

  // Fetch bids on search or pagination change
  useEffect(() => {
    if (!hasFetched.bids) return;
    const fetchBids = async () => {
      setBidsLoading(true);
      try {
        const response: any = await apiService().get(
          `/buyers/bids/get-all-bids?page=${bidsCurrentPage}&limit=${bidsPagination.limit}&search=${encodeURIComponent(bidsSearchTerm)}`,
        );
        if (response.success) {
          setBids(response.data.bids);
          setBidsPagination(response.data.pagination);
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
    };

    fetchBids();
  }, [bidsCurrentPage, bidsSearchTerm]);

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setExpandedOrderId(null);
  };

  const handleActiveSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveCurrentPage(1);
  };

  const handleHistorySearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHistoryCurrentPage(1);
  };

  const handleFavoritesSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFavoritesCurrentPage(1);
  };

  const handleBidsSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setBidsCurrentPage(1);
  };

  const removeFavorite = async (favoriteId: string, listingId?: string) => {
    if (!favoriteId) {
      errorMessage({
        success: false,
        error: {
          message: "Invalid favorite ID",
          details: "No favorite ID provided",
          code: 400,
        },
      });
      return;
    }

    setFavoriteLoading((prev) => ({
      ...prev,
      [listingId || favoriteId]: true,
    }));

    try {
      await apiService().post(
        `/buyers/listings/favorites/remove-favorite-listing?favoritesId=${favoriteId}`,
        {},
      );

      setFavorites((prev) =>
        prev.filter((favorite) => favorite.id !== favoriteId),
      );

      setFavoritesPagination((prev) => {
        const newTotalItems = Math.max(0, prev.totalItems - 1);
        const newTotalPages = Math.ceil(newTotalItems / prev.limit);
        return {
          ...prev,
          totalItems: newTotalItems,
          totalPages: newTotalPages,
          page:
            favoritesCurrentPage > newTotalPages && newTotalPages > 0
              ? newTotalPages
              : prev.page,
        };
      });

      if (listingId) {
        setFavoriteState((prev) => ({
          ...prev,
          [listingId]: false,
        }));
      }

      setFavoriteLoading((prev) => {
        const newLoading = { ...prev };
        if (listingId || favoriteId) {
          delete newLoading[listingId || favoriteId];
        }
        return newLoading;
      });

      successMessage("Removed from favorites");
    } catch (error: unknown) {
      const errorResponse = error as APIErrorResponse;
      errorMessage(errorResponse);
    } finally {
      setFavoriteLoading((prev) => ({
        ...prev,
        [listingId || favoriteId]: false,
      }));
    }
  };

  const openCancelModal = (orderId: string) => {
    setCancelModalData({ orderId });
  };

  const submitCancelRequest = async (
    orderId: string,
    formData: CancelFormData,
  ) => {
    try {
      await apiService().post(`/general/cancel-order-request`, {
        orderId,
        reason: formData.reason,
        contactEmail: formData.contactEmail,
      });

      successMessage("Order cancel request submitted successfully");
    } catch (error: unknown) {
      const errorResponse = error as APIErrorResponse;
      errorMessage(errorResponse);
    }
  };

  const openReviewModal = (orderId: string, sellerId: string | undefined) => {
    setReviewModalData({ orderId, sellerId });
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

  const OrderItem = ({
    item,
    tabType,
  }: {
    item: Order | Favorite | Bid;
    tabType: string;
  }) => {
    const isOrderTab = tabType === "current" || tabType === "historical";
    const isFavorite = tabType === "favorites";
    const isBid = tabType === "bids";
    const isExpanded = expandedOrderId === item.id;

    const listing: Listing | undefined = isFavorite
      ? (item as Favorite).listing
      : isBid
        ? (item as Bid).listing
        : (item as Order).listing;
    const listingId = listing?.id;
    const favoriteId = isFavorite ? item.id : undefined;

    return (
      <Card className="mb-4 overflow-hidden transition-all duration-200 hover:shadow-md">
        <CardContent className="p-5">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <h3 className="font-bold text-lg">
                  {isFavorite || isBid
                    ? listing?.coffee_variety || "Unknown Coffee"
                    : (item as Order).order_id || "Unknown Order"}
                </h3>
                {(listing?.is_organic ||
                  (item as Order).listing?.is_organic ||
                  (item as Bid).listing?.is_organic) && (
                  <Badge
                    variant="outline"
                    className="ml-2 bg-green-500 text-white border-0"
                  >
                    Organic
                  </Badge>
                )}
              </div>
              {(isFavorite || isBid) && (
                <div className="text-sm text-muted-foreground">
                  {listing?.farm?.farm_name || "Unknown Farm"}
                  {listing?.farm?.region ? `, ${listing.farm.region}` : ""}
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="font-bold text-lg text-green-600">
                $
                {isOrderTab
                  ? (item as Order).unit_price?.toFixed(2)
                  : isBid
                    ? (item as Bid).unit_price?.toFixed(2)
                    : listing?.price_per_kg?.toFixed(2) || "N/A"}
                /kg
              </div>
              <div className="text-sm text-muted-foreground">
                {isOrderTab
                  ? `${(item as Order).quantity_kg.toLocaleString()} kg`
                  : isBid
                    ? `${(item as Bid).quantity_kg.toLocaleString()} kg`
                    : `${listing?.quantity_kg?.toLocaleString() || "Unknown"} kg available`}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center mt-2 text-sm text-muted-foreground gap-3">
            {(isOrderTab || isBid) && (
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                <span>
                  {isBid ? "Bid" : "Ordered"}:{" "}
                  {new Date(
                    isBid
                      ? (item as Bid).created_at
                      : (item as Order).created_at,
                  ).toLocaleDateString()}
                </span>
              </div>
            )}
            {isBid && (
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span>
                  Expires:{" "}
                  {new Date((item as Bid).expires_at).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          {(isOrderTab || isBid) && (
            <>
              <Separator className="my-3" />
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-1 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {(isBid
                      ? (item as Bid).seller?.first_name
                      : (item as Order).seller?.first_name) || "Unknown"}{" "}
                    {(isBid
                      ? (item as Bid).seller?.last_name
                      : (item as Order).seller?.last_name) || ""}
                  </span>
                  {(isBid ? (item as Bid).seller : (item as Order).seller) && (
                    <Link
                      to={`/sellers/${(isBid
                        ? (item as Bid).seller!.first_name
                        : (item as Order).seller!.first_name
                      )?.toLowerCase()}-${(isBid
                        ? (item as Bid).seller!.last_name
                        : (item as Order).seller!.last_name
                      )?.toLowerCase()}`}
                      className="ml-2 text-xs text-green-600 hover:text-green-700 font-medium"
                    >
                      View Seller
                    </Link>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      (isBid
                        ? (item as Bid).status
                        : (item as Order).status) === "completed"
                        ? "secondary"
                        : (isBid
                              ? (item as Bid).status
                              : (item as Order).status) === "confirmed"
                          ? "default"
                          : (isBid
                                ? (item as Bid).status
                                : (item as Order).status) === "pending"
                            ? "warning"
                            : "outline"
                    }
                  >
                    {(isBid ? (item as Bid).status : (item as Order).status)
                      .charAt(0)
                      .toUpperCase() +
                      (isBid
                        ? (item as Bid).status
                        : (item as Order).status
                      ).slice(1)}
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
            </>
          )}

          {(isOrderTab || isBid) && isExpanded && (
            <div className="mt-4 pt-4 border-t animate-in fade-in-50 duration-300">
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="text-sm font-semibold mb-2">
                    {isBid ? "Bid Details" : "Order Details"}
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {isBid ? "Bid ID" : "Order ID"}:
                      </span>
                      <span className="font-medium">{item.id}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Unit Price:</span>
                      <span className="font-medium">
                        $
                        {(isBid
                          ? (item as Bid).unit_price
                          : (item as Order).unit_price
                        ).toFixed(2)}
                        /kg
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Quantity:</span>
                      <span className="font-medium">
                        {(isBid
                          ? (item as Bid).quantity_kg
                          : (item as Order).quantity_kg
                        ).toLocaleString()}{" "}
                        kg
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Total Amount:
                      </span>
                      <span className="font-bold text-green-600">
                        $
                        {(isBid
                          ? (item as Bid).total_amount
                          : (item as Order).total_amount
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {isOrderTab && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2">
                      Shipping Information
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Address:</span>
                        <span className="font-medium">
                          {(item as Order).ship_adrs || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Zip Code:</span>
                        <span className="font-medium">
                          {(item as Order).ship_zipcode || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Instructions:
                        </span>
                        <span className="font-medium">
                          {(item as Order).ship_instructions || "None"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {isOrderTab && renderOrderProgress(item as Order)}

              <div className="mt-4 flex justify-end space-x-3">
                {tabType === "current" && (
                  <>
                    <Button
                      variant="destructive"
                      onClick={() => openCancelModal((item as Order).order_id)}
                      disabled={activeLoading}
                    >
                      Cancel Order
                    </Button>
                    <Link to={`/listing/${item.listing_id}`}>
                      <Button variant="outline">Contact Seller</Button>
                    </Link>
                  </>
                )}
                {tabType === "historical" && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() =>
                        openReviewModal(item.id, (item as Order).seller_id)
                      }
                    >
                      Review Seller
                    </Button>
                    <Link to="/market-place">
                      <Button>
                        Order Again
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </Button>
                    </Link>
                  </>
                )}
                {isBid && (
                  <Link to={`/listing/${item.listing_id}`}>
                    <Button variant="outline">View Listing</Button>
                  </Link>
                )}
              </div>
            </div>
          )}

          {isFavorite && (
            <div className="mt-4 flex justify-end space-x-3">
              <Button
                variant="outline"
                disabled={favoriteLoading[favoriteId || listingId || ""]}
                onClick={() => removeFavorite(favoriteId!, listingId)}
              >
                {favoriteLoading[favoriteId || listingId || ""]
                  ? "Removing..."
                  : "Remove from Favorites"}
              </Button>
              <Link to={`/listing/${listingId}`}>
                <Button>
                  View Listing Details
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
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
                : tabType === "favorites"
                  ? "favorites"
                  : "bids"}{" "}
            found
          </h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-md">
            {tabType === "favorites"
              ? "Browse the marketplace to find and save your favorite coffee offerings."
              : tabType === "bids"
                ? "Browse the marketplace to place bids on coffee listings."
                : "Head to the marketplace to place your first order of premium Ethiopian coffee."}
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

  return (
    <div className="min-h-screen bg-primary/5 p-8">
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
              value="favorites"
              className="flex items-center justify-center h-12"
            >
              <Heart className="h-4 w-4 mr-2" />
              Favorites
            </TabsTrigger>
            <TabsTrigger
              value="bids"
              className="flex items-center justify-center h-12"
            >
              <Hand className="h-4 w-4 mr-2" />
              Bids you made
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
                      placeholder="Search orders..."
                      value={activeSearchTerm}
                      onChange={(e) => setActiveSearchTerm(e.target.value)}
                      className="pl-8"
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
                <Button variant="outline" size="sm" className="h-10">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>

            <div className="space-y-5">
              {activeLoading ? (
                <LoadingState />
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
                      placeholder="Search history..."
                      value={historySearchTerm}
                      onChange={(e) => setHistorySearchTerm(e.target.value)}
                      className="pl-8"
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
                <Button variant="outline" size="sm" className="h-10">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>

            <div className="space-y-5">
              {historyLoading ? (
                <LoadingState />
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

          <TabsContent value="favorites" className="mt-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 shadow-md bg-white p-2 rounded-md">
              <p className="text-sm text-muted-foreground font-medium">
                {favoritesLoading
                  ? "Loading..."
                  : `${favorites.length} Favorited Items`}
              </p>
              <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                <form
                  onSubmit={handleFavoritesSearch}
                  className="flex gap-2 w-full md:w-auto"
                >
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search favorites..."
                      value={favoritesSearchTerm}
                      onChange={(e) => setFavoritesSearchTerm(e.target.value)}
                      className="pl-8"
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
                <Button variant="outline" size="sm" className="h-10">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>

            <div className="space-y-5">
              {favoritesLoading ? (
                <LoadingState />
              ) : favoritesError ? (
                <Card className="p-6 text-center text-red-500">
                  {favoritesError}
                </Card>
              ) : favorites.length > 0 ? (
                <>
                  {favorites.map((item) => (
                    <OrderItem key={item.id} item={item} tabType="favorites" />
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
                      placeholder="Search bids..."
                      value={bidsSearchTerm}
                      onChange={(e) => setBidsSearchTerm(e.target.value)}
                      className="pl-8"
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
                <Button variant="outline" size="sm" className="h-10">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>

            <div className="space-y-5">
              {bidsLoading ? (
                <LoadingState />
              ) : bidsError ? (
                <Card className="p-6 text-center text-red-500">
                  {bidsError}
                </Card>
              ) : bids.length > 0 ? (
                <>
                  {bids.map((item) => (
                    <OrderItem key={item.id} item={item} tabType="bids" />
                  ))}
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

        {reviewModalData && (
          <ReviewModal
            orderId={reviewModalData.orderId}
            sellerId={reviewModalData.sellerId}
            onClose={() => setReviewModalData(null)}
          />
        )}

        {cancelModalData && (
          <CancelOrderModal
            orderId={cancelModalData.orderId}
            onClose={() => setCancelModalData(null)}
            onSubmit={submitCancelRequest}
          />
        )}
      </main>
    </div>
  );
}
