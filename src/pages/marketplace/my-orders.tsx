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
  Map,
  Droplet,
  Coffee,
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

// Types for API response
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
  cup_score?: string;
  is_organic?: boolean;
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
  // Additional fields we might get from the API
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
  updated_at: string;
  listing: {
    id: string;
    coffee_variety: string;
    bean_type: string;
    crop_year: string;
    is_organic: boolean;
    processing_method: string;
    price_per_kg: number;
    quantity_kg: number;
    grade: string;
    farm: {
      farm_name: string;
      town_location: string;
      region: string;
      country: string;
    } | null;
    seller: {
      id: string;
      first_name: string;
      last_name: string;
      email: string;
      address: string;
      rating: number;
      total_reviews: number;
      deals_completed: number;
    } | null;
    photos: {
      id: string;
      photo_url: string;
      is_primary: boolean;
      created_at: string;
    }[];
  } | null;
}

export default function MyOrdersPage() {
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [historicalOrders, setHistoricalOrders] = useState<Order[]>([]);
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
  const [favoritesPagination, setFavoritesPagination] =
    useState<PaginationData>({
      page: 1,
      limit: 10,
      totalItems: 0,
      totalPages: 0,
    });
  const [activeLoading, setActiveLoading] = useState<boolean>(true);
  const [historyLoading, setHistoryLoading] = useState<boolean>(true);
  const [favoritesLoading, setFavoritesLoading] = useState<boolean>(true);
  const [activeError, setActiveError] = useState<string | null>(null);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [favoritesError, setFavoritesError] = useState<string | null>(null);
  const [activeCurrentPage, setActiveCurrentPage] = useState<number>(1);
  const [historyCurrentPage, setHistoryCurrentPage] = useState<number>(1);
  const [favoritesCurrentPage, setFavoritesCurrentPage] = useState<number>(1);
  const [activeSearchTerm, setActiveSearchTerm] = useState<string>("");
  const [historySearchTerm, setHistorySearchTerm] = useState<string>("");
  const [favoritesSearchTerm, setFavoritesSearchTerm] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("current");

  // Fetch active orders from API
  useEffect(() => {
    const fetchActiveOrders = async () => {
      setActiveLoading(true);
      try {
        const response: any = await apiService().get(`/orders/active-orders`);

        if (response.success) {
          setActiveOrders(response.data.orders);
          setActivePagination(response.data.pagination);
        } else {
          setActiveError("Failed to fetch active orders");
        }
      } catch (err: any) {
        setHistoryError(err.data.error.message);
      } finally {
        setActiveLoading(false);
      }
    };

    if (activeTab === "current") {
      fetchActiveOrders();
    }
  }, [activeCurrentPage, activeSearchTerm, activeTab]);

  // Fetch historical orders from API
  useEffect(() => {
    const fetchHistoricalOrders = async () => {
      setHistoryLoading(true);
      try {
        const response: any = await apiService().get(`/orders/order-history`);

        if (response.success) {
          setHistoricalOrders(response.data.orders);
          setHistoryPagination(response.data.pagination);
        } else {
          setHistoryError("Failed to fetch order history");
        }
      } catch (err: any) {
        setHistoryError(err.data.error.message);
      } finally {
        setHistoryLoading(false);
      }
    };

    if (activeTab === "historical") {
      fetchHistoricalOrders();
    }
  }, [historyCurrentPage, historySearchTerm, activeTab]);

  // Fetch favorite listings from API
  useEffect(() => {
    const fetchFavorites = async () => {
      setFavoritesLoading(true);
      try {
        const response: any = await apiService().get(
          `/buyers/listings/favorites/get-favorite-listings?search=${favoritesSearchTerm}&page=${favoritesCurrentPage}&limit=10`,
        );

        if (response.success) {
          setFavorites(response.data.favorites);
          setFavoritesPagination(response.data.pagination);
        } else {
          setFavoritesError("Failed to fetch favorite listings");
        }
      } catch (err: any) {
        setFavoritesError(err.data.error.message || "An error occurred");
      } finally {
        setFavoritesLoading(false);
      }
    };

    if (activeTab === "favorites") {
      fetchFavorites();
    }
  }, [favoritesCurrentPage, favoritesSearchTerm, activeTab]);

  // Toggle order expansion
  const toggleOrderExpansion = (orderId: string) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
    } else {
      setExpandedOrderId(orderId);
    }
  };

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  // Handle search for active orders
  const handleActiveSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveCurrentPage(1); // Reset to first page when searching
  };

  // Handle search for historical orders
  const handleHistorySearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHistoryCurrentPage(1); // Reset to first page when searching
  };

  // Handle search for favorites
  const handleFavoritesSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFavoritesCurrentPage(1); // Reset to first page when searching
  };

  // Get primary photo URL for a favorite listing
  // const getFavoritePrimaryPhotoUrl = (favorite: Favorite): string => {
  //   const primaryPhoto = favorite.listing?.photos.find((photo) => photo.is_primary);
  //   return primaryPhoto ? primaryPhoto.photo_url : "/placeholder.svg";
  // };

  // Render order status progress
  const renderOrderProgress = (order: Order) => {
    const steps = [
      { key: "order_placed", label: "Order Placed", completed: true }, // Order exists, so it's placed
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

    // Find the current step (first incomplete step)
    const currentStepIndex = steps.findIndex((step) => !step.completed);

    return (
      <Card className="mt-6">
        <CardContent className="pt-6">
          <h4 className="text-sm font-semibold mb-4">Order Progress</h4>
          <div className="space-y-4">
            {steps.map((step, index) => {
              // Determine the step status
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

  // Order item component
  const OrderItem = ({ item, tabType }: { item: any; tabType: string }) => {
    const isOrderTab = tabType === "current" || tabType === "historical";
    const isFavorite = tabType === "favorites";
    const isExpanded = expandedOrderId === item.id;

    return (
      <Card className="mb-4 overflow-hidden transition-all duration-200 hover:shadow-md">
        <CardContent className="p-5">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <h3 className="font-bold text-lg">
                  {item.order_id || "Unknown Coffee"}
                </h3>
                {(item.listing?.is_organic || item.is_organic) && (
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
                $
                {isOrderTab
                  ? item.unit_price.toFixed(2)
                  : item.price_per_kg.toFixed(2)}
                /kg
              </div>
              <div className="text-sm text-muted-foreground">
                {isOrderTab
                  ? `${item.quantity_kg.toLocaleString()} kg`
                  : `${
                      item.quantity_available?.toLocaleString() || "Unknown"
                    } kg available`}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center mt-2 text-sm text-muted-foreground gap-3">
            {isOrderTab && (
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                <span>
                  Ordered: {new Date(item.created_at).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          {isOrderTab && (
            <>
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
                        ? "secondary"
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
            </>
          )}

          {/* Expandable section with order details */}
          {isOrderTab && isExpanded && (
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

              {/* Render order progress for current orders */}
              {tabType === "current" && renderOrderProgress(item)}

              <div className="mt-4 flex justify-end space-x-3">
                {tabType === "current" && (
                  <>
                    <Button variant="outline">Contact Seller</Button>
                    <Button>
                      View Details
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </>
                )}
                {tabType === "historical" && (
                  <>
                    <Button variant="outline">Review Order</Button>
                    <Button className="bg-green-600 hover:bg-green-700">
                      Order Again
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Actions for favorites */}
          {isFavorite && (
            <div className="mt-4 flex justify-end space-x-3">
              <Button variant="outline">Remove</Button>
              <Button className="bg-green-600 hover:bg-green-700">
                Place Order
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  // Empty state component
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
                : "favorites"}{" "}
            found
          </h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-md">
            {tabType === "favorites"
              ? "Browse the marketplace to find and save your favorite coffee offerings."
              : "Head to the marketplace to place your first order of premium Ethiopian coffee."}
          </p>
          <Button className="mt-6 bg-green-600 hover:bg-green-700">
            Browse Marketplace
          </Button>
        </CardContent>
      </Card>
    );
  };

  // Loading state component

  return (
    <div className="min-h-screen bg-primary/5 p-8">
      {/* Header */}
      <Header></Header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-6 max-w-5xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">My Orders</h1>
        </div>

        {/* Tabs */}
        <Tabs
          defaultValue="current"
          className="mb-6"
          onValueChange={handleTabChange}
        >
          <TabsList className="grid w-full grid-cols-3">
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
          </TabsList>

          <TabsContent value="current" className="mt-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 shadow-md bg-white p-2 rounded-md">
              <p className="text-sm text-muted-foreground font-medium">
                {activeLoading
                  ? "Loading..."
                  : `${activeOrders.length} Active Orders`}
              </p>

              <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto ">
                <form
                  onSubmit={handleActiveSearch}
                  className="flex gap-2 w-full md:w-auto "
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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
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
                  {favorites.map((favorite) => (
                    <Card key={favorite.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-semibold text-slate-800">
                            {favorite.listing?.coffee_variety ||
                              "Unknown Variety"}
                          </h3>
                          <div className="text-emerald-700 font-bold">
                            ${favorite.listing?.price_per_kg.toFixed(2)}/kg
                          </div>
                        </div>
                        <p className="text-slate-600 text-sm mb-2">
                          {favorite.listing?.farm?.farm_name || "Unknown Farm"}
                        </p>
                        <div className="flex items-center text-slate-500 text-sm mb-4">
                          <Map className="h-4 w-4 mr-1" />
                          <span>
                            {favorite.listing?.farm?.region},{" "}
                            {favorite.listing?.farm?.country}
                          </span>
                        </div>
                        <div className="flex items-center text-slate-500 text-sm mb-2">
                          <Droplet className="h-4 w-4 mr-1" />
                          <span>{favorite.listing?.processing_method}</span>
                        </div>
                        <div className="flex items-center text-slate-500 text-sm mb-2">
                          <Coffee className="h-4 w-4 mr-1" />
                          <span>{favorite.listing?.bean_type}</span>
                        </div>
                      </CardContent>
                    </Card>
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
      </main>
    </div>
  );
}
