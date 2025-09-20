// convex/events.ts
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all events
export const getAllEvents = query({
  args: {},
  returns: v.array(v.object({
    _id: v.id("events"),
    _creationTime: v.number(),
    name: v.string(),
    isFoodIncluded: v.boolean(),
    amount: v.float64(),
    EndDate: v.string(),
    StartDate: v.string(),
  })),
  handler: async (ctx) => {
    return await ctx.db.query("events").order("desc").collect();
  },
});

// Get a single event by ID
export const getEvent = query({
  args: { eventId: v.id("events") },
  returns: v.union(
    v.object({
      _id: v.id("events"),
      _creationTime: v.number(),
      name: v.string(),
      isFoodIncluded: v.boolean(),
      amount: v.float64(),
      EndDate: v.string(),
      StartDate: v.string(),
    }),
    v.null()
  ),
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
    EndDate: v.string(),
    StartDate: v.string(),
  },
  returns: v.id("events"),
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
    EndDate: v.optional(v.string()),
    StartDate: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { eventId, ...patch } = args;
    await ctx.db.patch(eventId, patch);
    return null;
  },
});

// Delete an event by ID
export const deleteEvent = mutation({
  args: { eventId: v.id("events") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.delete(args.eventId);
    return null;
  },
});

// Get active events (events that are currently active or upcoming)
export const getActiveEvents = query({
  args: {},
  returns: v.array(v.object({
    _id: v.id("events"),
    _creationTime: v.number(),
    name: v.string(),
    isFoodIncluded: v.boolean(),
    amount: v.float64(),
    EndDate: v.string(),
    StartDate: v.string(),
  })),
  handler: async (ctx) => {
    const now = new Date().toISOString();
    return await ctx.db
      .query("events")
      .filter((q) => q.gte(q.field("EndDate"), now))
      .order("asc")
      .collect();
  },
});