"use node";
import { v } from "convex/values";
import Razorpay from "razorpay";
import { api } from "./_generated/api";
import { action } from "./_generated/server";

export const createRazorpayOrder = action({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    try {
      const key_id = process.env.RAZORPAY_KEY_ID;
      const key_secret = process.env.RAZORPAY_KEY_SECRET;

      if (!key_id || !key_secret) {
        throw new Error("Razorpay API keys are not configured");
      }

      const razorpay = new Razorpay({
        key_id,
        key_secret,
      });

      const event = await ctx.runQuery(api.events.getEvent, {
        eventId: args.eventId,
      });

      if (!event) {
        throw new Error("Event not found");
      }

      const total = event.amount || 0;

      const amountInPaise = Math.round(total * 100);

      const options = {
        amount: amountInPaise,
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
        payment_capture: 1,
      };

      const order = await razorpay.orders.create(options);
      return order;
    } catch (error: unknown) {
      console.error("Error in Razorpay API:", error);
      const err = error as Error & { error?: { description: string } };
      throw new Error(
        `Razorpay order creation failed: ${err.error?.description || err.message}`
      );
    }
  },
});
