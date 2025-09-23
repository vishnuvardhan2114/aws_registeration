"use node";

import { v } from "convex/values";
import { api } from "./_generated/api";
import { action } from "./_generated/server";
import { Resend as ResendAPI } from "resend";

/**
 * Send donation receipt email
 */
export const sendDonationReceiptEmail = action({
  args: {
    donationId: v.id("donations"),
  },
  returns: v.object({
    success: v.boolean(),
    donationId: v.id("donations"),
    message: v.string(),
  }),
  handler: async (ctx, args) => {
    try {
      // Get donation details
      const donation = await ctx.runQuery(api.donations.getDonation, {
        donationId: args.donationId,
      });

      if (!donation) {
        return {
          success: false,
          donationId: args.donationId,
          message: "Donation not found",
        };
      }

      if (donation.status !== "captured") {
        return {
          success: false,
          donationId: args.donationId,
          message: "Donation payment not completed",
        };
      }

      if (donation.receiptSent) {
        return {
          success: false,
          donationId: args.donationId,
          message: "Receipt already sent",
        };
      }

      // Generate donation receipt HTML
      const htmlTemplate = await ctx.runQuery(
        api.donations.getDonationReceipt,
        { donationId: args.donationId }
      );

      if (!htmlTemplate) {
        return {
          success: false,
          donationId: args.donationId,
          message: "Failed to generate receipt template",
        };
      }

      const resend = new ResendAPI(process.env.AUTH_RESEND_KEY);
      
      const emailResult = await resend.emails.send({
        from: "SGA Donations <noreply@registration.stgermainalumni.com>",
        to: [donation.donorEmail],
        subject: `Thank You for Your Donation - Receipt #${donation.paymentId}`,
        html: htmlTemplate,
        text: `Thank you for your generous donation of ₹${donation.amount} to ${donation.category?.name || 'our organization'}. Your support makes a difference!`,
      });

      if (emailResult.error) {
        throw new Error(`Email sending failed: ${emailResult.error.message}`);
      }

      // Mark receipt as sent
      await ctx.runMutation(api.donations.markReceiptSent, {
        donationId: args.donationId,
        receiptEmail: donation.donorEmail,
      });

      return {
        success: true,
        donationId: args.donationId,
        message: "Donation receipt sent successfully",
      };
    } catch (error) {
      console.error("Donation receipt email failed:", error);
      return {
        success: false,
        donationId: args.donationId,
        message: error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  },
});

/**
 * Send donation thank you email (immediate response)
 */
export const sendDonationThankYouEmail = action({
  args: {
    donationId: v.id("donations"),
  },
  returns: v.object({
    success: v.boolean(),
    donationId: v.id("donations"),
    message: v.string(),
  }),
  handler: async (ctx, args) => {
    try {
      const donation = await ctx.runQuery(api.donations.getDonation, {
        donationId: args.donationId,
      });

      if (!donation) {
        return {
          success: false,
          donationId: args.donationId,
          message: "Donation not found",
        };
      }

      const resend = new ResendAPI(process.env.AUTH_RESEND_KEY);
      
      const thankYouHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Thank You for Your Donation</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .amount { font-size: 2em; font-weight: bold; color: #2ecc71; }
            .category { background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 0.9em; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🙏 Thank You for Your Generous Donation!</h1>
            </div>
            <div class="content">
              <p>Dear ${donation.donorName},</p>
              
              <p>We are deeply grateful for your generous donation of <span class="amount">₹${donation.amount}</span> to support our cause.</p>
              
              <div class="category">
                <strong>Donation Category:</strong> ${donation.category?.name || 'General Donation'}<br>
                ${donation.customPurpose ? `<strong>Purpose:</strong> ${donation.customPurpose}` : ''}
              </div>
              
              <p>Your contribution will make a meaningful difference and help us continue our important work. We truly appreciate your support and belief in our mission.</p>
              
              <p>A detailed receipt will be sent to your email shortly for your records.</p>
              
              <p>With heartfelt gratitude,<br>
              <strong>The SGA Team</strong></p>
            </div>
            <div class="footer">
              <p>This is an automated message. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      await resend.emails.send({
        from: "SGA Donations <noreply@registration.stgermainalumni.com>",
        to: [donation.donorEmail],
        subject: "Thank You for Your Generous Donation! 🙏",
        html: thankYouHtml,
        text: `Thank you for your generous donation of ₹${donation.amount} to ${donation.category?.name || 'our organization'}. Your support makes a difference!`,
      });

      return {
        success: true,
        donationId: args.donationId,
        message: "Thank you email sent successfully",
      };
    } catch (error) {
      console.error("Thank you email failed:", error);
      return {
        success: false,
        donationId: args.donationId,
        message: error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  },
});

/**
 * Resend donation receipt email
 */
export const resendDonationReceipt = action({
  args: {
    donationId: v.id("donations"),
  },
  returns: v.object({
    success: v.boolean(),
    donationId: v.id("donations"),
    message: v.string(),
  }),
  handler: async (ctx, args) => {
    try {
      // Reset receipt sent status to allow resending
      await ctx.runMutation(api.donations.markReceiptSent, {
        donationId: args.donationId,
        receiptEmail: "",
      });

      // Send the receipt email
      const result = await ctx.runAction(api.donationEmail.sendDonationReceiptEmail, {
        donationId: args.donationId,
      });

      return result;
    } catch (error) {
      console.error("Resend donation receipt failed:", error);
      return {
        success: false,
        donationId: args.donationId,
        message: error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  },
});
