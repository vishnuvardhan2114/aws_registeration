"use node";

import { v } from "convex/values";
import { api } from "./_generated/api";
import { action } from "./_generated/server";

// If using the Razorpay SDK in Node runtime:
import crypto from "crypto";
import Razorpay from "razorpay";
import { Id } from "./_generated/dataModel";

/**
 * Public action: Create a Razorpay order for an event.
 * External API call lives in an action. Reads event via runQuery.
 */
export const createRazorpayOrder = action({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_id || !key_secret) {
      throw new Error("Razorpay API keys are not configured");
    }

    // Read event from DB via internal query
    const event = await ctx.runQuery(api.events.getEvent, {
      eventId: args.eventId,
    });
    if (!event) throw new Error("Event not found");

    const total = event.amount ?? 0;
    const amountInPaise = Math.round(total * 100);

    const razorpay = new Razorpay({ key_id, key_secret });
    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1,
    };
    const order = await razorpay.orders.create(options);

    return order;
  },
});

/**
 * Internal action: Fetch payment from Razorpay and insert transaction.
 * Runs only after the mutation commits (scheduled).
 */
export const createTransaction = action({
  args: {
    paymentId: v.string(),
    orderId: v.string(),
    eventId: v.id("events"),
    signature: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const key_id = process.env.RAZORPAY_KEY_ID;
      const key_secret = process.env.RAZORPAY_KEY_SECRET;
      if (!key_id || !key_secret) {
        throw new Error("Razorpay API keys are not configured");
      }

      const body = args.orderId + "|" + args.paymentId;
      const expectedSignature = crypto
        .createHmac("sha256", key_secret)
        .update(body.toString())
        .digest("hex");

      if (expectedSignature !== args.signature) {
        throw new Error("Payment signature verification failed");
      }

      const razorpay = new Razorpay({ key_id, key_secret });

      // External network call happens here (OK in an action)
      const payment = await razorpay.payments.fetch(args.paymentId);

      const transactionToInsert = {
        paymentId: payment.id,
        orderId: payment.order_id,
        amount: Number(payment.amount) / 100,
        currency: payment.currency,
        status: payment.status,
        method: payment.method,
        bank: payment.bank || undefined,
        wallet: payment.wallet || undefined,
        vpa: payment.vpa || undefined,
        email: payment.email,
        contact: payment.contact as string,
        fee: payment.fee,
        tax: payment.tax,
        created_at: new Date(payment.created_at * 1000).toISOString(),
        rawResponse: payment,
      };

      
      const transactionInserted: Id<"transactions"> = await ctx.runMutation(
        api.transactions.insertTransaction,
        {
          ...transactionToInsert,
        }
      );
      
      return transactionInserted;
    } catch (error) {
      throw new Error(`Failed to fetch/insert transaction: ${error}`);
    }
  },
});
