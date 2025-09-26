// convex/coTransactions.ts
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Add (Create)
export const addCoTransaction = mutation({
  args: {
    amount: v.number(),
    currency: v.string(),
    status: v.union(
      v.literal("paid"),
      v.literal("pending"),
      v.literal("exception")
    ),
    method: v.union(v.literal("cash"), v.literal("upi")),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("coTransactions", args);
  },
});

// Update
export const updateCoTransaction = mutation({
  args: {
    id: v.id("coTransactions"),
    patch: v.object({
      amount: v.optional(v.number()),
      currency: v.optional(v.string()),
      status: v.optional(
        v.union(v.literal("paid"), v.literal("pending"), v.literal("exception"))
      ),
      method: v.optional(v.union(v.literal("cash"), v.literal("upi"))),
      storageId: v.optional(v.id("_storage")),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, args.patch);
  },
});

// Delete
export const deleteCoTransaction = mutation({
  args: { id: v.id("coTransactions") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Get by ID
export const getCoTransactionById = query({
  args: { id: v.id("coTransactions") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get all
export const getAllCoTransactions = query({
  handler: async (ctx) => {
    return await ctx.db.query("coTransactions").collect();
  },
});
