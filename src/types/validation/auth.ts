import { z } from "zod";
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});



// Define the schema for password validation
export const passwordSchema = z.object({
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/\d/, "Password must contain at least one number")
    .regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character"),
  confirmPassword: z
    .string()
    .min(6, "Confirm password must be at least 6 characters")
    .regex(/[A-Z]/, "Confirm password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Confirm password must contain at least one lowercase letter")
    .regex(/\d/, "Confirm password must contain at least one number")
    .regex(/[!@#$%^&*(),.?":{}|<>]/, "Confirm password must contain at least one special character"),
});

export type PasswordValidationType = z.infer<typeof passwordSchema>;




export const buyerSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  preferredCurrency: z.string().min(1, "Please select a preferred currency"),
})

export const sellerSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  productCategory: z.string().min(1, "Please select a product category"),
})
