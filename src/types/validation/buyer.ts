import { z } from "zod";

export const buyerOnboardingSchema = z.object({
  company_name: z.string().min(1, { message: "Company name is required" }),
  country: z.string().min(1, { message: "Country is required" }),
  position: z.string().min(1, { message: "Position is required" }),
  website_url: z.string().optional(),
  company_address: z.string().min(1, { message: "Position is required" }),
  telegram: z.string().optional(),
  about_me: z.string().optional(),
});
