// convex/transactions.ts
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { generatePaymentReceipt } from "./utils/templates/paymentReceipt";
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

export const getTransactionById = query({
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
  }), v.null()),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.transactionId);
  },
});

export const getAllTransactions = query({
  args: {},
  returns: v.array(v.object({
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
  })),
  handler: async (ctx) => {
    return await ctx.db.query("transactions").order("desc").collect();
  },
});




export const getPaymentReceipt = query({
  args: {
    transactionId: v.id("transactions"),
  },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, args) => {
    const htmlReceiptLayout = await generatePaymentReceipt(ctx, args.transactionId);
    return htmlReceiptLayout;
  },
});