import { z } from "zod";

/**
 * Donation form validation schema
 */
export const DonationFormSchema = z.object({
  donorName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"),
  
  donorEmail: z
    .string()
    .email("Please enter a valid email address")
    .max(255, "Email must be less than 255 characters"),
  
  donorPhone: z
    .string()
    .optional()
    .refine((phone) => {
      if (!phone) return true; // Optional field
      return /^[6-9]\d{9}$/.test(phone);
    }, "Please enter a valid 10-digit Indian mobile number"),
  
  amount: z
    .number()
    .min(1, "Donation amount must be at least ₹1")
    .max(1000000, "Donation amount cannot exceed ₹10,00,000")
    .refine((amount) => Number.isInteger(amount), "Amount must be a whole number"),
  
  categoryId: z
    .string()
    .min(1, "Please select a donation category"),
  
  customPurpose: z
    .string()
    .optional()
    .refine((purpose) => {
      if (!purpose) return true; // Optional field
      return purpose.length >= 10 && purpose.length <= 500;
    }, "Purpose must be between 10 and 500 characters"),
  
  isAnonymous: z
    .boolean()
    .optional()
    .default(false),
});

/**
 * Donation category validation schema
 */
export const DonationCategorySchema = z.object({
  name: z
    .string()
    .min(2, "Category name must be at least 2 characters")
    .max(50, "Category name must be less than 50 characters")
    .regex(/^[a-zA-Z0-9\s\-&]+$/, "Category name can only contain letters, numbers, spaces, hyphens, and ampersands"),
  
  description: z
    .string()
    .optional()
    .refine((desc) => {
      if (!desc) return true; // Optional field
      return desc.length >= 10 && desc.length <= 200;
    }, "Description must be between 10 and 200 characters"),
  
  icon: z
    .string()
    .max(50, "Icon name must be less than 50 characters")
    .optional(),
  
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid hex color code")
    .optional(),
  
  minAmount: z
    .number()
    .optional()
    .refine((amount) => {
      if (amount === undefined) return true;
      return amount >= 1 && amount <= 1000000;
    }, "Minimum amount must be between ₹1 and ₹10,00,000"),
  
  maxAmount: z
    .number()
    .optional()
    .refine((amount) => {
      if (amount === undefined) return true;
      return amount >= 1 && amount <= 1000000;
    }, "Maximum amount must be between ₹1 and ₹10,00,000"),
  
  isPopular: z
    .boolean()
    .optional()
    .default(false),
});

/**
 * Donation category update schema (all fields optional)
 */
export const DonationCategoryUpdateSchema = DonationCategorySchema.partial();

/**
 * Donation search/filter schema
 */
export const DonationFilterSchema = z.object({
  categoryId: z.string().optional(),
  status: z.enum(["pending", "captured", "failed", "refunded"]).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  minAmount: z.number().optional(),
  maxAmount: z.number().optional(),
  donorEmail: z.string().email().optional(),
});

/**
 * Donation stats query schema
 */
export const DonationStatsSchema = z.object({
  period: z.enum(["daily", "weekly", "monthly", "yearly"]).optional().default("monthly"),
  categoryId: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

/**
 * Type exports for TypeScript
 */
export type DonationFormData = z.infer<typeof DonationFormSchema>;
export type DonationCategoryData = z.infer<typeof DonationCategorySchema>;
export type DonationCategoryUpdateData = z.infer<typeof DonationCategoryUpdateSchema>;
export type DonationFilterData = z.infer<typeof DonationFilterSchema>;
export type DonationStatsData = z.infer<typeof DonationStatsSchema>;

/**
 * Validation helper functions
 */
export const validateDonationForm = (data: unknown) => {
  return DonationFormSchema.safeParse(data);
};

export const validateDonationCategory = (data: unknown) => {
  return DonationCategorySchema.safeParse(data);
};

export const validateDonationCategoryUpdate = (data: unknown) => {
  return DonationCategoryUpdateSchema.safeParse(data);
};

export const validateDonationFilter = (data: unknown) => {
  return DonationFilterSchema.safeParse(data);
};

export const validateDonationStats = (data: unknown) => {
  return DonationStatsSchema.safeParse(data);
};
