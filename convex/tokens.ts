// convex/tokens.ts
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get a single token by ID
export const getToken = query({
  args: { tokenId: v.id("tokens") },
  returns: v.union(v.object({
    _id: v.id("tokens"),
    _creationTime: v.number(),
    transactionId: v.id("transactions"),
    eventId: v.id("events"),
    studentId: v.id("students"),
    isUsed: v.boolean(),
  }), v.null()),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.tokenId);
  },
});

// Add a new token
export const addToken = mutation({
  args: {
    transactionId: v.id("transactions"),
    eventId: v.id("events"),
    studentId: v.id("students"),
    isUsed: v.boolean(),
  },
  returns: v.id("tokens"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("tokens", args);
  },
});

// Update a token by ID
export const updateToken = mutation({
  args: {
    tokenId: v.id("tokens"),
    transactionId: v.optional(v.id("transactions")),
    eventId: v.optional(v.id("events")),
    studentId: v.optional(v.id("students")),
    isUsed: v.optional(v.boolean()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { tokenId, ...patch } = args;
    await ctx.db.patch(tokenId, patch);
    return null;
  },
});
