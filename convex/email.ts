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

export const sendRegistrationConfirmationEmail = action({
   args: {
      tokenId: v.id("tokens"),
   },
   returns: v.object({
      success: v.boolean(),
      message: v.string(),
   }),
   handler: async (ctx, args) => {
      try {
         // Get token details for unique code
         const token = await ctx.runQuery(api.tokens.simpleTokenById, {
            tokenId: args.tokenId,
         });

         if (!token) {
            return {
               success: false,
               message: "Token not found",
            };
         }

         // Get student details
         const student = await ctx.runQuery(api.students.getStudentById, {
            studentId: token.studentId,
         });

         if (!student) {
            return {
               success: false,
               message: "Student not found",
            };
         }

         // Get event details
         const event = await ctx.runQuery(api.events.getEvent, {
            eventId: token.eventId,
         });

         if (!event) {
            return {
               success: false,
               message: "Event not found",
            };
         }

         // Generate professional HTML email template
         const htmlTemplate = generateRegistrationConfirmationTemplate({
            studentName: student.name,
            eventName: event.name,
            eventStartDate: event.StartDate,
            eventEndDate: event.EndDate,
            eventAmount: event.amount,
            isFoodIncluded: event.isFoodIncluded,
            registrationDate: new Date(token._creationTime),
         });

         const resend = new ResendAPI(process.env.AUTH_RESEND_KEY);
         await resend.emails.send({
            from: "St. Germain Alumni Association <noreply@registration.stgermainalumni.com>",
            to: [student.email],
            subject: `Registration Confirmed - ${event.name}`,
            html: htmlTemplate,
            text: `Dear ${student.name},\n\nThank you for registering for ${event.name}. Your registration has been confirmed. Please complete your payment of ₹${event.amount} at the venue using UPI or cash.\n\nEvent Details:\n- Event: ${event.name}\n- Date: ${new Date(event.StartDate).toLocaleDateString()} - ${new Date(event.EndDate).toLocaleDateString()}\n- Amount: ₹${event.amount}\n\nWe look forward to seeing you at the event!\n\nBest regards,\nSt. Germain Alumni Association`,
         });

         return {
            success: true,
            message: "Registration confirmation email sent successfully",
         };
      } catch (error) {
         console.error("Registration confirmation email failed:", error);
         return {
            success: false,
            message:
               error instanceof Error
                  ? error.message
                  : "Unknown error occurred",
         };
      }
   },
});

// Professional HTML email template generator
function generateRegistrationConfirmationTemplate({
   studentName,
   eventName,
   eventStartDate,
   eventEndDate,
   eventAmount,
   isFoodIncluded,
   registrationDate,
}: {
   studentName: string;
   eventName: string;
   eventStartDate: string;
   eventEndDate: string;
   eventAmount: number;
   isFoodIncluded: boolean;
   registrationDate: Date;
}) {
   const startDate = new Date(eventStartDate);
   const endDate = new Date(eventEndDate);
   const firstName = studentName.split(" ")[0];

   return `
<!DOCTYPE html>
<html lang="en">
<head>
   <meta charset="UTF-8">
   <meta name="viewport" content="width=device-width, initial-scale=1.0">
   <title>Registration Confirmation</title>
   <style>
      body {
         font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
         line-height: 1.6;
         color: #333333;
         background-color: #f8f9fa;
         margin: 0;
         padding: 20px;
      }
      .container {
         max-width: 600px;
         margin: 0 auto;
         background-color: #ffffff;
         border-radius: 8px;
         box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
         overflow: hidden;
      }
      .header {
         background-color: #1e40af;
         color: white;
         padding: 30px 20px;
         text-align: center;
      }
      .header h1 {
         margin: 0;
         font-size: 24px;
         font-weight: 600;
      }
      .content {
         padding: 30px 20px;
      }
      .greeting {
         font-size: 18px;
         margin-bottom: 20px;
         color: #1f2937;
      }
      .confirmation-box {
         background-color: #f0f9ff;
         border: 1px solid #0ea5e9;
         border-radius: 6px;
         padding: 20px;
         margin: 20px 0;
         text-align: center;
      }
      .confirmation-box h2 {
         margin: 0 0 10px 0;
         color: #0369a1;
         font-size: 20px;
      }
      .event-details {
         background-color: #f9fafb;
         border-radius: 6px;
         padding: 20px;
         margin: 20px 0;
      }
      .event-details h3 {
         margin: 0 0 15px 0;
         color: #374151;
         font-size: 16px;
         border-bottom: 1px solid #e5e7eb;
         padding-bottom: 8px;
      }
      .detail-row {
         display: flex;
         justify-content: space-between;
         margin-bottom: 8px;
         font-size: 14px;
      }
      .detail-label {
         color: #6b7280;
         font-weight: 500;
      }
      .detail-value {
         color: #111827;
         font-weight: 600;
      }
      .payment-info {
         background-color: #fef3c7;
         border: 1px solid #f59e0b;
         border-radius: 6px;
         padding: 20px;
         margin: 20px 0;
         text-align: center;
      }
      .payment-info h3 {
         margin: 0 0 10px 0;
         color: #92400e;
         font-size: 16px;
      }
      .amount {
         font-size: 24px;
         font-weight: 700;
         color: #92400e;
         margin: 10px 0;
      }
      .payment-methods {
         font-size: 14px;
         color: #92400e;
         margin-top: 10px;
      }
      .registration-id {
         background-color: #f3f4f6;
         border-radius: 4px;
         padding: 10px;
         margin: 15px 0;
         text-align: center;
         font-family: monospace;
         font-size: 14px;
         color: #374151;
      }
      .footer {
         background-color: #f9fafb;
         padding: 20px;
         text-align: center;
         border-top: 1px solid #e5e7eb;
         font-size: 12px;
         color: #6b7280;
      }
      .contact-info {
         margin: 15px 0;
         font-size: 14px;
         color: #6b7280;
      }
      .highlight {
         color: #1e40af;
         font-weight: 600;
      }
   </style>
</head>
<body>
   <div class="container">
      <div class="header">
         <h1>Registration Confirmed</h1>
      </div>
      
      <div class="content">
         <div class="greeting">
            Dear ${firstName},
         </div>
         
         <div class="confirmation-box">
            <h2>✅ Registration Successful</h2>
            <p>Thank you for registering for <span class="highlight">${eventName}</span>. Your registration has been confirmed and we're excited to see you at the event!</p>
         </div>
         
         <div class="event-details">
            <h3>Event Information</h3>
            <div class="detail-row">
               <span class="detail-label">Event Name:</span>
               <span class="detail-value">${eventName}</span>
            </div>
            <div class="detail-row">
               <span class="detail-label">Start Date:</span>
               <span class="detail-value">${startDate.toLocaleDateString(
                  "en-IN",
                  {
                     weekday: "long",
                     year: "numeric",
                     month: "long",
                     day: "numeric",
                  }
               )}</span>
            </div>
            <div class="detail-row">
               <span class="detail-label">End Date:</span>
               <span class="detail-value">${endDate.toLocaleDateString(
                  "en-IN",
                  {
                     weekday: "long",
                     year: "numeric",
                     month: "long",
                     day: "numeric",
                  }
               )}</span>
            </div>
            <div class="detail-row">
               <span class="detail-label">Food Included:</span>
               <span class="detail-value">${isFoodIncluded ? "Yes" : "No"}</span>
            </div>
            <div class="detail-row">
               <span class="detail-label">Registration Date:</span>
               <span class="detail-value">${registrationDate.toLocaleDateString("en-IN")}</span>
            </div>
         </div>
         
         <div class="payment-info">
            <h3>Payment Required</h3>
            <div class="amount">₹${eventAmount}</div>
            <p>Please complete your payment at the venue using:</p>
            <div class="payment-methods">
               <strong>• UPI Payment</strong><br>
               <strong>• Cash Payment</strong>
            </div>
         </div>
         
         
         <div class="contact-info">
            <p><strong>Important:</strong> Please bring a valid ID proof and this registration confirmation email to the event venue.</p>
            <p>If you have any questions or need assistance, please contact our support team.</p>
         </div>
      </div>
      
      <div class="footer">
         <p>Best regards,<br><strong>St. Germain Alumni Association</strong></p>
         <p>This is an automated message. Please do not reply to this email.</p>
      </div>
   </div>
</body>
</html>
   `;
}
