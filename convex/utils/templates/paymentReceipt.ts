import { api } from "../../_generated/api";
import { Id } from "../../_generated/dataModel";
import { QueryCtx } from "../../_generated/server";

// Age calculation utility (same as DownloadableReceipt)
function calculateAge(dateOfBirth: string): number {
   const today = new Date();
   const birthDate = new Date(dateOfBirth);
   let age = today.getFullYear() - birthDate.getFullYear();
   const monthDiff = today.getMonth() - birthDate.getMonth();

   if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
   ) {
      age--;
   }

   return age;
}

export async function generatePaymentReceipt(
   ctx: QueryCtx,
   transactionId: string
) {
   const registrationDetails = await ctx.runQuery(
      api.tokens.getRegistrationDetailsByTransactionId,
      { transactionId: transactionId as Id<"transactions"> }
   );

   if (!registrationDetails) return null;

   // Extract data similar to DownloadableReceipt component
   const studentName = registrationDetails.student.name;
   const studentEmail = registrationDetails.student.email;
   const studentPhone = registrationDetails.student.phoneNumber;
   const studentAge = calculateAge(registrationDetails.student.dateOfBirth);
   const batchYear = registrationDetails.student.batchYear;
   const eventName = registrationDetails.event.name;
   const eventStartDate = new Date(registrationDetails.event.StartDate);
   const eventEndDate = new Date(registrationDetails.event.EndDate);
   // const isFoodIncluded = registrationDetails.event.isFoodIncluded; // Not used in this template
   const amount = registrationDetails.transaction.amount;
   const paymentMethod = registrationDetails.transaction.method;
   const paymentStatus = registrationDetails.transaction.status;
   const paymentId = registrationDetails.transaction.paymentId;
   const registrationDate = new Date(registrationDetails.token._creationTime);
   const currencySymbol = "₹";
   const tokenId = registrationDetails.token._id;

   // Generate barcode data - using unique code if available, otherwise token ID
   const barcodeData = registrationDetails.token.uniqueCode || tokenId;
   const barcodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(barcodeData)}`;

   return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Event Registration Receipt</title>
<style>
    .cta-section {
        text-align: center;
        padding: 32px 0;
        border-top: 1px solid #f1f5f9;
    }

    .cta-button {
        display: inline-block;
        background: #991b1b;
        color: #ffffff;
        padding: 12px 24px;
        border-radius: 8px;
        text-decoration: none;
        font-weight: 500;
        font-size: 14px;
        margin: 0 8px 16px;
        transition: background-color 0.2s ease;
    }

    .cta-button:hover {
        background: #7f1d1d;
    }

    .cta-button.secondary {
        background: #ffffff;
        color: #991b1b;
        border: 1px solid #e2e8f0;
    }

    .cta-button.secondary:hover {
        background: #f8fafc;
    }

    @media (max-width: 600px) {
      .cta-button {
          display: block;
          margin: 0 0 12px;
      }
    }
</style>
</head>
<body style="margin:0; padding:20px; font-family:Arial, sans-serif; color:#333; background-color:#fcfcfc;">
  <!-- Header -->
  <div style="max-width:800px; margin:0 auto 20px auto; text-align:left;">
    <h1 style="font-size:24px; font-weight:700; color:#1a1a1a; margin:0 0 6px;">Thanks for your registration, ${studentName.split(" ")[0]}!</h1>
    <p style="font-size:15px; color:#555; margin:0 0 2px;">We've received your event registration and payment.</p>
    <p style="font-size:13px; color:#666; margin:0;">Receipt ID: <strong>${tokenId}</strong></p>
  </div>

  <!-- Main table -->
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%; max-width:800px; background:#ffffff; border:1px solid #ddd; margin:0 auto; border-collapse:collapse;">
    <!-- Title Row -->
    <tr>
      <td style="padding:20px; text-align:center; border-bottom:1px solid #e5e5e5;">
        <h2 style="margin:0; font-size:20px; font-weight:bold; color:#000;">Event Registration Receipt</h2>
      </td>
    </tr>

    <!-- Logo + Payment Status -->
    <tr>
      <td style="padding:20px; border-bottom:1px solid #e5e5e5;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
          <tr>
            <td valign="top" style="width:50%; text-align:left;">
              <img src="https://registration.stgermainalumni.com/_next/image?url=%2FSGA.webp&w=1080&q=75" alt="SGA Logo" style="width:120px; height:60px; display:block; margin-bottom:4px;"/>
            </td>
            <td valign="top" style="width:50%; text-align:right;">
              <div style="margin:0 0 4px; font-size:12px; font-weight:bold; color:#B8860B; display:flex; justify-content:flex-end; align-items:center;">
                <span style="display:inline-block; width:8px; height:8px; background:#B8860B; border-radius:50%; margin-right:6px;"></span>
                ${paymentStatus === "captured" ? "Paid" : "Pending"}
              </div>
              <p style="margin:0; font-size:12px; color:#666;">${registrationDate.toLocaleDateString()}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Student Details + Registration Details -->
    <tr>
      <td style="padding:20px; border-bottom:1px solid #e5e5e5;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
          <tr>
            <td valign="top" style="width:50%; padding-right:10px;">
              <h3 style="margin:0 0 6px; font-size:12px; font-weight:bold; color:#000;">Student Details</h3>
              <p style="margin:0; font-size:15px; font-weight:bold; color:#000;">${studentName}</p>
              <p style="margin:4px 0 0; font-size:12px; color:#666;">Age: ${studentAge} years</p>
              <p style="margin:4px 0 0; font-size:12px; color:#666;">Batch: ${batchYear}</p>
              <p style="margin:4px 0 0; font-size:12px; color:#666;">${studentEmail}</p>
              <p style="margin:4px 0 0; font-size:12px; color:#666;">${studentPhone}</p>
            </td>
            <td valign="top" style="width:50%; padding-left:10px; word-break:break-all;">
              <h3 style="margin:0 0 6px; font-size:12px; font-weight:bold; color:#000;">Registration Details</h3>
              <p style="margin:0 0 4px; font-size:12px; color:#000;">Payment ID: ${paymentId}</p>
              <p style="margin:0; font-size:12px; color:#666;">Token ID: ${tokenId}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Event Information + Barcode -->
    <tr>
      <td style="padding:20px; border-bottom:1px solid #e5e5e5;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
          <tr>
            <td valign="top" style="width:70%;">
              <h3 style="margin:0 0 6px; font-size:12px; font-weight:bold; color:#000;">Event Information</h3>
              <p style="margin:0; font-size:15px; font-weight:bold; color:#000;">${eventName}</p>
         <p style="margin:4px 0 0; font-size:12px; color:#666;">${eventStartDate.toLocaleDateString()} - ${eventEndDate.toLocaleDateString()}</p>
         <p style="margin:4px 0 0; font-size:12px; color:#666;">Food Included: ${registrationDetails.event.isFoodIncluded ? "Yes" : "No"}</p>
            </td>
            <td valign="top" style="width:30%; text-align:right;">
              <div style="text-align:center;">
                <p style="margin:0 0 8px; font-size:10px; color:#666; text-align:center;">Show this barcode for food at counter:</p>
                <img src="${barcodeUrl}" alt="Event Barcode" style="width:100px; height:100px; border:1px solid #ddd;"/>
                <p style="margin:4px 0 0; font-size:8px; color:#999; text-align:center; word-break:break-all;">${barcodeData}</p>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Payment Summary -->
    <tr>
      <td style="padding:20px;">
        <h3 style="margin:0 0 8px; font-size:12px; font-weight:bold; color:#000;">Payment Summary</h3>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
          <tr>
            <td style="font-size:12px; color:#666; padding:4px 0;">Event Registration Fee</td>
            <td style="font-size:12px; color:#000; padding:4px 0; text-align:right;">${currencySymbol}${amount.toFixed(2)}</td>
          </tr>
          <tr style="border-top:1px solid #e5e5e5;">
            <td style="font-size:14px; font-weight:bold; padding:8px 0;">Total Paid</td>
            <td style="font-size:14px; font-weight:bold; padding:8px 0; text-align:right;">${currencySymbol}${amount.toFixed(2)}</td>
          </tr>
          <tr>
            <td style="font-size:12px; color:#666; padding:4px 0;">Payment Method</td>
            <td style="font-size:12px; color:#000; padding:4px 0; text-align:right; text-transform:capitalize;">${paymentMethod}</td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="padding:20px; border-top:1px solid #e5e5e5; text-align:center;">
        <p style="margin:0 0 10px; font-size:12px; color:#666;">Questions? Contact us at support@eventsystem.com</p>
        <p style="margin:0 0 10px;">
          <a href="/terms-conditions" style="font-size:12px; color:#666; text-decoration:none; margin-right:10px;">Terms of Service</a>
          <a href="/cancellation-policy" style="font-size:12px; color:#666; text-decoration:none;">Cancellation Policy</a>
        </p>
        <p style="margin:0; font-size:11px; color:#999;">This receipt was created on ${registrationDate.toLocaleDateString()} and is valid for your records.</p>
      </td>
    </tr>
  </table>

</body>
</html>
   `;
}

// Generate payment confirmation email template for manual payments (UPI/Cash) without QR code
export async function generatePaymentConfirmationEmail(
   ctx: QueryCtx,
   coTransactionId: string
) {
   const registrationDetails = await ctx.runQuery(
      api.tokens.getRegistrationDetailsByCoTransactionId,
      { coTransactionId: coTransactionId as Id<"coTransactions"> }
   );

   if (!registrationDetails) return null;

   // Extract data for payment confirmation
   const studentName = registrationDetails.student.name;
   const studentEmail = registrationDetails.student.email;
   const studentPhone = registrationDetails.student.phoneNumber;
   const studentAge = calculateAge(registrationDetails.student.dateOfBirth);
   const batchYear = registrationDetails.student.batchYear;
   const eventName = registrationDetails.event.name;
   const eventStartDate = new Date(registrationDetails.event.StartDate);
   const eventEndDate = new Date(registrationDetails.event.EndDate);
   const amount = registrationDetails.coTransaction.amount;
   const paymentMethod = registrationDetails.coTransaction.method;
   const paymentStatus = registrationDetails.coTransaction.status;
   const paymentDate = new Date(
      registrationDetails.coTransaction._creationTime
   );
   const currencySymbol = "₹";
   const tokenId = registrationDetails.token._id;

   // Get student photo URL if available
   let studentPhotoUrl: string | null = null;
   if (registrationDetails.student.imageStorageId) {
      studentPhotoUrl = await ctx.storage.getUrl(registrationDetails.student.imageStorageId);
   }

   return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Payment Confirmation - ${eventName}</title>
<style>
    .cta-section {
        text-align: center;
        padding: 32px 0;
        border-top: 1px solid #f1f5f9;
    }

    .cta-button {
        display: inline-block;
        background: #991b1b;
        color: #ffffff;
        padding: 12px 24px;
        border-radius: 8px;
        text-decoration: none;
        font-weight: 500;
        font-size: 14px;
        margin: 0 8px 16px;
        transition: background-color 0.2s ease;
    }

    .cta-button:hover {
        background: #7f1d1d;
    }

    .cta-button.secondary {
        background: #ffffff;
        color: #991b1b;
        border: 1px solid #e2e8f0;
    }

    .cta-button.secondary:hover {
        background: #f8fafc;
    }

    @media (max-width: 600px) {
      .cta-button {
          display: block;
          margin: 0 0 12px;
      }
    }
</style>
</head>
<body style="margin:0; padding:20px; font-family:Arial, sans-serif; color:#333; background-color:#fcfcfc;">
  <!-- Header -->
  <div style="max-width:800px; margin:0 auto 20px auto; text-align:left;">
    <h1 style="font-size:24px; font-weight:700; color:#1a1a1a; margin:0 0 6px;">Payment Confirmed, ${studentName.split(" ")[0]}!</h1>
    <p style="font-size:15px; color:#555; margin:0 0 2px;">Your payment for ${eventName} has been successfully processed.</p>
    <p style="font-size:13px; color:#666; margin:0;">Registration ID: <strong>${tokenId}</strong></p>
  </div>

  <!-- Main table -->
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%; max-width:800px; background:#ffffff; border:1px solid #ddd; margin:0 auto; border-collapse:collapse;">
    <!-- Title Row -->
    <tr>
      <td style="padding:20px; text-align:center; border-bottom:1px solid #e5e5e5;">
        <h2 style="margin:0; font-size:20px; font-weight:bold; color:#000;">Payment Confirmation Receipt</h2>
      </td>
    </tr>

    <!-- Logo + Payment Status -->
    <tr>
      <td style="padding:20px; border-bottom:1px solid #e5e5e5;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
          <tr>
            <td valign="top" style="width:50%; text-align:left;">
              <img src="https://registration.stgermainalumni.com/_next/image?url=%2FSGA.webp&w=1080&q=75" alt="SGA Logo" style="width:120px; height:60px; display:block; margin-bottom:4px;"/>
            </td>
            <td valign="top" style="width:50%; text-align:right;">
              <div style="margin:0 0 4px; font-size:12px; font-weight:bold; color:#10b981; display:flex; justify-content:flex-end; align-items:center;">
                <span style="display:inline-block; width:8px; height:8px; background:#10b981; border-radius:50%; margin-right:6px;"></span>
                ${paymentStatus === "paid" ? "Payment Confirmed" : paymentStatus === "exception" ? "Exception Approved" : "Pending"}
              </div>
              <p style="margin:0; font-size:12px; color:#666;">${paymentDate.toLocaleDateString()}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Student Details + Payment Details -->
    <tr>
      <td style="padding:20px; border-bottom:1px solid #e5e5e5;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
          <tr>
            <td valign="top" style="width:30%; padding-right:15px;">
              ${studentPhotoUrl ? `
                <div style="text-align:center; margin-bottom:10px;">
                  <img src="${studentPhotoUrl}" alt="${studentName}" style="width:80px; height:80px; border-radius:50%; object-fit:cover; border:2px solid #e5e5e5;"/>
                </div>
              ` : ''}
              <h3 style="margin:0 0 6px; font-size:12px; font-weight:bold; color:#000;">Student Details</h3>
              <p style="margin:0; font-size:15px; font-weight:bold; color:#000;">${studentName}</p>
              <p style="margin:4px 0 0; font-size:12px; color:#666;">Age: ${studentAge} years</p>
              <p style="margin:4px 0 0; font-size:12px; color:#666;">Batch: ${batchYear}</p>
              <p style="margin:4px 0 0; font-size:12px; color:#666;">${studentEmail}</p>
              <p style="margin:4px 0 0; font-size:12px; color:#666;">${studentPhone}</p>
            </td>
            <td valign="top" style="width:70%; padding-left:15px; word-break:break-all;">
              <h3 style="margin:0 0 6px; font-size:12px; font-weight:bold; color:#000;">Payment Details</h3>
              <p style="margin:0 0 4px; font-size:12px; color:#000;">Payment Method: ${paymentMethod.toUpperCase()}</p>
              <p style="margin:0; font-size:12px; color:#666;">Registration ID: ${tokenId}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Event Information -->
    <tr>
      <td style="padding:20px; border-bottom:1px solid #e5e5e5;">
        <h3 style="margin:0 0 6px; font-size:12px; font-weight:bold; color:#000;">Event Information</h3>
        <p style="margin:0; font-size:15px; font-weight:bold; color:#000;">${eventName}</p>
        <p style="margin:4px 0 0; font-size:12px; color:#666;">${eventStartDate.toLocaleDateString()} - ${eventEndDate.toLocaleDateString()}</p>
      </td>
    </tr>

    <!-- Payment Summary -->
    <tr>
      <td style="padding:20px;">
        <h3 style="margin:0 0 8px; font-size:12px; font-weight:bold; color:#000;">Payment Summary</h3>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
          <tr>
            <td style="font-size:12px; color:#666; padding:4px 0;">Event Registration Fee</td>
            <td style="font-size:12px; color:#000; padding:4px 0; text-align:right;">${currencySymbol}${amount.toFixed(2)}</td>
          </tr>
          <tr style="border-top:1px solid #e5e5e5;">
            <td style="font-size:14px; font-weight:bold; padding:8px 0;">Total Paid</td>
            <td style="font-size:14px; font-weight:bold; padding:8px 0; text-align:right;">${currencySymbol}${amount.toFixed(2)}</td>
          </tr>
          <tr>
            <td style="font-size:12px; color:#666; padding:4px 0;">Payment Method</td>
            <td style="font-size:12px; color:#000; padding:4px 0; text-align:right; text-transform:capitalize;">${paymentMethod}</td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="padding:20px; border-top:1px solid #e5e5e5; text-align:center;">
        <p style="margin:0 0 10px; font-size:12px; color:#666;">Questions? Contact us at support@eventsystem.com</p>
        <p style="margin:0 0 10px;">
          <a href="/terms-conditions" style="font-size:12px; color:#666; text-decoration:none; margin-right:10px;">Terms of Service</a>
          <a href="/cancellation-policy" style="font-size:12px; color:#666; text-decoration:none;">Cancellation Policy</a>
        </p>
        <p style="margin:0; font-size:11px; color:#999;">This payment confirmation was generated on ${paymentDate.toLocaleDateString()} and is valid for your records.</p>
      </td>
    </tr>
  </table>

</body>
</html>
   `;
}
