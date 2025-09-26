// convex/coTransactions.ts
import { v } from "convex/values";
import { Doc } from "./_generated/dataModel";
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
    storageId: v.optional(v.id("_storage")),
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

export const createCoTransactionAndUpdateToken = mutation({
  args: {
    eventId: v.id("events"),
    studentId: v.id("students"),
    storageId: v.optional(v.id("_storage")),
    paymentMethod: v.optional(v.union(v.literal("upi"), v.literal("cash"))),
    status: v.optional(
      v.union(v.literal("pending"), v.literal("paid"), v.literal("exception"))
    ),
  },
  handler: async (ctx, args) => {
    // 1. Fetch the token using the index
    const token = await ctx.db
      .query("tokens")
      .withIndex("by_event_student", (q) =>
        q.eq("eventId", args.eventId).eq("studentId", args.studentId)
      )
      .unique();

    if (!token) {
      throw new Error("Token not found for given eventId and studentId");
    }

    // 2. If token already has a coTransaction, update it
    if (token.coTransactions) {
      // Only include fields that are provided
      const patch: Partial<Doc<"coTransactions">> = {};
      if (args.status) patch.status = args.status;
      if (args.paymentMethod) patch.method = args.paymentMethod;
      if (args.storageId) patch.storageId = args.storageId;

      if (Object.keys(patch).length > 0) {
        await ctx.db.patch(token.coTransactions, patch);
      }
      return { coTransactionId: token.coTransactions };
    }

    // 3. Fetch the event to get the amount
    const event = await ctx.db.get(args.eventId);
    if (!event || typeof event.amount !== "number") {
      throw new Error("Event not found or missing amount");
    }

    // 4. Create the coTransaction
    const coTransactionId = await ctx.db.insert("coTransactions", {
      amount: event.amount,
      currency: "inr",
      status: args.status || "pending",
      method: args.paymentMethod || "upi",
    });

    // 5. Update the token with the coTransactionId
    await ctx.db.patch(token._id, {
      coTransactions: coTransactionId,
    });

    return { coTransactionId };
  },
});
