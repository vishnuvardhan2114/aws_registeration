// convex/transactions.ts
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
// Get a single transaction by ID
export const getTransaction = query({
  args: { transactionId: v.id("transactions") },
  returns: v.union(v.object({
    _id: v.id("transactions"),
    _creationTime: v.number(),
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
  }), v.null()),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.transactionId);
  },
});
export const insertTransaction = mutation({
  args: {
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
  },
  returns: v.id("transactions"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("transactions", args);
  },
});





