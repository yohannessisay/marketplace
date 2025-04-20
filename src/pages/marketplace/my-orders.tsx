"use client";

import type React from "react";
import { useState, useEffect } from "react";
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
  Heart,
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
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/layout/header";
import { useNotification } from "@/hooks/useNotification";
import { APIErrorResponse } from "@/types/api";

interface Seller {
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
  seller?: Seller;
}

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

interface Favorite {
  id: string;
  listing_id: string;
  seller: any;
  buyer_id: string;
  created_at: string;
  listing: Listing;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export default function OrdersPage() {
  const { user } = useAuth();
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
    total: 0,
    total_pages: 0,
  });
  const [historyPagination, setHistoryPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    total: 0,
    total_pages: 0,
  });
  const [samplePagination, setSamplePagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    total: 0,
    total_pages: 0,
  });
  const [bidPagination, setBidPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    total: 0,
    total_pages: 0,
  });
  const [favoritesPagination, setFavoritesPagination] =
    useState<PaginationData>({
      page: 1,
      limit: 10,
      total: 0,
      total_pages: 0,
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

  const { successMessage, errorMessage } = useNotification();

  useEffect(() => {
    const fetchActiveOrders = async () => {
      setActiveLoading(true);
      try {
        const response: any = await apiService().get(
          `/orders/active-orders?page=${activeCurrentPage}&limit=${
            activePagination.limit
          }&search=${encodeURIComponent(activeSearchTerm)}`,
        );
        if (response.success) {
          setActiveOrders(response.data.orders || []);
          setActivePagination(
            response.data.pagination || {
              page: 1,
              limit: 10,
              total: 0,
              total_pages: 0,
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
    };

    if (activeTab === "current" && !fetchedTabs.current) {
      fetchActiveOrders();
    }
  }, [activeCurrentPage, activeSearchTerm, activeTab, fetchedTabs.current]);

  useEffect(() => {
    const fetchHistoricalOrders = async () => {
      setHistoryLoading(true);
      try {
        const response: any = await apiService().get(
          `/orders/order-history?page=${historyCurrentPage}&limit=${
            historyPagination.limit
          }&search=${encodeURIComponent(historySearchTerm)}`,
        );
        if (response.success) {
          setHistoricalOrders(response.data.orders || []);
          setHistoryPagination(
            response.data.pagination || {
              page: 1,
              limit: 10,
              total: 0,
              total_pages: 0,
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
    };

    if (activeTab === "historical" && !fetchedTabs.historical) {
      fetchHistoricalOrders();
    }
  }, [
    historyCurrentPage,
    historySearchTerm,
    activeTab,
    fetchedTabs.historical,
  ]);

  useEffect(() => {
    const fetchSampleRequests = async () => {
      setSampleLoading(true);
      try {
        const response: any = await apiService().get(
          `/buyers/samples/get-sample-requests?page=${sampleCurrentPage}&limit=${
            samplePagination.limit
          }&search=${encodeURIComponent(sampleSearchTerm)}`,
        );
        if (response.success && response.data) {
          setSampleRequests(response.data.sample_requests || null);
          setSamplePagination({
            page: response.data.pagination.page,
            limit: response.data.pagination.limit,
            total: response.data.pagination.total,
            total_pages: response.data.pagination.total_pages,
          });
          setFetchedTabs((prev) => ({ ...prev, sample: true }));
        } else {
          setSampleError("Failed to fetch sample requests");
          setSampleRequests(null);
        }
      } catch (err: unknown) {
        const errorResponse = err as APIErrorResponse;
        setSampleError(errorResponse.error?.message || "An error occurred");
        setSampleRequests(null);
        errorMessage(errorResponse);
      } finally {
        setSampleLoading(false);
      }
    };

    if (activeTab === "sample" && !fetchedTabs.sample) {
      fetchSampleRequests();
    }
  }, [sampleCurrentPage, sampleSearchTerm, activeTab, fetchedTabs.sample]);

  useEffect(() => {
    const fetchBids = async () => {
      if (!user?.id) {
        setBidError("User not authenticated");
        setBidLoading(false);
        return;
      }

      setBidLoading(true);
      try {
        const response: any = await apiService().get(
          `/buyers/bids/get-all-bids?page=${bidCurrentPage}&limit=${
            bidPagination.limit
          }&search=${encodeURIComponent(bidSearchTerm)}`,
        );
        if (response.success) {
          setBids(response.data.bids || []);
          setBidPagination(
            response.data.pagination || {
              page: 1,
              limit: 10,
              total: 0,
              total_pages: 0,
            },
          );
          setFetchedTabs((prev) => ({ ...prev, bids: true }));
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

    if (activeTab === "bids" && !fetchedTabs.bids) {
      fetchBids();
    }
  }, [bidCurrentPage, bidSearchTerm, activeTab, fetchedTabs.bids, user?.id]);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user?.id) {
        setFavoritesError("User not authenticated");
        setFavoritesLoading(false);
        return;
      }

      setFavoritesLoading(true);
      try {
        const response: any = await apiService().get(
          `/buyers/listings/favorites/get-favorite-listings?page=${favoritesCurrentPage}&limit=${
            favoritesPagination.limit
          }&search=${encodeURIComponent(favoritesSearchTerm)}`,
        );
        if (response.success) {
          setFavorites(response.data.favorites || []);
          setFavoritesPagination(
            response.data.pagination || {
              page: 1,
              limit: 10,
              total: 0,
              total_pages: 0,
            },
          );
          setFetchedTabs((prev) => ({ ...prev, favorites: true }));
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

    if (activeTab === "favorites" && !fetchedTabs.favorites) {
      fetchFavorites();
    }
  }, [
    favoritesCurrentPage,
    favoritesSearchTerm,
    activeTab,
    fetchedTabs.favorites,
    user?.id,
  ]);

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
    setFetchedTabs((prev) => ({ ...prev, current: false }));
  };

  const handleHistorySearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHistoryCurrentPage(1);
    setFetchedTabs((prev) => ({ ...prev, historical: false }));
  };

  const handleSampleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSampleCurrentPage(1);
    setFetchedTabs((prev) => ({ ...prev, sample: false }));
  };

  const handleBidSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setBidCurrentPage(1);
    setFetchedTabs((prev) => ({ ...prev, bids: false }));
  };

  const handleFavoritesSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFavoritesCurrentPage(1);
    setFetchedTabs((prev) => ({ ...prev, favorites: false }));
  };

  const deleteOrder = async (orderId: string) => {
    if (!orderId) {
      errorMessage({
        success: false,
        error: {
          message: "Invalid order ID",
          details: "No order ID provided",
          code: 400,
        },
      });
      return;
    }

    try {
      await apiService().post(`/orders/cancel-order?orderId=${orderId}`, {});
      setActiveOrders((prev) => prev.filter((order) => order.id !== orderId));
      setActivePagination((prev) => {
        const newTotalItems = Math.max(0, prev.total - 1);
        const newTotalPages = Math.ceil(newTotalItems / prev.limit);
        return {
          ...prev,
          total: newTotalItems,
          total_pages: newTotalPages,
          page:
            activeCurrentPage > newTotalPages && newTotalPages > 0
              ? newTotalPages
              : prev.page,
        };
      });
      if (expandedOrderId === orderId) {
        setExpandedOrderId(null);
      }
      successMessage("Order cancelled successfully");
    } catch (error: unknown) {
      const errorResponse = error as APIErrorResponse;
      errorMessage(errorResponse);
    }
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

  const SampleRequestItem = ({ item }: { item: SampleRequest }) => {
    const isExpanded = expandedOrderId === item.id;

    return (
      <Card className="mb-4 overflow-hidden transition-all duration-200 hover:shadow-md">
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
              <MapPin className="h-4 w-4 mr-1" />
              <span>{item.delivery_address || "Unknown Address"}</span>
            </div>
          </div>

          <Separator className="my-3" />
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <User className="h-4 w-4 mr-1 text-muted-foreground" />
              <span className="text-sm font-medium">
                {item.seller?.first_name || "Unknown"}{" "}
                {item.seller?.last_name || ""}
              </span>
              {item.seller && (
                <Link
                  to={`/sellers/${item.seller.id}`}
                  className="ml-2 text-xs text-green-600 hover:text-green-700 font-medium"
                >
                  View Seller
                </Link>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  item.delivery_status === "delivered"
                    ? "secondary"
                    : item.delivery_status === "inprogress"
                      ? "default"
                      : item.delivery_status === "pending"
                        ? "warning"
                        : "destructive"
                }
              >
                {item.delivery_status.charAt(0).toUpperCase() +
                  item.delivery_status.slice(1)}
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
                        {item.coffee_listing?.coffee_variety || "N/A"}
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
                    Seller & Delivery
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Seller:</span>
                      <span className="font-medium">
                        {item.seller?.first_name || "N/A"}{" "}
                        {item.seller?.last_name || ""}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Email:</span>
                      <span className="font-medium">
                        {item.seller?.email || "N/A"}
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
                <Link to={`/listing/${item.coffee_listing.id}`}>
                  <Button variant="outline">View Listing</Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const FavoriteItem = ({ item }: { item: Favorite }) => {
    const isExpanded = expandedOrderId === item.id;

    return (
      <Card className="mb-4 overflow-hidden transition-all duration-200 hover:shadow-md">
        <CardContent className="p-5">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <h3 className="font-bold text-lg">
                  {item.listing?.coffee_variety || "Unknown Coffee"}
                </h3>
                {item.listing?.is_organic && (
                  <Badge
                    variant="outline"
                    className="ml-2 bg-green-500 text-white border-0"
                  >
                    Organic
                  </Badge>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                {item.listing?.farm?.farm_name || "Unknown Farm"}
                {item.listing?.farm?.region
                  ? `, ${item.listing.farm.region}`
                  : ""}
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-lg text-green-600">
                ${item.listing?.price_per_kg?.toFixed(2) || "N/A"}/kg
              </div>
              <div className="text-sm text-muted-foreground">
                {item.listing?.quantity_kg?.toLocaleString() || "0"} kg
                available
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center mt-2 text-sm text-muted-foreground gap-3">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              <span>
                Favorited: {new Date(item.created_at).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center">
              <Coffee className="h-4 w-4 mr-1" />
              <span>{item.listing?.bean_type || "Unknown"}</span>
            </div>
          </div>

          <Separator className="my-3" />
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <User className="h-4 w-4 mr-1 text-muted-foreground" />
              <span className="text-sm font-medium">
                {item.listing.seller?.first_name || "Unknown"}{" "}
                {item.listing.seller?.last_name || ""}
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

          {isExpanded && (
            <div className="mt-4 pt-4 border-t animate-in fade-in-50 duration-300">
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="text-sm font-semibold mb-2">
                    Listing Details
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Listing ID:</span>
                      <span className="font-medium">{item.listing_id}</span>
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
                      <span className="text-muted-foreground">
                        Processing Method:
                      </span>
                      <span className="font-medium">
                        {item.listing?.processing_method || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Cup Score:</span>
                      <span className="font-medium">
                        {item.listing?.cup_score || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-2">Farm Details</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Farm:</span>
                      <span className="font-medium">
                        {item.listing?.farm?.farm_name || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Region:</span>
                      <span className="font-medium">
                        {item.listing?.farm?.region || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Country:</span>
                      <span className="font-medium">
                        {item.listing?.farm?.country || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex justify-end space-x-3">
                <Link to={`/listing/${item.listing_id}`}>
                  <Button variant="outline">View Listing</Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const OrderItem = ({
    item,
    tabType,
  }: {
    item: Order | Bid;
    tabType: string;
  }) => {
    const isOrderTab = tabType === "current" || tabType === "historical";
    const isBid = tabType === "bids";
    const isExpanded = expandedOrderId === item.id;

    const listing: Listing | undefined = isBid
      ? (item as Bid).listing
      : (item as Order).listing;

    return (
      <Card className="mb-4 overflow-hidden transition-all duration-200 hover:shadow-md">
        <CardContent className="p-5">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <h3 className="font-bold text-lg">
                  {isBid
                    ? listing?.coffee_variety || "Unknown Coffee"
                    : (item as Order).order_id || "Unknown Order"}
                </h3>
                {(listing?.is_organic ||
                  (item as Order).listing?.is_organic) && (
                  <Badge
                    variant="outline"
                    className="ml-2 bg-green-500 text-white border-0"
                  >
                    Organic
                  </Badge>
                )}
              </div>
              {isBid && (
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
                  : (item as Bid).unit_price?.toFixed(2)}
                /kg
              </div>
              <div className="text-sm text-muted-foreground">
                {isOrderTab
                  ? `${(item as Order).quantity_kg.toLocaleString()} kg`
                  : `${(item as Bid).quantity_kg.toLocaleString()} kg`}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center mt-2 text-sm text-muted-foreground gap-3">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              <span>
                {isBid ? "Bid" : "Ordered"}:{" "}
                {new Date(
                  isBid ? (item as Bid).created_at : (item as Order).created_at,
                ).toLocaleDateString()}
              </span>
            </div>
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
                  (isBid ? (item as Bid).status : (item as Order).status) ===
                  "completed"
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
                  (isBid ? (item as Bid).status : (item as Order).status).slice(
                    1,
                  )}
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
                      onClick={() => deleteOrder(item.id)}
                      disabled={activeLoading}
                    >
                      Cancel Order
                    </Button>
                    <Link to={`/listing/${item.listing_id}`}>
                      <Button variant="outline">View Detail</Button>
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
          ? "No bids found. Check back later or browse the marketplace."
          : tabType === "favorites"
            ? "No favorited listings found. Browse the marketplace to add your favorite coffees."
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
                  : tabType === "bids"
                    ? "bids"
                    : "favorited listings"}{" "}
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

  // Skeleton Loader for Sample Requests and Favorites
  const SampleSkeleton = () => (
    <div className="space-y-5 animate-pulse">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="mb-4">
          <CardContent className="p-5">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
              <div className="text-right">
                <div className="h-6 bg-gray-200 rounded w-16"></div>
                <div className="h-4 bg-gray-200 rounded w-24 mt-1"></div>
              </div>
            </div>
            <div className="flex flex-wrap items-center mt-2 gap-3">
              <div className="h-4 bg-gray-200 rounded w-32"></div>
              <div className="h-4 bg-gray-200 rounded w-32"></div>
            </div>
            <Separator className="my-3" />
            <div className="flex items-center justify-between">
              <div className="h-4 bg-gray-200 rounded w-40"></div>
              <div className="flex items-center gap-2">
                <div className="h-6 bg-gray-200 rounded w-16"></div>
                <div className="h-6 bg-gray-200 rounded w-6"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

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
          <TabsList className="grid w-full grid-cols-5">
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
            <TabsTrigger
              value="favorites"
              className="flex items-center justify-center h-12"
            >
              <Heart className="h-4 w-4 mr-2" />
              Favorites
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
                <SampleSkeleton />
              ) : activeError ? (
                <Card className="p-6 text-center text-red-500">
                  {activeError}
                </Card>
              ) : activeOrders.length > 0 ? (
                <>
                  {activeOrders.map((item) => (
                    <OrderItem key={item.id} item={item} tabType="current" />
                  ))}
                  {activePagination.total_pages > 1 && (
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
                          { length: activePagination.total_pages },
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
                                activeCurrentPage < activePagination.total_pages
                              )
                                setActiveCurrentPage(activeCurrentPage + 1);
                            }}
                            className={
                              activeCurrentPage >= activePagination.total_pages
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
                <SampleSkeleton />
              ) : historyError ? (
                <Card className="p-6 text-center text-red-500">
                  {historyError}
                </Card>
              ) : historicalOrders.length > 0 ? (
                <>
                  {historicalOrders.map((item) => (
                    <OrderItem key={item.id} item={item} tabType="historical" />
                  ))}
                  {historyPagination.total_pages > 1 && (
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
                          { length: historyPagination.total_pages },
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
                                historyPagination.total_pages
                              )
                                setHistoryCurrentPage(historyCurrentPage + 1);
                            }}
                            className={
                              historyCurrentPage >=
                              historyPagination.total_pages
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
                  : sampleRequests && sampleRequests.length > 0
                    ? `${sampleRequests.length} Sample Requests`
                    : "No Sample Requests"}
              </p>
              <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                <form
                  onSubmit={handleSampleSearch}
                  className="flex gap-2 w-full md:w-auto"
                >
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search sample requests..."
                      value={sampleSearchTerm}
                      onChange={(e) => setSampleSearchTerm(e.target.value)}
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
              {sampleLoading ? (
                <SampleSkeleton />
              ) : sampleError ? (
                <Card className="p-6 text-center text-red-500">
                  {sampleError}
                </Card>
              ) : sampleRequests && sampleRequests.length > 0 ? (
                <>
                  {sampleRequests.map((item) => (
                    <SampleRequestItem key={item.id} item={item} />
                  ))}
                  {samplePagination.total_pages > 1 && (
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
                          { length: samplePagination.total_pages },
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
                                sampleCurrentPage < samplePagination.total_pages
                              )
                                setSampleCurrentPage(sampleCurrentPage + 1);
                            }}
                            className={
                              sampleCurrentPage >= samplePagination.total_pages
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
                {bidLoading ? "Loading..." : `${bids.length} Bids`}
              </p>
              <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                <form
                  onSubmit={handleBidSearch}
                  className="flex gap-2 w-full md:w-auto"
                >
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search bids..."
                      value={bidSearchTerm}
                      onChange={(e) => setBidSearchTerm(e.target.value)}
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
              {bidLoading ? (
                <SampleSkeleton />
              ) : bidError ? (
                <Card className="p-6 text-center text-red-500">{bidError}</Card>
              ) : bids.length > 0 ? (
                <>
                  {bids.map((item) => (
                    <OrderItem key={item.id} item={item} tabType="bids" />
                  ))}
                  {bidPagination.total_pages > 1 && (
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
                          { length: bidPagination.total_pages },
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
                              if (bidCurrentPage < bidPagination.total_pages)
                                setBidCurrentPage(bidCurrentPage + 1);
                            }}
                            className={
                              bidCurrentPage >= bidPagination.total_pages
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

          <TabsContent value="favorites" className="mt-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 shadow-md bg-white p-2 rounded-md">
              <p className="text-sm text-muted-foreground font-medium">
                {favoritesLoading
                  ? "Loading..."
                  : `${favorites.length} Favorited Listings`}
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
                <SampleSkeleton />
              ) : favoritesError ? (
                <Card className="p-6 text-center text-red-500">
                  {favoritesError}
                </Card>
              ) : favorites.length > 0 ? (
                <>
                  {favorites.map((item) => (
                    <FavoriteItem key={item.id} item={item} />
                  ))}
                  {favoritesPagination.total_pages > 1 && (
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
                          { length: favoritesPagination.total_pages },
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
                                favoritesPagination.total_pages
                              )
                                setFavoritesCurrentPage(
                                  favoritesCurrentPage + 1,
                                );
                            }}
                            className={
                              favoritesCurrentPage >=
                              favoritesPagination.total_pages
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
      </main>
    </div>
  );
}
