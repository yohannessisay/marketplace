export type AdminEditRequestStatusType =
  | "not_requested"
  | "requested"
  | "allowed"
  | "expired"
  | "rejected";

export type KycStatusType = "pending" | "approved" | "rejected";

export interface Farm {
  id: string;
  seller_id: string;
  farm_name: string;
  town_location: string | null;
  region: string | null;
  country: string;
  total_size_hectares: number | null;
  coffee_area_hectares: number | null;
  longitude: number | null;
  latitude: number | null;
  altitude_meters: string | null;
  crop_type: string | null;
  crop_source: string | null;
  origin: string | null;
  capacity_kg: number | null;
  tree_type: string | null;
  tree_variety: string | null;
  soil_type: string | null;
  avg_annual_temp: number | null;
  annual_rainfall_mm: number | null;
  verification_status: KycStatusType;
  created_at: string;
  updated_at: string | null;
  created_by_agent_id: string | null;
  polygon_coords: { lat: number; lng: number }[][] | null;
  admin_edit_request_approval_status: AdminEditRequestStatusType;
  edit_requested_at: string | null;
  photos: Array<{
    id: string;
    photo_url: string;
    is_primary: boolean;
    created_at: string;
  }>;
  kyc_documents: Array<{
    id: string;
    doc_url: string;
    doc_type: string;
    note: string | null;
    verified: boolean;
    created_at: string;
    updated_at: string | null;
  }>;
}
