import { z } from "zod";

export const farmDetailsSchema = z
  .object({
    region: z.string().min(1, "Region is required"),
    longitude: z
      .number()
      .min(33, "Longitude must be within Ethiopia (33°E to 48°E)")
      .max(48, "Longitude must be within Ethiopia (33°E to 48°E)"),
    latitude: z
      .number()
      .min(3, "Latitude must be within Ethiopia (3°N to 15°N)")
      .max(15, "Latitude must be within Ethiopia (3°N to 15°N)"),
    crop_type: z.string().min(1, "Crop type is required"),
    crop_source: z.string().min(1, "Crop source is required"),
    origin: z.string().min(1, "Origin is required"),
    tree_type: z.string().min(1, "Tree type is required"),
    tree_variety: z.string().min(1, "Tree variety is required"),
    soil_type: z.string().min(1, "Soil type is required"),
    farm_name: z.string().min(1, "Farm name is required"),
    town_location: z.string().min(1, "Town location is required"),
    country: z.string().min(1, "Country is required"),
    total_size_hectares: z
      .number()
      .min(0.1, "Minimum farm size is 0.1 hectares")
      .max(10000, "Maximum farm size is 10,000 hectares"),
    coffee_area_hectares: z
      .number()
      .min(0.1, "Minimum coffee area is 0.1 hectares")
      .max(10000, "Maximum coffee area is 10,000 hectares"),
    altitude_meters: z
      .number()
      .min(500, "Minimum altitude for coffee is 500m")
      .max(3000, "Maximum altitude for coffee is 3000m"),
    capacity_kg: z
      .number()
      .min(1, "Minimum capacity is 1kg")
      .max(1000000, "Maximum capacity is 1,000,000kg"),
    avg_annual_temp: z
      .number()
      .min(15, "Minimum average temperature is 15°C")
      .max(30, "Maximum average temperature is 30°C"),
    annual_rainfall_mm: z
      .number()
      .min(600, "Minimum annual rainfall is 600mm")
      .max(3000, "Maximum annual rainfall is 3000mm"),
  })
  .refine((data) => data.coffee_area_hectares <= data.total_size_hectares, {
    message: "Coffee area cannot be greater than total farm size",
    path: ["coffee_area_hectares"],
  })
  .refine((data) => data.country.toLowerCase() === "ethiopia", {
    message: "Currently only Ethiopian farms are supported",
    path: ["country"],
  });

export type FarmDetailsFormData = z.infer<typeof farmDetailsSchema>;

// Step 2: Coffee Crops Schema - Updated to match the provided component
export const coffeeCropsSchema = z.object({
  // Ensure all fields match the form
  farmId: z.string().optional(), // Optional if not always provided
  coffee_variety: z.string().min(1, "Coffee variety is required").refine(val => !/\d/.test(val), { message: "Coffee variety cannot contain numbers" }),
  grade: z.string().min(1, "Initial grading is required").refine(val => !/\d/.test(val), { message: "Grade cannot contain numbers" }),
  bean_type: z.string().min(1, "Bean type is required").refine(val => !/\d/.test(val), { message: "Bean type cannot contain numbers" }),
  crop_year: z.string().min(1, "Crop year is required"), // likely should allow numbers (years)
  processing_method: z.string().min(1, "Processing method is required").refine(val => !/\d/.test(val), { message: "Processing method cannot contain numbers" }),
  moisture_percentage: z.number().min(1, "Moisture is required"),
  screen_size: z.number().min(1, "Screen size is required"),
  drying_method: z.string().min(1, "Drying method is required").refine(val => !/\d/.test(val), { message: "Drying method cannot contain numbers" }),
  wet_mill: z.string().min(1, "Wet mill is required").refine(val => !/\d/.test(val), { message: "Wet mill cannot contain numbers" }),
  is_organic: z.string().min(1, "Organic property is required").refine(val => !/\d/.test(val), { message: "Organic property cannot contain numbers" }),
  cup_taste_acidity: z.string().min(1, "Acidity is required").refine(val => !/\d/.test(val), { message: "Acidity cannot contain numbers" }),
  cup_taste_body: z.string().min(1, "Body is required").refine(val => !/\d/.test(val), { message: "Body cannot contain numbers" }),
  cup_taste_sweetness: z.string().min(1, "Sweetness is required").refine(val => !/\d/.test(val), { message: "Sweetness cannot contain numbers" }),
  cup_taste_aftertaste: z.string().min(1, "Aftertaste is required").refine(val => !/\d/.test(val), { message: "Aftertaste cannot contain numbers" }),
  cup_taste_balance: z.string().min(1, "Balance is required").refine(val => !/\d/.test(val), { message: "Balance cannot contain numbers" }),
  quantity_kg: z.number().min(1, "Quantity is required"),
  price_per_kg: z.number().min(1, "Price is required"),
  readiness_date: z.string().min(1, "Readiness date is required"),
  lot_length: z.string().optional(),
  delivery_type: z.string().min(1, "Delivery type is required").refine(val => !/\d/.test(val), { message: "Delivery type cannot contain numbers" }),
  shipping_port: z.string().min(1, "Shipping port is required").refine(val => !/\d/.test(val), { message: "Shipping port cannot contain numbers" }),
});

export type CoffeeCropsFormData = z.infer<typeof coffeeCropsSchema>;

// Step 3: Bank Information Schema
export const bankInfoSchema = z.object({
  account_holder_name: z.string().min(1, "Account holder name is required"),
  bank_name: z.string().min(1, "Bank name is required"),
  account_number: z.string().min(1, "Account number is required"),
  branch_name: z.string().min(1, "Branch name is required"),
  is_primary: z.string().min(1, "Account type is required"),
  swift_code: z.string().min(1, "Swift code is required"),
});

export type BankInfoFormData = z.infer<typeof bankInfoSchema>;

// Step 4: Profile Information Schema
export const profileInfoSchema = z.object({
  telegram: z.string().min(1, "Telegram is required"),
  address: z.string().min(1, "Invalid  address"),
  about_me: z.string().optional(),
  avatar_url: z.string().optional(),
});

export type ProfileInfoFormData = z.infer<typeof profileInfoSchema>;
