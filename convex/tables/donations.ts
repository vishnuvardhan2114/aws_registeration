import { defineTable } from "convex/server";
import { v } from "convex/values";

export const donations = defineTable({
  // Donor Information
  donorName: v.string(),
  donorEmail: v.string(),
  donorPhone: v.optional(v.string()),
  
  // Payment Details
  amount: v.number(),
  currency: v.string(),
  paymentId: v.string(),
  orderId: v.string(),
  status: v.string(), // "pending", "captured", "failed", "refunded"
  method: v.string(),
  bank: v.optional(v.string()),
  wallet: v.optional(v.string()),
  vpa: v.optional(v.string()),
  fee: v.number(),
  tax: v.number(),
  created_at: v.string(),
  rawResponse: v.any(),
  
  // Donation Specific
  categoryId: v.optional(v.id("donationCategories")),
  customPurpose: v.optional(v.string()), // For "Others" category
  isAnonymous: v.optional(v.boolean()),
  
  // Receipt Management
  receiptSent: v.boolean(),
  receiptEmail: v.optional(v.string()),
  receiptSentAt: v.optional(v.number()),
  
  // Metadata
  ipAddress: v.optional(v.string()),
  userAgent: v.optional(v.string()),
  referrer: v.optional(v.string()),
})
  .index("by_paymentId", ["paymentId"])
  .index("by_orderId", ["orderId"])
  .index("by_category", ["categoryId"])
  .index("by_status", ["status"])
  .index("by_donorEmail", ["donorEmail"])
  .index("by_receiptSent", ["receiptSent"]);
