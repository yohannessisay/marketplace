export interface Farm {
  id: string;
  seller_id: string;
  farm_name: string;
  town_location: string;
  region: string;
  country: string;
  total_size_hectares: number;
  coffee_area_hectares: number;
  longitude: number;
  latitude: number;
  altitude_meters: number;
  crop_type: string;
  crop_source: string;
  origin: string;
  capacity_kg: number;
  tree_type: string;
  tree_variety: string;
  soil_type: string;
  avg_annual_temp: number;
  annual_rainfall_mm: number;
  verification_status: string;
  created_at: string;
  updated_at: string | null;
  created_by_agent_id: string | null;
}

export interface Seller {
  id: string;
  auth_id: string;
  created_by_agent_id: string | null;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  telegram: string;
  address: string;
  trading_since: string;
  rating: number;
  total_reviews: number;
  about_me: string;
  deals_completed: number;
  avatar_url_csv: string;
  verification_status: string;
  onboarding_stage: string;
  blocked_access: boolean;
  identity_verified: boolean;
  last_login_at: string;
}

export interface CoffeePhoto {
  id: string;
  listing_id: string;
  photo_url: string;
  is_primary: boolean;
  created_at: string;
}

export interface CoffeeListing {
  id: string;
  seller_id: string;
  farm_id: string;
  coffee_variety: string;
  bean_type: string;
  crop_year: string;
  is_organic: boolean;
  processing_method: string;
  moisture_percentage: number;
  screen_size: string;
  drying_method: string;
  wet_mill: string;
  cup_taste_acidity: string;
  cup_taste_body: string;
  cup_taste_sweetness: string;
  cup_taste_aftertaste: string;
  cup_taste_balance: string;
  grade: string;
  quantity_kg: number;
  price_per_kg: number;
  readiness_date: string;
  lot_length: string;
  delivery_type: string;
  shipping_port: string;
  listing_status: string;
  created_at: string;
  updated_at: string | null;
  expires_at: string | null;
  created_by_agent_id: string | null;
  farm: Farm;
  seller: Seller;
  coffee_photo: CoffeePhoto[];
  listing_discount: any[];
}

export interface ApiResponse {
  success: boolean;
  message: string;
  data: {
    listings: CoffeeListing[];
    pagination: {
      page: number;
      limit: number;
      totalItems: number;
      totalPages: number;
    };
    searchTerm: string | null;
    authenticationRequiredForActions: string;
  };
}

export interface FilterState {
  variety: string;
  processing_method: string;
  is_organic: string;
  min_price: string;
  max_price: string;
  origin: string;
  region: string;
  grade: string;
}
