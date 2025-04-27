import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const passwordSchema = z.object({
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/\d/, "Password must contain at least one number")
    .regex(
      /[!@#$%^&*]/,
      "Password must contain at least one special character (!@#$%^&*)"
    ),
  confirmPassword: z
    .string()
    .min(6, "Confirm password must be at least 6 characters")
    .regex(
      /[A-Z]/,
      "Confirm password must contain at least one uppercase letter"
    )
    .regex(
      /[a-z]/,
      "Confirm password must contain at least one lowercase letter"
    )
    .regex(/\d/, "Confirm password must contain at least one number")
    .regex(
      /[!@#$%^&*]/,
      "Confirm password must contain at least one special character (!@#$%^&*)"
    ),
});

export type PasswordValidationType = z.infer<typeof passwordSchema>;

const phoneNumberRegex = /^\+[1-9]\d{9,14}$/; // Enforces 10-15 digits after the '+' sign

const nameRegex = /^[a-zA-Z]{2,50}$/;
const nameValidation = z.object({
  first_name: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name cannot exceed 50 characters")
    .regex(nameRegex, "First name can only contain letters"),
  last_name: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name cannot exceed 50 characters")
    .regex(nameRegex, "Last name can only contain letters"),
});

export const buyerSchema = z.object({
  ...nameValidation.shape,
  phone: z
    .string()
    .regex(
      phoneNumberRegex,
      "Please provide a valid international phone number (e.g., +1234567890)",
    ),
  email: z.string().email("Please enter a valid email address"),
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/\d/, "Password must contain at least one number")
    .regex(
      /[!@#$%^&*=_"']/,
      "Password must contain at least one special character (!@#$%^&*)",
    ),
  preferredCurrency: z.string().min(1, "Please select a preferred currency"),
});

export const sellerSchema = z.object({
  ...nameValidation.shape,
  phone: z
    .string()
    .regex(
      phoneNumberRegex,
      "Please provide a valid international phone number (e.g., +1234567890)",
    ),
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/\d/, "Password must contain at least one number")
    .regex(
      /[!@#$%^&*]/,
      "Password must contain at least one special character (!@#$%^&*)",
    ),
});

export const sellerSchemaForAgent = z.object({
  ...nameValidation.shape,
  phone: z
    .string()
    .regex(
      phoneNumberRegex,
      "Please provide a valid international phone number (e.g., +1234567890)"
    ),
  email: z.string().email("Please enter a valid email address"),
});

export const createOTPValidationSchema = z.object({
  otp: z
    .string()
    .length(6, "OTP must be 6 digits")
    .refine((val) => /^\d+$/.test(val), "OTP must contain only numbers"),
});
