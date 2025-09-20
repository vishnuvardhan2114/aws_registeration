import { defineTable } from "convex/server";
import { v } from "convex/values";

export const transactions = defineTable({
  paymentId: v.string(),
  orderId: v.string(),
  amount: v.number(),
  currency: v.string(),
  status: v.string(),
  method: v.string(),
  bank: v.optional(v.string()),
  wallet: v.optional(v.string()),
  vpa: v.optional(v.string()),
  email: v.string(),
  contact: v.string(),
  fee: v.number(),
  tax: v.number(),
  created_at: v.string(),
  rawResponse: v.any(),
})
  .index("by_paymentId", ["paymentId"])
  .index("by_orderId", ["orderId"]);
