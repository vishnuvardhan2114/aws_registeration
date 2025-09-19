// convex/transactions.ts
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get a single transaction by ID
export const getTransaction = query({
  args: { transactionId: v.id("transactions") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.transactionId);
  },
});

// Add a new transaction
export const addTransaction = mutation({
  args: {
    paymentId: v.string(),
    amount: v.float64(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("transactions", args);
  },
});

// Update a transaction by ID
export const updateTransaction = mutation({
  args: {
    transactionId: v.id("transactions"),
    paymentId: v.optional(v.string()),
    amount: v.optional(v.float64()),
  },
  handler: async (ctx, args) => {
    const { transactionId, ...patch } = args;
    await ctx.db.patch(transactionId, patch);
  },
});
