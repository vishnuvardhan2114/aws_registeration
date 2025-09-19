// convex/events.ts
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get a single event by ID
export const getEvent = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.eventId);
  },
});

// Add a new event
export const addEvent = mutation({
  args: {
    name: v.string(),
    isFoodIncluded: v.boolean(),
    amount: v.float64(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("events", args);
  },
});

// Update an event by ID
export const updateEvent = mutation({
  args: {
    eventId: v.id("events"),
    name: v.optional(v.string()),
    isFoodIncluded: v.optional(v.boolean()),
    amount: v.optional(v.float64()),
  },
  handler: async (ctx, args) => {
    const { eventId, ...patch } = args;
    await ctx.db.patch(eventId, patch);
  },
});
