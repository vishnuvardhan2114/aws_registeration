"use node";

import { v } from "convex/values";
import { api } from "./_generated/api";
import { action } from "./_generated/server";
import crypto from "crypto";
import Razorpay from "razorpay";

/**
 * Create a Razorpay order for donation
 */
export const createDonationRazorpayOrder = action({
  args: {
    donationId: v.id("donations"),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    
    if (!key_id || !key_secret) {
      throw new Error("Razorpay API keys are not configured");
    }

    // Get donation details
    const donation = await ctx.runQuery(api.donations.getDonation, {
      donationId: args.donationId,
    });

    if (!donation) {
      throw new Error("Donation not found");
    }

    if (donation.status !== "pending") {
      throw new Error("Donation is not in pending state");
    }

    const amountInPaise = Math.round(args.amount * 100);

    // Generate a short receipt ID (max 20 characters)
    const receiptId = `don_${donation._id.slice(-6)}_${Date.now().toString().slice(-4)}`;
    const razorpay = new Razorpay({ key_id, key_secret });
    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: receiptId,
      payment_capture: 1,
      notes: {
        donationId: donation._id,
        donorName: donation.donorName,
        donorEmail: donation.donorEmail,
        categoryId: donation.categoryId,
      },
    };

    try {
      const order = await razorpay.orders.create(options);
      return order;
    } catch (error) {
      console.error("Razorpay order creation failed:", error);
      throw new Error(`Failed to create payment order: ${error}`);
    }
  },
});

/**
 * Process donation payment and update donation record
 */
export const processDonationPayment = action({
  args: {
    donationId: v.id("donations"),
    paymentId: v.string(),
    orderId: v.string(),
    signature: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const key_id = process.env.RAZORPAY_KEY_ID;
      const key_secret = process.env.RAZORPAY_KEY_SECRET;
      
      if (!key_id || !key_secret) {
        throw new Error("Razorpay API keys are not configured");
      }

      // Verify payment signature
      const body = args.orderId + "|" + args.paymentId;
      const expectedSignature = crypto
        .createHmac("sha256", key_secret)
        .update(body.toString())
        .digest("hex");

      if (expectedSignature !== args.signature) {
        throw new Error("Payment signature verification failed");
      }

      const razorpay = new Razorpay({ key_id, key_secret });

      // Fetch payment details from Razorpay
      const payment = await razorpay.payments.fetch(args.paymentId);

      // Update donation with payment details
      await ctx.runMutation(api.donations.updateDonationPayment, {
        donationId: args.donationId,
        paymentId: payment.id,
        orderId: payment.order_id,
        status: payment.status,
        method: payment.method,
        bank: payment.bank || undefined,
        wallet: payment.wallet || undefined,
        vpa: payment.vpa || undefined,
        fee: payment.fee || 0,
        tax: payment.tax || 0,
        rawResponse: payment,
      });

      // Send receipt email if payment is successful
      if (payment.status === "captured") {
        try {
          await ctx.runAction(api.donationEmail.sendDonationReceiptEmail, {
            donationId: args.donationId,
          });
        } catch (emailError) {
          console.error("Failed to send donation receipt email:", emailError);
          // Don't fail the payment process if email fails
        }
      }

      return {
        success: true,
        donationId: args.donationId,
        paymentStatus: payment.status,
      };
    } catch (error) {
      console.error("Donation payment processing failed:", error);
      throw new Error(`Failed to process donation payment: ${error}`);
    }
  },
});

/**
 * Verify donation payment status
 */
export const verifyDonationPayment = action({
  args: {
    donationId: v.id("donations"),
  },
  handler: async (ctx, args) => {
    const donation = await ctx.runQuery(api.donations.getDonation, {
      donationId: args.donationId,
    });

    if (!donation) {
      throw new Error("Donation not found");
    }

    if (!donation.paymentId) {
      return { status: "pending", message: "Payment not initiated" };
    }

    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    
    if (!key_id || !key_secret) {
      throw new Error("Razorpay API keys are not configured");
    }

    try {
      const razorpay = new Razorpay({ key_id, key_secret });
      const payment = await razorpay.payments.fetch(donation.paymentId);

      // Update donation status if it has changed
      if (payment.status !== donation.status) {
        await ctx.runMutation(api.donations.updateDonationPayment, {
          donationId: args.donationId,
          paymentId: donation.paymentId,
          orderId: donation.orderId,
          status: payment.status,
          method: donation.method,
          bank: donation.bank,
          wallet: donation.wallet,
          vpa: donation.vpa,
          fee: donation.fee,
          tax: donation.tax,
          rawResponse: payment,
        });
      }

      return {
        status: payment.status,
        method: payment.method,
      };
    } catch (error) {
      console.error("Payment verification failed:", error);
      throw new Error(`Failed to verify payment: ${error}`);
    }
  },
});
