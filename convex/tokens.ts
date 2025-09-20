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

// Get token by transaction ID
export const getTokenByTransactionId = query({
  args: {
    transactionId: v.id("transactions"),
  },
  returns: v.union(v.object({
    _id: v.id("tokens"),
    _creationTime: v.number(),
    transactionId: v.id("transactions"),
    eventId: v.id("events"),
    studentId: v.id("students"),
    isUsed: v.boolean(),
  }), v.null()),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tokens")
      .filter((q) => q.eq(q.field("transactionId"), args.transactionId))
      .unique();
  },
});

// Get comprehensive registration details by transaction ID
export const getRegistrationDetailsByTransactionId = query({
  args: {
    transactionId: v.id("transactions"),
  },
  returns: v.union(v.object({
    // Token details
    token: v.object({
      _id: v.id("tokens"),
      _creationTime: v.number(),
      transactionId: v.id("transactions"),
      eventId: v.id("events"),
      studentId: v.id("students"),
      isUsed: v.boolean(),
    }),
    // Transaction details
    transaction: v.object({
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
    }),
    // Event details
    event: v.object({
      _id: v.id("events"),
      _creationTime: v.number(),
      name: v.string(),
      isFoodIncluded: v.boolean(),
      amount: v.number(),
      EndDate: v.string(),
      StartDate: v.string(),
    }),
    // Student details
    student: v.object({
      _id: v.id("students"),
      _creationTime: v.number(),
      name: v.string(),
      email: v.string(),
      phoneNumber: v.string(),
      dateOfBirth: v.string(),
      imageStorageId: v.optional(v.id("_storage")),
      imageUrl: v.optional(v.string()),
      batchYear: v.number(),
    }),
  }), v.null()),
  handler: async (ctx, args) => {
    // First get the token by transaction ID
    const token = await ctx.db
      .query("tokens")
      .filter((q) => q.eq(q.field("transactionId"), args.transactionId))
      .unique();

    if (!token) {
      return null;
    }

    // Get transaction details
    const transaction = await ctx.db.get(args.transactionId);
    if (!transaction) {
      return null;
    }

    // Get event details
    const event = await ctx.db.get(token.eventId);
    if (!event) {
      return null;
    }

    // Get student details
    const student = await ctx.db.get(token.studentId);
    if (!student) {
      return null;
    }

    // Resolve student image URL if storage ID exists
    let imageUrl: string | undefined = undefined;
    if (student.imageStorageId) {
      const url = await ctx.storage.getUrl(student.imageStorageId);
      imageUrl = url || undefined;
    }

    return {
      token,
      transaction,
      event,
      student: {
        ...student,
        imageUrl,
      },
    };
  },
});

// Get comprehensive registration details by token ID
export const getRegistrationDetailsByTokenId = query({
  args: {
    tokenId: v.id("tokens"),
  },
  returns: v.union(v.object({
    // Token details
    token: v.object({
      _id: v.id("tokens"),
      _creationTime: v.number(),
      transactionId: v.id("transactions"),
      eventId: v.id("events"),
      studentId: v.id("students"),
      isUsed: v.boolean(),
    }),
    // Transaction details
    transaction: v.object({
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
    }),
    // Event details
    event: v.object({
      _id: v.id("events"),
      _creationTime: v.number(),
      name: v.string(),
      isFoodIncluded: v.boolean(),
      amount: v.number(),
      EndDate: v.string(),
      StartDate: v.string(),
    }),
    // Student details
    student: v.object({
      _id: v.id("students"),
      _creationTime: v.number(),
      name: v.string(),
      email: v.string(),
      phoneNumber: v.string(),
      dateOfBirth: v.string(),
      imageStorageId: v.optional(v.id("_storage")),
      imageUrl: v.optional(v.string()),
      batchYear: v.number(),
    }),
  }), v.null()),
  handler: async (ctx, args) => {
    // First get the token by ID
    const token = await ctx.db.get(args.tokenId);
    if (!token) {
      return null;
    }

    // Get transaction details
    const transaction = await ctx.db.get(token.transactionId);
    if (!transaction) {
      return null;
    }

    // Get event details
    const event = await ctx.db.get(token.eventId);
    if (!event) {
      return null;
    }

    // Get student details
    const student = await ctx.db.get(token.studentId);
    if (!student) {
      return null;
    }

    // Resolve student image URL if storage ID exists
    let imageUrl: string | undefined = undefined;
    if (student.imageStorageId) {
      const url = await ctx.storage.getUrl(student.imageStorageId);
      imageUrl = url || undefined;
    }

    return {
      token,
      transaction,
      event,
      student: {
        ...student,
        imageUrl,
      },
    };
  },
});

