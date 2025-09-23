import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { api } from "./_generated/api";

/**
 * Get all donations with pagination (admin use)
 */
export const getDonations = query({
   args: {
      limit: v.optional(v.number()),
      cursor: v.optional(v.string()),
   },
   handler: async (ctx, args) => {
      const limit = args.limit || 50;
      const donations = await ctx.db
         .query("donations")
         .order("desc")
         .take(limit);

       // Get category information for each donation
       const donationsWithCategories = await Promise.all(
          donations.map(async (donation) => {
             const category = donation.categoryId ? await ctx.db.get(donation.categoryId) : null;
             return {
                ...donation,
                category,
             };
          })
       );

      return donationsWithCategories;
   },
});

/**
 * Get donations by category
 */
export const getDonationsByCategory = query({
   args: {
      categoryId: v.id("donationCategories"),
      limit: v.optional(v.number()),
   },
   handler: async (ctx, args) => {
      const limit = args.limit || 50;
      const donations = await ctx.db
         .query("donations")
         .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
         .order("desc")
         .take(limit);

      return donations;
   },
});

/**
 * Get donation statistics
 */
export const getDonationStats = query({
   args: {},
   handler: async (ctx) => {
      const donations = await ctx.db.query("donations").collect();
      const categories = await ctx.db.query("donationCategories").collect();

      const successfulDonations = donations.filter(
         (d) => d.status === "captured"
      );

      const totalAmount = successfulDonations.reduce(
         (sum, d) => sum + d.amount,
         0
      );
      const totalCount = successfulDonations.length;

      // Calculate monthly stats
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const monthlyDonations = successfulDonations.filter(
         (d) => new Date(d._creationTime) >= thirtyDaysAgo
      );
      const weeklyDonations = successfulDonations.filter(
         (d) => new Date(d._creationTime) >= sevenDaysAgo
      );
      const dailyDonations = successfulDonations.filter(
         (d) => new Date(d._creationTime) >= oneDayAgo
      );

      const monthlyAmount = monthlyDonations.reduce(
         (sum, d) => sum + d.amount,
         0
      );
      const weeklyAmount = weeklyDonations.reduce(
         (sum, d) => sum + d.amount,
         0
      );
      const dailyAmount = dailyDonations.reduce((sum, d) => sum + d.amount, 0);

       // Category breakdown
       const categoryStats = categories
          .map((category) => {
             const categoryDonations = successfulDonations.filter(
                (d) => d.categoryId === category._id
             );
             const categoryAmount = categoryDonations.reduce(
                (sum, d) => sum + d.amount,
                0
             );

             return {
                categoryId: category._id,
                categoryName: category.name,
                count: categoryDonations.length,
                amount: categoryAmount,
                percentage:
                   totalAmount > 0 ? (categoryAmount / totalAmount) * 100 : 0,
             };
          })
          .sort((a, b) => b.amount - a.amount);

       // Add "Others" category for donations without a specific category
       const othersDonations = successfulDonations.filter(d => !d.categoryId);
       const othersAmount = othersDonations.reduce((sum, d) => sum + d.amount, 0);
       
       if (othersDonations.length > 0) {
          categoryStats.push({
             categoryId: null,
             categoryName: "Others",
             count: othersDonations.length,
             amount: othersAmount,
             percentage: totalAmount > 0 ? (othersAmount / totalAmount) * 100 : 0,
          });
       }

      return {
         totalAmount,
         totalCount,
         monthlyAmount,
         weeklyAmount,
         dailyAmount,
         monthlyCount: monthlyDonations.length,
         weeklyCount: weeklyDonations.length,
         dailyCount: dailyDonations.length,
         categoryStats,
         averageDonation: totalCount > 0 ? totalAmount / totalCount : 0,
      };
   },
});

/**
 * Get a specific donation by ID
 */
export const getDonation = query({
   args: { donationId: v.id("donations") },
   handler: async (ctx, args) => {
      const donation = await ctx.db.get(args.donationId);
      if (!donation) return null;

      const category = donation.categoryId ? await ctx.db.get(donation.categoryId) : null;
      return {
         ...donation,
         category,
      };
   },
});

/**
 * Get donation by payment ID
 */
export const getDonationByPaymentId = query({
   args: { paymentId: v.string() },
   handler: async (ctx, args) => {
      const donation = await ctx.db
         .query("donations")
         .withIndex("by_paymentId", (q) => q.eq("paymentId", args.paymentId))
         .first();

      if (!donation) return null;

      const category = donation.categoryId ? await ctx.db.get(donation.categoryId) : null;
      return {
         ...donation,
         category,
      };
   },
});

/**
 * Create a new donation record
 */
export const createDonation = mutation({
   args: {
      donorName: v.string(),
      donorEmail: v.string(),
      donorPhone: v.optional(v.string()),
      amount: v.number(),
      categoryId: v.optional(v.id("donationCategories")),
      customPurpose: v.optional(v.string()),
      isAnonymous: v.optional(v.boolean()),
      ipAddress: v.optional(v.string()),
      userAgent: v.optional(v.string()),
      referrer: v.optional(v.string()),
   },
   handler: async (ctx, args) => {
      // Validate category exists and is active (only if categoryId is provided)
      if (args.categoryId) {
         const category = await ctx.db.get(args.categoryId);
         if (!category || !category.isActive) {
            throw new Error("Invalid or inactive donation category");
         }

         // Validate amount if category has limits
         if (category.minAmount && args.amount < category.minAmount) {
            throw new Error(`Minimum donation amount is ₹${category.minAmount}`);
         }
         if (category.maxAmount && args.amount > category.maxAmount) {
            throw new Error(`Maximum donation amount is ₹${category.maxAmount}`);
         }
      }

      const donationId = await ctx.db.insert("donations", {
         donorName: args.donorName,
         donorEmail: args.donorEmail,
         donorPhone: args.donorPhone,
         amount: args.amount,
         currency: "INR",
         paymentId: "", // Will be updated after payment
         orderId: "", // Will be updated after payment
         status: "pending",
         method: "",
         fee: 0,
         tax: 0,
         created_at: new Date().toISOString(),
         rawResponse: {},
         categoryId: args.categoryId,
         customPurpose: args.customPurpose,
         isAnonymous: args.isAnonymous || false,
         receiptSent: false,
         ipAddress: args.ipAddress,
         userAgent: args.userAgent,
         referrer: args.referrer,
      });

      return donationId;
   },
});

/**
 * Update donation with payment details
 */
export const updateDonationPayment = mutation({
   args: {
      donationId: v.id("donations"),
      paymentId: v.string(),
      orderId: v.string(),
      status: v.string(),
      method: v.string(),
      bank: v.optional(v.string()),
      wallet: v.optional(v.string()),
      vpa: v.optional(v.string()),
      fee: v.number(),
      tax: v.number(),
      rawResponse: v.any(),
   },
   handler: async (ctx, args) => {
      const { donationId, ...updateData } = args;

      await ctx.db.patch(donationId, updateData);
      return donationId;
   },
});

/**
 * Mark donation receipt as sent
 */
export const markReceiptSent = mutation({
   args: {
      donationId: v.id("donations"),
      receiptEmail: v.optional(v.string()),
   },
   handler: async (ctx, args) => {
      await ctx.db.patch(args.donationId, {
         receiptSent: true,
         receiptEmail: args.receiptEmail,
         receiptSentAt: Date.now(),
      });
      return args.donationId;
   },
});

/**
 * Get recent donations for dashboard
 */
export const getRecentDonations = query({
   args: { limit: v.optional(v.number()) },
   handler: async (ctx, args) => {
      const limit = args.limit || 10;
      const donations = await ctx.db
         .query("donations")
         .order("desc")
         .take(limit);

       const donationsWithCategories = await Promise.all(
          donations.map(async (donation) => {
             const category = donation.categoryId ? await ctx.db.get(donation.categoryId) : null;
             return {
                ...donation,
                category,
             };
          })
       );

      return donationsWithCategories;
   },
});

/**
 * Get donations that need receipt (failed email sends)
 */
export const getDonationsNeedingReceipt = query({
   args: {},
   handler: async (ctx) => {
      const donations = await ctx.db
         .query("donations")
         .withIndex("by_receiptSent", (q) => q.eq("receiptSent", false))
         .filter((q) => q.eq(q.field("status"), "captured"))
         .collect();

      return donations;
   },
});

/**
 * Generate donation receipt HTML template
 */
export const getDonationReceipt = query({
   args: { donationId: v.id("donations") },
   handler: async (ctx, args) => {
      const donation = await ctx.runQuery(api.donations.getDonation, {
         donationId: args.donationId,
      });

      if (!donation) return null;

      const donationDate = new Date(donation._creationTime);
      const formattedDate = donationDate.toLocaleDateString("en-IN", {
         year: "numeric",
         month: "long",
         day: "numeric",
      });

      const formattedTime = donationDate.toLocaleTimeString("en-IN", {
         hour: "2-digit",
         minute: "2-digit",
      });

      return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Donation Receipt</title>
<style>
    .cta-section {
        text-align: center;
        padding: 32px 0;
        border-top: 1px solid #f1f5f9;
    }

    .cta-button {
        display: inline-block;
        background: #10b981;
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
        background: #059669;
    }

    .cta-button.secondary {
        background: #ffffff;
        color: #10b981;
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
    <h1 style="font-size:24px; font-weight:700; color:#1a1a1a; margin:0 0 6px;">Thank you for your generous donation, ${donation.isAnonymous ? "Anonymous Donor" : donation.donorName.split(" ")[0]}!</h1>
    <p style="font-size:15px; color:#555; margin:0 0 2px;">We've received your donation and payment confirmation.</p>
    <p style="font-size:13px; color:#666; margin:0;">Receipt ID: <strong>${donation.paymentId}</strong></p>
  </div>

  <!-- Main table -->
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%; max-width:800px; background:#ffffff; border:1px solid #ddd; margin:0 auto; border-collapse:collapse;">
    <!-- Title Row -->
    <tr>
      <td style="padding:20px; text-align:center; border-bottom:1px solid #e5e5e5;">
        <h2 style="margin:0; font-size:20px; font-weight:bold; color:#000;">Donation Receipt</h2>
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
                Donation Successful
              </div>
              <p style="margin:0; font-size:12px; color:#666;">${formattedDate}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Donor Details + Donation Details -->
    <tr>
      <td style="padding:20px; border-bottom:1px solid #e5e5e5;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
          <tr>
            <td valign="top" style="width:50%; padding-right:10px;">
              <h3 style="margin:0 0 6px; font-size:12px; font-weight:bold; color:#000;">Donor Information</h3>
              <p style="margin:0; font-size:15px; font-weight:bold; color:#000;">${donation.isAnonymous ? "Anonymous Donor" : donation.donorName}</p>
              <p style="margin:4px 0 0; font-size:12px; color:#666;">${donation.donorEmail}</p>
              ${donation.donorPhone ? `<p style="margin:4px 0 0; font-size:12px; color:#666;">${donation.donorPhone}</p>` : ""}
            </td>
            <td valign="top" style="width:50%; padding-left:10px; word-break:break-all;">
              <h3 style="margin:0 0 6px; font-size:12px; font-weight:bold; color:#000;">Donation Details</h3>
              <p style="margin:0 0 4px; font-size:12px; color:#000;">Payment ID: ${donation.paymentId}</p>
              <p style="margin:0; font-size:12px; color:#666;">Time: ${formattedTime}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Donation Category + Purpose -->
    <tr>
      <td style="padding:20px; border-bottom:1px solid #e5e5e5;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
          <tr>
            <td valign="top" style="width:70%;">
              <h3 style="margin:0 0 6px; font-size:12px; font-weight:bold; color:#000;">Donation Category</h3>
              <p style="margin:0; font-size:15px; font-weight:bold; color:#000;">${donation.category?.name || (donation.customPurpose ? "Others" : "General Donation")}</p>
              ${donation.customPurpose ? `<p style="margin:4px 0 0; font-size:12px; color:#666;">Purpose: ${donation.customPurpose}</p>` : ""}
            </td>
            <td valign="top" style="width:30%; text-align:right;">
              <div style="text-align:center;">
                <div style="width:100px; height:100px; background:#f0fdf4; border:2px solid #10b981; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto;">
                  <span style="font-size:24px; color:#10b981;">💚</span>
                </div>
                <p style="margin:4px 0 0; font-size:10px; color:#10b981; text-align:center; font-weight:bold;">GENEROUS DONATION</p>
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
            <td style="font-size:12px; color:#666; padding:4px 0;">Donation Amount</td>
            <td style="font-size:12px; color:#000; padding:4px 0; text-align:right;">₹${donation.amount.toFixed(2)}</td>
          </tr>
          <tr style="border-top:1px solid #e5e5e5;">
            <td style="font-size:14px; font-weight:bold; padding:8px 0;">Total Donated</td>
            <td style="font-size:14px; font-weight:bold; padding:8px 0; text-align:right; color:#10b981;">₹${donation.amount.toFixed(2)}</td>
          </tr>
          <tr>
            <td style="font-size:12px; color:#666; padding:4px 0;">Payment Method</td>
            <td style="font-size:12px; color:#000; padding:4px 0; text-align:right; text-transform:capitalize;">${donation.method}</td>
          </tr>
          ${
             donation.bank
                ? `
          <tr>
            <td style="font-size:12px; color:#666; padding:4px 0;">Bank</td>
            <td style="font-size:12px; color:#000; padding:4px 0; text-align:right;">${donation.bank}</td>
          </tr>
          `
                : ""
          }
          ${
             donation.wallet
                ? `
          <tr>
            <td style="font-size:12px; color:#666; padding:4px 0;">Wallet</td>
            <td style="font-size:12px; color:#000; padding:4px 0; text-align:right;">${donation.wallet}</td>
          </tr>
          `
                : ""
          }
          ${
             donation.vpa
                ? `
          <tr>
            <td style="font-size:12px; color:#666; padding:4px 0;">UPI ID</td>
            <td style="font-size:12px; color:#000; padding:4px 0; text-align:right;">${donation.vpa}</td>
          </tr>
          `
                : ""
          }
        </table>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="padding:20px; border-top:1px solid #e5e5e5; text-align:center;">
        <p style="margin:0 0 10px; font-size:12px; color:#666;">Questions? Contact us at support@stgermainalumni.com</p>
        <p style="margin:0 0 10px;">
          <a href="/terms-conditions" style="font-size:12px; color:#666; text-decoration:none; margin-right:10px;">Terms of Service</a>
          <a href="/privacy-policy" style="font-size:12px; color:#666; text-decoration:none;">Privacy Policy</a>
        </p>
        <p style="margin:0; font-size:11px; color:#999;">This receipt was created on ${formattedDate} and is valid for your records.</p>
      </td>
    </tr>
  </table>

  <!-- Thank You Message -->
  <div style="max-width:800px; margin:20px auto; text-align:center; padding:20px; background:#f0fdf4; border:1px solid #10b981; border-radius:8px;">
    <h3 style="margin:0 0 10px; color:#10b981; font-size:18px;">Thank You for Your Generosity!</h3>
    <p style="margin:0; color:#555; font-size:14px;">
      Your donation of <strong>₹${donation.amount}</strong> will help us continue our mission and make a positive impact in our community. 
      Every contribution makes a difference!
    </p>
  </div>

</body>
</html>
    `;
   },
});
