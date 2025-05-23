export enum SampleRequestDeliveryStatus {
  PENDING = "pending",
  INPROGRESS = "inprogress",
  DELIVERED = "delivered",
  CANCELLED = "cancelled",
  ACCEPTED = "accepted",
}

export enum OrderBidStatus {
  PENDING = "pending",
  ACCEPTED = "accepted",
  REJECTED = "rejected",
  EXPIRED = "expired",
}

export interface Seller {
  first_name?: string;
  last_name?: string;
}

export interface Listing {
  id: string;
  coffee_variety?: string;
  farm_name?: string;
  region?: string;
  processing_method?: string;
  listing_status: string;
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

export enum OrderProgressStatus {
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

export interface Order {
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
  reviews: any;
  seller: Seller;
}

export interface SampleRequest {
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
}

export interface Buyer {
  first_name?: string;
  last_name?: string;
}

export interface Favorite {
  id: string;
  listing_id: string;
  seller: any;
  buyer_id: string;
  created_at: string;
  listing: Listing;
}

export interface PaginationData {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface OrderFilterState {
  status?: string;
  coffeeOrigin?: string;
  dateFrom?: string;
  dateTo?: string;
  progressStatus?: OrderProgressStatus;
}

export interface SampleFilterState {
  status?: SampleRequestDeliveryStatus;
  coffeeOrigin?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface BidFilterState {
  status?: OrderBidStatus;
  coffeeOrigin?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface FavoriteFilterState {
  listingStatus?: string;
  coffeeOrigin?: string;
  dateFrom?: string;
  dateTo?: string;
}
