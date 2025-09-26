import { defineTable } from "convex/server";
import { v } from "convex/values";

export const coTransactions = defineTable({
  amount: v.number(),
  currency: v.string(),
  status: v.union(
    v.literal("paid"),
    v.literal("pending"),
    v.literal("exception")
  ),
  method: v.union(v.literal("cash"), v.literal("upi")),
  storageId: v.id("_storage"),
});
