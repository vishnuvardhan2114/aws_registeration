import { defineTable } from "convex/server";
import { v } from "convex/values";

export const transactions = defineTable({
  paymentId: v.string(),
  amount: v.float64(),
  orderId: v.string(),
  status: v.string(),
});
