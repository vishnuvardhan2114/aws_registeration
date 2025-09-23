import { Id } from "@/convex/_generated/dataModel";

/**
 * Donation category type
 */
export interface DonationCategory {
  _id: Id<"donationCategories">;
  _creationTime: number;
  name: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
  isDefault: boolean;
  icon?: string;
  color?: string;
  minAmount?: number;
  maxAmount?: number;
  isPopular?: boolean;
  metadata?: unknown;
}

/**
 * Donation type
 */
export interface Donation {
  _id: Id<"donations">;
  _creationTime: number;
  donorName: string;
  donorEmail: string;
  donorPhone?: string;
  amount: number;
  currency: string;
  paymentId: string;
  orderId: string;
  status: "pending" | "captured" | "failed" | "refunded";
  method: string;
  bank?: string;
  wallet?: string;
  vpa?: string;
  fee: number;
  tax: number;
  created_at: string;
  rawResponse: unknown;
  categoryId: Id<"donationCategories">;
  customPurpose?: string;
  isAnonymous?: boolean;
  receiptSent: boolean;
  receiptEmail?: string;
  receiptSentAt?: number;
  ipAddress?: string;
  userAgent?: string;
  referrer?: string;
}

/**
 * Donation with category information
 */
export interface DonationWithCategory extends Donation {
  category?: DonationCategory;
}

/**
 * Donation statistics type
 */
export interface DonationStats {
  totalAmount: number;
  totalCount: number;
  monthlyAmount: number;
  weeklyAmount: number;
  dailyAmount: number;
  monthlyCount: number;
  weeklyCount: number;
  dailyCount: number;
  categoryStats: CategoryStats[];
  averageDonation: number;
}

/**
 * Category statistics type
 */
export interface CategoryStats {
  categoryId: Id<"donationCategories">;
  categoryName: string;
  count: number;
  amount: number;
  percentage: number;
}

/**
 * Donation form data type
 */
export interface DonationFormData {
  donorName: string;
  donorEmail: string;
  donorPhone?: string;
  amount: number;
  categoryId: string;
  customPurpose?: string;
  isAnonymous?: boolean;
}

/**
 * Donation category form data type
 */
export interface DonationCategoryFormData {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  minAmount?: number;
  maxAmount?: number;
  isPopular?: boolean;
}

/**
 * Donation payment response type
 */
export interface DonationPaymentResponse {
  success: boolean;
  donationId: Id<"donations">;
  paymentStatus: string;
  amount: number;
  message?: string;
}

/**
 * Donation receipt data type
 */
export interface DonationReceiptData {
  donation: DonationWithCategory;
  receiptHtml: string;
  receiptNumber: string;
  formattedDate: string;
  formattedTime: string;
}

/**
 * Donation filter options type
 */
export interface DonationFilterOptions {
  categoryId?: string;
  status?: "pending" | "captured" | "failed" | "refunded";
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
  donorEmail?: string;
  limit?: number;
  cursor?: string;
}

/**
 * Donation analytics data type
 */
export interface DonationAnalytics {
  period: "daily" | "weekly" | "monthly" | "yearly";
  data: {
    date: string;
    amount: number;
    count: number;
  }[];
  totalAmount: number;
  totalCount: number;
  averageAmount: number;
  growthRate: number;
}

/**
 * Donation dashboard summary type
 */
export interface DonationDashboardSummary {
  today: {
    amount: number;
    count: number;
  };
  thisWeek: {
    amount: number;
    count: number;
  };
  thisMonth: {
    amount: number;
    count: number;
  };
  allTime: {
    amount: number;
    count: number;
  };
  topCategories: CategoryStats[];
  recentDonations: DonationWithCategory[];
}

/**
 * Donation email template data type
 */
export interface DonationEmailData {
  donorName: string;
  donorEmail: string;
  amount: number;
  categoryName: string;
  customPurpose?: string;
  paymentId: string;
  donationDate: string;
  receiptHtml: string;
}

/**
 * Donation error type
 */
export interface DonationError {
  code: string;
  message: string;
  field?: string;
  details?: unknown;
}

/**
 * Donation success response type
 */
export interface DonationSuccessResponse {
  success: true;
  donationId: Id<"donations">;
  paymentId: string;
  amount: number;
  message: string;
  receiptUrl?: string;
}

/**
 * Donation failure response type
 */
export interface DonationFailureResponse {
  success: false;
  error: DonationError;
  donationId?: Id<"donations">;
}
