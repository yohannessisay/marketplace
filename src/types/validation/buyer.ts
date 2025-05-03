import { z } from "zod";

export const buyerOnboardingSchema = z.object({
  company_name: z.string().min(1, { message: "Company name is required" }),
  country: z.string().min(1, { message: "Country is required" }),
  position: z.string().min(1, { message: "Position is required" }),
  website_url: z
    .string()
    .optional()
    .refine((val) => !val || val.startsWith("https://") || val.startsWith("http://"), {
      message: "Website URL must start with http:// or https://",
    }),
  company_address: z
    .string()
    .min(1, { message: "Company address is required" }),
  telegram: z
    .string()
    .optional(),
  about_me: z.string().optional(),
});

export const profileSchema = z.object({
  company_name: z
    .string()
    .min(1, { message: "Company name is required" })
    .optional(),
  country: z.string().min(1, { message: "Country is required" }).optional(),
  position: z.string().min(1, { message: "Position is required" }).optional(),
  website_url: z
    .string()
    .optional()
    .refine((val) => !val || val.startsWith("https://") || val.startsWith("http://"), {
      message: "Website URL must start with http:// or https://",
    }),
  company_address: z
    .string()
    .min(1, { message: "Company address is required" })
    .optional(),
  telegram: z
    .string()
    .optional()
    .refine((val) => !val || (val.startsWith("@") && val.length >= 5), {
      message: "Telegram handle must start with @ and be at least 5 characters",
    }),
  about_me: z.string().optional(),
});

export const accountSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email")
    .min(1, "Email is required"),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  phone: z.string().min(1, "Phone number is required"),
  files: z
    .instanceof(File, { message: "File is required" })
    .refine((file) => file.size > 0, { message: "File cannot be empty" })
    .optional(),
});
