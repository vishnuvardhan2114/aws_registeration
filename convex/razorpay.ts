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
      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
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
        transfers: [
          {
            account: "acc_Qqt7zwC7Btmg1p",
            amount: amountInPaise,
            currency: "INR",
            notes: {
              purpose: "Visa application via Getavisa",
            },
            on_hold: false,
          },
        ],
      };

      const order = await razorpay.orders.create(options);
      console.log("order from razorpay", order);
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
