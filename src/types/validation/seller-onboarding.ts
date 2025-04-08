import { z } from "zod";

// Step 1: Farm Details Schema
export const farmDetailsSchema = z.object({
  // Farm Location
  farm_location: z.string().min(1, "Farm location is required"),
  region: z.string().min(1, "Region is required"),
  total_farm_size: z.string().min(1, "Total farm size is required"),

  // Coffee Land Details
  coffee_covered_and: z.string().min(1, "Coffee covered land is required"),
  longitude: z.string().min(1, "Longitude is required"),
  latitude: z.string().min(1, "Latitude is required"),

  // Crop Environment
  crop_type: z.string().min(1, "Crop type is required"),
  crop_source: z.string().min(1, "Crop source is required"),
  origin: z.string().min(1, "Origin is required"),
  crop_capacity: z.string().min(1, "Crop capacity is required"),

  // Tree Information
  tree_type: z.string().min(1, "Tree type is required"),
  tree_variety: z.string().min(1, "Tree variety is required"),

  // Growing Conditions
  average_temperature: z.string().min(1, "Average temperature is required"),
  soil_type: z.string().min(1, "Soil type is required"),
  altitude: z.string().min(1, "Altitude is required"),
  annual_rainfall: z.string().min(1, "Annual rainfall is required"),

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
  coffeeVariety: z.string().min(1, "Coffee variety is required"),
  cupScore: z.string().min(1, "Cup score is required"),
  initialGrading: z.string().min(1, "Initial grading is required"),
  beanType: z.string().min(1, "Bean type is required"),
  cropYear: z.string().min(1, "Crop year is required"),

  // Crop Specification
  farmingPractice: z.string().min(1, "Farming practice is required"),
  processingMethod: z.string().min(1, "Processing method is required"),
  moisture: z.string().min(1, "Moisture is required"),
  screenSize: z.string().min(1, "Screen size is required"),
  dryingMethod: z.string().min(1, "Drying method is required"),
  wetMill: z.string().min(1, "Wet mill is required"),

  // Cup Taste
  aroma: z.string().min(1, "Aroma is required"),
  acidity: z.string().min(1, "Acidity is required"),
  body: z.string().min(1, "Body is required"),
  sweetness: z.string().min(1, "Sweetness is required"),
  aftertaste: z.string().min(1, "Aftertaste is required"),
  balance: z.string().min(1, "Balance is required"),

  // Price and Quantity
  quantity: z.string().min(1, "Quantity is required"),
  price: z.string().min(1, "Price is required"),

  // Readiness and Delivery
  readinessDate: z.string().min(1, "Readiness date is required"),
  lotNumber: z.string().optional(),
  deliveryType: z.string().min(1, "Delivery type is required"),
});

export type CoffeeCropsFormData = z.infer<typeof coffeeCropsSchema>;

// Step 3: Bank Information Schema
export const bankInfoSchema = z.object({
  accountHolderName: z.string().min(1, "Account holder name is required"),
  bankName: z.string().min(1, "Bank name is required"),
  accountNumber: z.string().min(1, "Account number is required"),
  branchName: z.string().min(1, "Branch name is required"),
  swiftCode: z.string().optional(),
  routingNumber: z.string().optional(),
  currency: z.string().min(1, "Currency is required"),
});

export type BankInfoFormData = z.infer<typeof bankInfoSchema>;

// Step 4: Profile Information Schema
export const profileInfoSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  address: z.string().min(1, "Address is required"),
  bio: z.string().optional(),
});

export type ProfileInfoFormData = z.infer<typeof profileInfoSchema>;
