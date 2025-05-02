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
    polygon_coords: z.array(
      z.array(
        z.object({
          lat: z.number().min(-90).max(90),
          lng: z.number().min(-180).max(180),
        }),
      ),
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
  farmId: z.string().optional(),
  coffee_variety: z
    .string()
    .min(1, "Coffee variety is required")
    .refine((val) => !/\d/.test(val), {
      message: "Coffee variety cannot contain numbers",
    }),
  grade: z
    .number()
    .min(1, "Grade must be at least 1")
    .max(6, "Grade must be at most 6"),
  bean_type: z
    .string()
    .min(1, "Bean type is required")
    .refine((val) => !/\d/.test(val), {
      message: "Bean type cannot contain numbers",
    }),
  crop_year: z.string().min(1, "Crop year is required"),
  processing_method: z
    .string()
    .min(1, "Processing method is required")
    .refine((val) => !/\d/.test(val), {
      message: "Processing method cannot contain numbers",
    }),
  moisture_percentage: z
    .number()
    .min(1, "Moisture must be at least 1%")
    .max(100, "Moisture cannot exceed 100%"),
  screen_size: z.number().min(1, "Screen size is required"),
  drying_method: z
    .string()
    .min(1, "Drying method is required")
    .refine((val) => !/\d/.test(val), {
      message: "Drying method cannot contain numbers",
    }),
  wet_mill: z
    .string()
    .min(1, "Wet mill is required")
    .refine((val) => !/\d/.test(val), {
      message: "Wet mill cannot contain numbers",
    }),
  is_organic: z
    .string()
    .min(1, "Organic property is required")
    .refine((val) => !/\d/.test(val), {
      message: "Organic property cannot contain numbers",
    }),
  cup_taste_acidity: z
    .string()
    .min(1, "Acidity is required")
    .refine((val) => !/\d/.test(val), {
      message: "Acidity cannot contain numbers",
    }),
  cup_taste_body: z
    .string()
    .min(1, "Body is required")
    .refine((val) => !/\d/.test(val), {
      message: "Body cannot contain numbers",
    }),
  cup_taste_sweetness: z
    .string()
    .min(1, "Sweetness is required")
    .refine((val) => !/\d/.test(val), {
      message: "Sweetness cannot contain numbers",
    }),
  cup_taste_aftertaste: z
    .string()
    .min(1, "Aftertaste is required")
    .refine((val) => !/\d/.test(val), {
      message: "Aftertaste cannot contain numbers",
    }),
  cup_taste_balance: z
    .string()
    .min(1, "Balance is required")
    .refine((val) => !/\d/.test(val), {
      message: "Balance cannot contain numbers",
    }),
  quantity_kg: z.number().min(1, "Quantity is required"),
  price_per_kg: z.number().min(1, "Price is required"),
  readiness_date: z.string().min(1, "Readiness date is required"),
  lot_length: z.string().optional(),
  delivery_type: z
    .string()
    .min(1, "Delivery type is required")
    .refine((val) => !/\d/.test(val), {
      message: "Delivery type cannot contain numbers",
    }),
  shipping_port: z
    .string()
    .min(1, "Shipping port is required")
    .refine((val) => !/\d/.test(val), {
      message: "Shipping port cannot contain numbers",
    }),
  discounts: z
    .array(
      z.object({
        minimum_quantity_kg: z
          .number()
          .min(1, "Minimum quantity must be at least 1 kg")
          .max(999999, "Minimum quantity is too large"),
        discount_percentage: z
          .number()
          .min(1, "Discount percentage must be at least 1%")
          .max(99, "Discount percentage cannot exceed 99%"),
      }),
    )
    .refine(
      (discounts) => {
        const quantities = discounts.map((d) => d.minimum_quantity_kg);
        return new Set(quantities).size === quantities.length;
      },
      {
        message: "Each discount must have a unique minimum quantity",
      },
    )
    .optional(),
});

export type CoffeeCropsFormData = z.infer<typeof coffeeCropsSchema>;

// Step 3: Bank Information Schema
const nameRegex = /^[a-zA-Z]{2,50}$/;
const accountHolderNameValidation = z
  .string()
  .min(2, "Account holder name must be at least 2 characters")
  .max(50, "Account holder name cannot exceed 50 characters")
  .regex(nameRegex, "Account holder name can only contain letters");

export const bankInfoSchema = z.object({
  account_holder_name: accountHolderNameValidation,
  bank_name: z
    .string()
    .min(2, "Bank name must be at least 2 characters")
    .max(100, "Bank name cannot exceed 100 characters")
    .regex(
      /^[a-zA-Z\s-]{2,100}$/,
      "Bank name can only contain letters, spaces, or hyphens",
    ),
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
  swift_code: z
    .string()
    .regex(
      /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/,
      "Invalid SWIFT code (must be 8 or 11 characters, e.g., ABCDUS33 or ABCDUS33XXX)",
    ),
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
