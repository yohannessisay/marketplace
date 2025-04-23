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
import { Skeleton } from "@/components/ui/skeleton";
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
import { useNotification } from "@/hooks/useNotification";
import { APIErrorResponse } from "@/types/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

const SkeletonOrdersTable = () => (
  <Card>
    <CardContent className="p-6">
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="border rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-48" />
              </div>
              <div className="text-right">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
            <div className="flex flex-wrap gap-3 mt-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Separator className="my-3" />
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-32" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-10" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

const SkeletonSampleRequestsTable = () => (
  <Card>
    <CardContent className="p-6">
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="border rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-48" />
              </div>
              <div className="text-right">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
            <div className="flex flex-wrap gap-3 mt-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Separator className="my-3" />
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-32" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-10" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

const SkeletonBidsTable = () => (
  <Card>
    <CardContent className="p-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <Skeleton className="h-5 w-24" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-5 w-32" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-5 w-24" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-5 w-20" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-5 w-20" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-5 w-24" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-5 w-20" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-5 w-28" />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, index) => (
            <TableRow key={index}>
              <TableCell>
                <Skeleton className="h-5 w-32" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-48" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-32" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-16" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-16" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-24" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-20" />
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Skeleton className="h-9 w-20" />
                  <Skeleton className="h-9 w-20" />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
);

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

  const { successMessage, errorMessage } = useNotification();

  // Fetch active orders
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
          setActiveOrders(response.data.orders);
          setActivePagination(response.data.pagination);
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

  // Fetch historical orders
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
          setHistoricalOrders(response.data.orders);
          setHistoryPagination(response.data.pagination);
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

  // Fetch sample requests
  useEffect(() => {
    const fetchSampleRequests = async () => {
      setSampleLoading(true);
      try {
        const response: any = await apiService().get(
          `/sellers/samples/get-sample-requests?page=${sampleCurrentPage}&limit=${
            samplePagination.limit
          }&search=${encodeURIComponent(sampleSearchTerm)}`,
        );
        if (response.success) {
          setSampleRequests(response.data.sampleRequests);
          setSamplePagination(response.data.pagination);
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
    };

    if (activeTab === "sample" && !fetchedTabs.sample) {
      fetchSampleRequests();
    }
  }, [sampleCurrentPage, sampleSearchTerm, activeTab, fetchedTabs.sample]);

  // Fetch seller bids
  useEffect(() => {
    const fetchSellerBids = async () => {
      setBidsLoading(true);
      try {
        const response: any = await apiService().get(
          `/sellers/listings/bids/get-bids?page=${bidsCurrentPage}&limit=${
            bidsPagination.limit
          }&search=${encodeURIComponent(bidsSearchTerm)}`,
        );
        if (response.success) {
          setBids(response.data.bids);
          setBidsPagination(response.data.pagination);
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
    };

    if (activeTab === "bids" && !fetchedTabs.bids) {
      fetchSellerBids();
    }
  }, [bidsCurrentPage, bidsSearchTerm, activeTab, fetchedTabs.bids]);

  // Fetch data after bid actions
  const fetchData = async () => {
    setBidsLoading(true);
    try {
      const response: any = await apiService().get(
        `/sellers/listings/bids/get-bids?page=${bidsCurrentPage}&limit=${
          bidsPagination.limit
        }&search=${encodeURIComponent(bidsSearchTerm)}`,
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

  // Accept a bid
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

  // Reject a bid
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

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setExpandedOrderId(null);
  };

  // Handle search for active orders
  const handleActiveSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveCurrentPage(1);
    setFetchedTabs((prev) => ({ ...prev, current: false }));
  };

  // Handle search for historical orders
  const handleHistorySearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHistoryCurrentPage(1);
    setFetchedTabs((prev) => ({ ...prev, historical: false }));
  };

  // Handle search for sample requests
  const handleSampleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSampleCurrentPage(1);
    setFetchedTabs((prev) => ({ ...prev, sample: false }));
  };

  // Handle search for bids
  const handleBidsSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setBidsCurrentPage(1);
    setFetchedTabs((prev) => ({ ...prev, bids: false }));
  };

  // const deleteOrder = async (orderId: string) => {
  //   if (!orderId) {
  //     errorMessage({
  //       success: false,
  //       error: {
  //         message: "Invalid order ID",
  //         details: "No order ID provided",
  //         code: 400,
  //       },
  //     });
  //     return;
  //   }

  //   try {
  //     await apiService().post(`/orders/cancel-order?orderId=${orderId}`, {});
  //     setActiveOrders((prev) => prev.filter((order) => order.id !== orderId));
  //     setActivePagination((prev) => {
  //       const newTotalItems = Math.max(0, prev.totalItems - 1);
  //       const newTotalPages = Math.ceil(newTotalItems / prev.limit);
  //       return {
  //         ...prev,
  //         totalItems: newTotalItems,
  //         totalPages: newTotalPages,
  //         page:
  //           activeCurrentPage > newTotalPages && newTotalPages > 0
  //             ? newTotalPages
  //             : prev.page,
  //       };
  //     });
  //     if (expandedOrderId === orderId) {
  //       setExpandedOrderId(null);
  //     }
  //     successMessage("Order cancelled successfully");
  //   } catch (error: unknown) {
  //     const errorResponse = error as APIErrorResponse;
  //     errorMessage(errorResponse);
  //   }
  // };

  // Render order status progress
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
            RD{" "}
          </div>
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

  // Order Item Component
  const OrderItem = ({ item, tabType }: { item: Order; tabType: string }) => {
    // const isOrderTab = tabType === "current" || tabType === "historical";
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
              {/*
              <div className="mt-4 flex justify-end space-x-3">
                {tabType === "current" && (
                  <>
                    <Button
                      variant="destructive"
                      onClick={() => deleteOrder(item.id)}
                      disabled={activeLoading || generalLoading}
                    >
                      Cancel Order
                    </Button>
                    <Link to={`/listing/${item.listing_id}`}>
                      <Button variant="outline">View Detail</Button>
                    </Link>
                  </>
                )}
              </div> */}
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

  // Empty state component
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
