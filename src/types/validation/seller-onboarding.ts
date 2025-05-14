import { z } from "zod";
export const farmDetailsSchema = z
  .object({
    region: z.enum(["Oromia", "SNNPR"], {
      errorMap: () => ({
        message: "Region must be either 'Oromia' or 'SNNPR'",
      }),
    }),
    longitude: z
      .number()
      .min(33, "Longitude must be within Ethiopia (33°E to 48°E)")
      .max(48, "Longitude must be within Ethiopia (33°E to 48°E)")
      .refine((val) => Number.isFinite(val) && !Number.isInteger(val), {
        message: "Longitude must be a precise decimal value",
      }),
    latitude: z
      .number()
      .min(3, "Latitude must be within Ethiopia (3°N to 15°N)")
      .max(15, "Latitude must be within Ethiopia (3°N to 15°N)")
      .refine((val) => Number.isFinite(val) && !Number.isInteger(val), {
        message: "Latitude must be a precise decimal value",
      }),
    crop_type: z.string().min(1, "Crop type is required"),
    crop_source: z.enum(
      [
        "Jimma, Oromia, Ethiopia",
        "Guji, Oromia, Ethiopia",
        "Harar, Oromia, Ethiopia",
        "Illubabor, Oromia, Ethiopia",
        "",
      ],
      {
        errorMap: () => ({
          message:
            "Crop source must be one of: Jimma, Guji, Harar, or Illubabor in Oromia, Ethiopia",
        }),
      },
    ),
    origin: z.enum(
      [
        "Gomma, Jimma",
        "Mana, Jimma",
        "Limu, Jimma",
        "Gera, Jimma",
        "Adola-reda, Guji",
        "Urga, Guji",
        "Shakiso, Guji",
        "Hambela, Guji",
        "West Hararghe, Harrar",
        "Sidama",
        "Yirgachefe",
        "",
      ],
      {
        errorMap: () => ({
          message:
            "Origin must be one of the specified regions in Ethiopia (e.g., Gomma, Jimma, Sidama)",
        }),
      },
    ),
    tree_type: z.string().min(1, "Tree type is required"),
    tree_variety: z.string().min(1, "Tree variety is required"),
    soil_type: z.enum(["Forest (Dark) Soil", "Sand Soil", ""], {
      errorMap: () => ({
        message: "Soil type must be either 'Forest (Dark) Soil' or 'Sand Soil'",
      }),
    }),
    farm_name: z.string().min(1, "Farm name is required"),
    town_location: z.string().min(1, "Town location is required"),
    country: z.string().min(1, "Country is required"),
    total_size_hectares: z
      .number()
      .min(0.1, "Minimum farm size is 0.1 hectares"),
    coffee_area_hectares: z
      .number()
      .min(0.1, "Minimum coffee area is 0.1 hectares")
      .max(10000, "Maximum coffee area is 10,000 hectares"),
    altitude_meters: z.enum(["Above 2200", "Below 2200"], {
      errorMap: () => ({
        message: "Altitude must be either 'Above 2200' or 'Below 2200' meters",
      }),
    }),
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
    polygon_coords: z
      .array(
        z.array(
          z.object({
            lat: z.number().min(-90).max(90),
            lng: z.number().min(-180).max(180),
          }),
        ),
      )
      .min(
        1,
        "Farm boundary map is required. Please draw at least one polygon.",
      )
      .refine(
        (coords) => coords.every((polygon) => polygon.length >= 3),
        "Each polygon must have at least 3 coordinates to form a valid boundary.",
      ),
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

export const coffeeCropsSchema = z.object({
  farmId: z.string().min(1, "Farm ID is required"),
  coffee_variety: z.string().min(1, "Coffee variety is required"),
  grade: z.string().min(1, "Grade is required"),
  bean_type: z.string().min(1, "Bean type is required"),
  crop_year: z.string().min(1, "Crop year is required"),
  processing_method: z.string().min(1, "Processing method is required"),
  moisture_percentage: z
    .number()
    .min(0, "Moisture percentage must be at least 0"),
  screen_size: z.string().min(1, "Screen size is required"),
  drying_method: z.string().min(1, "Drying method is required"),
  wet_mill: z.string().min(1, "Wet mill is required"),
  is_organic: z.string().min(1, "Organic status is required"),
  cup_aroma: z
    .array(z.string())
    .min(1, "At least one aroma option must be selected"),
  cup_taste: z
    .array(z.string())
    .min(1, "At least one taste option must be selected"),
  quantity_kg: z.number().min(1, "Quantity must be at least 1 kg"),
  price_per_kg: z.number().min(0, "Price per kg must be at least 0"),
  readiness_date: z.string().min(1, "Readiness date is required"),
  lot_length: z.string().optional(),
  delivery_type: z.string().min(1, "Delivery type is required"),
  shipping_port: z.string().min(1, "Shipping port is required"),
});

export type CoffeeCropsFormData = z.infer<typeof coffeeCropsSchema>;

// Step 3: Bank Information Schema
const accountHolderNameValidation = z
  .string()
  .min(2, "Account holder name must be at least 2 characters")
  .max(50, "Account holder name cannot exceed 50 characters");

export const bankInfoSchema = z.object({
  account_holder_name: accountHolderNameValidation,
  bank_name: z
    .string()
    .min(2, "Bank name must be at least 2 characters")
    .max(100, "Bank name cannot exceed 100 characters"),
  account_number: z
    .string()
    .min(8, "Account number must be at least 8 digits")
    .max(20, "Account number cannot exceed 20 digits")
    .regex(
      /^\d{8,20}$/,
      "Account number must be numeric and between 8-20 digits",
    ),
  branch_name: z
    .string()
    .min(2, "Branch name must be at least 2 characters")
    .max(100, "Branch name cannot exceed 100 characters")
    .regex(
      /^[a-zA-Z\s]{2,100}$/,
      "Branch name can only contain letters or spaces",
    ),
  is_primary: z.string({
    required_error: "Please specify if this is the primary account",
  }),
  swift_code: z.string().min(8, "Account number must be at least 8 digits"),
});

export type BankInfoFormData = z.infer<typeof bankInfoSchema>;

// Step 4: Profile Information Schema
export const profileInfoSchema = z.object({
  telegram: z
    .string()
    .min(1, "Telegram is required")
    .regex(
      /^@[\w]{5,32}$/,
      "Invalid Telegram handle (must start with @ and be 5-32 characters)",
    ),
  address: z
    .string()
    .min(1, "Address is required")
    .regex(
      /^[a-zA-Z0-9\s,.-]{10,100}$/,
      "Invalid address format (must be 10-100 characters, including letters, numbers, spaces, commas, periods, or hyphens)",
    ),
  about_me: z
    .string()
    .max(500, "About me section cannot exceed 500 characters")
    .optional(),
  avatar_url: z.string().optional(),
});

export type ProfileInfoFormData = z.infer<typeof profileInfoSchema>;
