import { v } from "convex/values";
import { api } from "./_generated/api";
import { action } from "./_generated/server";
import { Resend as ResendAPI } from "resend";

export const sendReceiptEmail = action({
   args: {
      email: v.string(),
      studentName: v.string(),
      eventName: v.string(),
      transactionId: v.id("transactions"),
   },
   returns: v.object({
      success: v.boolean(),
      transactionId: v.id("transactions"),
      message: v.string(),
   }),
   handler: async (ctx, args) => {
      try {
         // Get registration details from database using transaction ID
         const registrationDetails = await ctx.runQuery(
            api.tokens.getRegistrationDetailsByTransactionId,
            { transactionId: args.transactionId }
         );

         if (!registrationDetails) {
            return {
               success: false,
               transactionId: args.transactionId,
               message: "Registration details not found",
            };
         }

         // Generate the HTML receipt template
         const htmlTemplate = await ctx.runQuery(
            api.transactions.getPaymentReceipt,
            {
               transactionId: args.transactionId,
            }
         );

         if (!htmlTemplate) {
            return {
               success: false,
               transactionId: args.transactionId,
               message: "Failed to generate receipt template",
            };
         }

         // Get student email and name from database
         const studentEmail = registrationDetails.student.email;

         const resend = new ResendAPI(process.env.AUTH_RESEND_KEY);
         await resend.emails.send({
            from: "Event Registration <noreply@registration.stgermainalumni.com>",
            to: [studentEmail],
            subject: `Payment Confirmed - ${registrationDetails.event.name} Registration Receipt`,
            html: htmlTemplate,
            text: `Thank you for your registration to ${registrationDetails.event.name}! Your payment has been confirmed. Please check the attached receipt for details.`,
         });

         return {
            success: true,
            transactionId: args.transactionId,
            message: "Receipt email sent successfully",
         };
      } catch (error) {
         console.error("Email sending failed:", error);
         return {
            success: false,
            transactionId: args.transactionId,
            message:
               error instanceof Error
                  ? error.message
                  : "Unknown error occurred",
         };
      }
   },
});
