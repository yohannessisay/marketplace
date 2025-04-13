import { z } from "zod";

// Step 1: Farm Details Schema
export const farmDetailsSchema = z.object({
  // Farm Location
  region: z.string().min(1, "Region is required"),

  // Coffee Land Details
  longitude: z.string().min(1, "Longitude is required"),
  latitude: z.string().min(1, "Latitude is required"),

  // Crop Environment
  crop_type: z.string().min(1, "Crop type is required"),
  crop_source: z.string().min(1, "Crop source is required"),
  origin: z.string().min(1, "Origin is required"),

  // Tree Information
  tree_type: z.string().min(1, "Tree type is required"),
  tree_variety: z.string().min(1, "Tree variety is required"),

  // Growing Conditions
  soil_type: z.string().min(1, "Soil type is required"),

  // Farm Name
  farm_name: z.string().min(1, "Farm name is required"),

  town_location: z.string().min(1, "Town location is required"),
  country: z.string().min(1, "Farm name is required"),
  total_size_hectares: z.string().min(1, "Farm name is required"),
  coffee_area_hectares: z.string().min(1, "Farm name is required"),
  altitude_meters: z.string().min(1, "Farm name is required"),
  capacity_kg: z.string().min(1, "Farm name is required"),
  avg_annual_temp: z.string().min(1, "Farm name is required"),
  annual_rainfall_mm: z.string().min(1, "Farm name is required"),
});

export type FarmDetailsFormData = z.infer<typeof farmDetailsSchema>;

// Step 2: Coffee Crops Schema - Updated to match the provided component
export const coffeeCropsSchema = z.object({
  // Basic Info
  coffee_variety: z.string().min(1, "Coffee variety is required"), 
  grade: z.string().min(1, "Initial grading is required"),
  bean_type: z.string().min(1, "Bean type is required"),
  crop_year: z.string().min(1, "Crop year is required"),

  // Crop Specification 
  processing_method: z.string().min(1, "Processing method is required"),
  moisture_percentage: z.string().min(1, "Moisture is required"),
  screen_size: z.string().min(1, "Screen size is required"),
  drying_method: z.string().min(1, "Drying method is required"),
  wet_mill: z.string().min(1, "Wet mill is required"),
  is_organic: z.string().min(1, "Organic property is required"),

  // Cup Taste
  cup_taste_acidity: z.string().min(1, "Acidity is required"),
  cup_taste_body: z.string().min(1, "Body is required"),
  cup_taste_sweetness: z.string().min(1, "Sweetness is required"),
  cup_taste_aftertaste: z.string().min(1, "Aftertaste is required"),
  cup_taste_balance: z.string().min(1, "Balance is required"),

  // Price and Quantity
  quantity_kg: z.string().min(1, "Quantity is required"),
  price_per_kg: z.string().min(1, "Price is required"),

  // Readiness and Delivery
  readiness_date: z.string().min(1, "Readiness date is required"),
  lot_length: z.string().optional(),
  delivery_type: z.string().min(1, "Delivery type is required"),
  shipping_port: z.string().min(1, "Shipping port is required"), 
});

export type CoffeeCropsFormData = z.infer<typeof coffeeCropsSchema>;

// Step 3: Bank Information Schema
export const bankInfoSchema = z.object({
  account_holder_name: z.string().min(1, "Account holder name is required"),
  bank_name: z.string().min(1, "Bank name is required"),
  account_number: z.string().min(1, "Account number is required"),
  branch_name: z.string().min(1, "Branch name is required"),
  is_primary: z.string().min(1, "Account type is required"),
  swift_code:z.string().min(1,"Swift code is required")
});

export type BankInfoFormData = z.infer<typeof bankInfoSchema>;

// Step 4: Profile Information Schema
export const profileInfoSchema = z.object({
  telegram: z.string().min(1, "Telegram is required"),
  address: z.string().min(1,"Invalid  address"),
  about_me: z.string().optional(),
});

export type ProfileInfoFormData = z.infer<typeof profileInfoSchema>;
