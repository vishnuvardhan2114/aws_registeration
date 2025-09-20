// convex/tokens.ts
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get a single token by ID
export const getToken = query({
   args: { tokenId: v.id("tokens") },
   returns: v.union(
      v.object({
         _id: v.id("tokens"),
         _creationTime: v.number(),
         transactionId: v.id("transactions"),
         eventId: v.id("events"),
         studentId: v.id("students"),
         isUsed: v.boolean(),
         uniqueCode: v.optional(v.string()),
      }),
      v.null()
   ),
   handler: async (ctx, args) => {
      return await ctx.db.get(args.tokenId);
   },
});

// Add a new token
export const addToken = mutation({
   args: {
      transactionId: v.id("transactions"),
      eventId: v.id("events"),
      studentId: v.id("students"),
      isUsed: v.boolean(),
   },
   returns: v.object({
      tokenId: v.id("tokens"),
      uniqueCode: v.string(),
   }),
   handler: async (ctx, args) => {
      function generateUniqueCode(length: number = 6): string {
         const chars =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
         let result = "";
         for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * chars.length);
            result += chars[randomIndex];
         }
         return result;
      }
      const uniqueCode = generateUniqueCode(8);
      console.log("Creating token with args:", { ...args, uniqueCode });
      
      const tokenId = await ctx.db.insert("tokens", { ...args, uniqueCode });
      
      console.log("Token created successfully with ID:", tokenId);
      return {
         tokenId,
         uniqueCode,
      };
   },
});
// Update a token by ID
export const updateToken = mutation({
   args: {
      tokenId: v.id("tokens"),
      transactionId: v.optional(v.id("transactions")),
      eventId: v.optional(v.id("events")),
      studentId: v.optional(v.id("students")),
      isUsed: v.optional(v.boolean()),
   },
   returns: v.null(),
   handler: async (ctx, args) => {
      const { tokenId, ...patch } = args;
      await ctx.db.patch(tokenId, patch);
      return null;
   },
});

// Get token by transaction ID
export const getTokenByTransactionId = query({
   args: {
      transactionId: v.id("transactions"),
   },
   returns: v.union(
      v.object({
         _id: v.id("tokens"),
         _creationTime: v.number(),
         transactionId: v.id("transactions"),
         eventId: v.id("events"),
         studentId: v.id("students"),
         isUsed: v.boolean(),
         uniqueCode: v.optional(v.string()),
      }),
      v.null()
   ),
   handler: async (ctx, args) => {
      return await ctx.db
         .query("tokens")
         .filter((q) => q.eq(q.field("transactionId"), args.transactionId))
         .unique();
   },
});

// Get comprehensive registration details by transaction ID
export const getRegistrationDetailsByTransactionId = query({
   args: {
      transactionId: v.id("transactions"),
   },
   returns: v.union(
      v.object({
         // Token details
         token: v.object({
            _id: v.id("tokens"),
            _creationTime: v.number(),
            transactionId: v.id("transactions"),
            eventId: v.id("events"),
            studentId: v.id("students"),
            isUsed: v.boolean(),
            uniqueCode: v.optional(v.string()),
         }),
         // Transaction details
         transaction: v.object({
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
         }),
         // Event details
         event: v.object({
            _id: v.id("events"),
            _creationTime: v.number(),
            name: v.string(),
            isFoodIncluded: v.boolean(),
            amount: v.number(),
            EndDate: v.string(),
            StartDate: v.string(),
         }),
         // Student details
         student: v.object({
            _id: v.id("students"),
            _creationTime: v.number(),
            name: v.string(),
            email: v.string(),
            phoneNumber: v.string(),
            dateOfBirth: v.string(),
            imageStorageId: v.optional(v.id("_storage")),
            imageUrl: v.optional(v.string()),
            batchYear: v.number(),
         }),
      }),
      v.null()
   ),
   handler: async (ctx, args) => {
      // First get the token by transaction ID
      const token = await ctx.db
         .query("tokens")
         .filter((q) => q.eq(q.field("transactionId"), args.transactionId))
         .unique();

      if (!token) {
         return null;
      }

      // Get transaction details
      const transaction = await ctx.db.get(args.transactionId);
      if (!transaction) {
         return null;
      }

      // Get event details
      const event = await ctx.db.get(token.eventId);
      if (!event) {
         return null;
      }

      // Get student details
      const student = await ctx.db.get(token.studentId);
      if (!student) {
         return null;
      }

      // Resolve student image URL if storage ID exists
      let imageUrl: string | undefined = undefined;
      if (student.imageStorageId) {
         const url = await ctx.storage.getUrl(student.imageStorageId);
         imageUrl = url || undefined;
      }

      return {
         token,
         transaction,
         event,
         student: {
            ...student,
            imageUrl,
         },
      };
   },
});

// Get comprehensive registration details by token ID
export const getRegistrationDetailsByTokenId = query({
   args: {
      tokenId: v.id("tokens"),
   },
   returns: v.union(
      v.object({
         // Token details
         token: v.object({
            _id: v.id("tokens"),
            _creationTime: v.number(),
            transactionId: v.id("transactions"),
            eventId: v.id("events"),
            studentId: v.id("students"),
            isUsed: v.boolean(),
            uniqueCode: v.optional(v.string()),
         }),
         // Transaction details
         transaction: v.object({
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
         }),
         // Event details
         event: v.object({
            _id: v.id("events"),
            _creationTime: v.number(),
            name: v.string(),
            isFoodIncluded: v.boolean(),
            amount: v.number(),
            EndDate: v.string(),
            StartDate: v.string(),
         }),
         // Student details
         student: v.object({
            _id: v.id("students"),
            _creationTime: v.number(),
            name: v.string(),
            email: v.string(),
            phoneNumber: v.string(),
            dateOfBirth: v.string(),
            imageStorageId: v.optional(v.id("_storage")),
            imageUrl: v.optional(v.string()),
            batchYear: v.number(),
         }),
      }),
      v.null()
   ),
   handler: async (ctx, args) => {
      // First get the token by ID
      const token = await ctx.db.get(args.tokenId);
      if (!token) {
         return null;
      }

      // Get transaction details
      const transaction = await ctx.db.get(token.transactionId);
      if (!transaction) {
         return null;
      }

      // Get event details
      const event = await ctx.db.get(token.eventId);
      if (!event) {
         return null;
      }

      // Get student details
      const student = await ctx.db.get(token.studentId);
      if (!student) {
         return null;
      }

      // Resolve student image URL if storage ID exists
      let imageUrl: string | undefined = undefined;
      if (student.imageStorageId) {
         const url = await ctx.storage.getUrl(student.imageStorageId);
         imageUrl = url || undefined;
      }

      return {
         token,
         transaction,
         event,
         student: {
            ...student,
            imageUrl,
         },
      };
   },
});

// Get token details by unique code for scanner validation
export const getTokenByUniqueCode = query({
  args: { uniqueCode: v.string() },
  returns: v.union(
    v.object({
      token: v.object({
        _id: v.id("tokens"),
        _creationTime: v.number(),
        transactionId: v.id("transactions"),
        eventId: v.id("events"),
        studentId: v.id("students"),
        isUsed: v.boolean(),
        uniqueCode: v.string(),
      }),
      event: v.object({
        _id: v.id("events"),
        _creationTime: v.number(),
        name: v.string(),
        isFoodIncluded: v.boolean(),
        amount: v.number(),
        EndDate: v.string(),
        StartDate: v.string(),
      }),
      student: v.object({
        _id: v.id("students"),
        _creationTime: v.number(),
        name: v.string(),
        email: v.string(),
        phoneNumber: v.string(),
        dateOfBirth: v.string(),
        imageStorageId: v.optional(v.id("_storage")),
        imageUrl: v.optional(v.string()),
        batchYear: v.number(),
      }),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    // Find token by unique code
    const token = await ctx.db
      .query("tokens")
      .filter((q) => q.eq(q.field("uniqueCode"), args.uniqueCode))
      .unique();

    if (!token) {
      return null;
    }

    // Get event details
    const event = await ctx.db.get(token.eventId);
    if (!event) {
      return null;
    }

    // Get student details
    const student = await ctx.db.get(token.studentId);
    if (!student) {
      return null;
    }

    // Resolve student image URL if storage ID exists
    let imageUrl: string | undefined = undefined;
    if (student.imageStorageId) {
      try {
        const url = await ctx.storage.getUrl(student.imageStorageId);
        imageUrl = url || undefined;
        console.log("Image URL resolved:", url);
      } catch (error) {
        console.error("Error getting image URL:", error);
        imageUrl = undefined;
      }
    } else {
      console.log("No imageStorageId found for student:", student._id);
    }

    return {
      token,
      event,
      student: {
        ...student,
        imageUrl,
      },
    };
  },
});

// Mark token as used
export const markTokenAsUsed = mutation({
  args: { tokenId: v.id("tokens") },
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
  }),
  handler: async (ctx, args) => {
    const token = await ctx.db.get(args.tokenId);
    
    if (!token) {
      return {
        success: false,
        message: "Token not found",
      };
    }

    if (token.isUsed) {
      return {
        success: false,
        message: "Token has already been used",
      };
    }

    await ctx.db.patch(args.tokenId, { isUsed: true });
    
    return {
      success: true,
      message: "Token marked as used successfully",
    };
  },
});

// Get all transactions with comprehensive details for admin dashboard
export const getAllTransactionsWithDetails = query({
  args: {},
  returns: v.array(v.union(v.object({
    transaction: v.object({
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
    }),
    event: v.union(v.object({
      _id: v.id("events"),
      _creationTime: v.number(),
      name: v.string(),
      isFoodIncluded: v.boolean(),
      amount: v.number(),
      EndDate: v.string(),
      StartDate: v.string(),
    }), v.null()),
    student: v.union(v.object({
      _id: v.id("students"),
      _creationTime: v.number(),
      name: v.string(),
      email: v.string(),
      phoneNumber: v.string(),
      dateOfBirth: v.string(),
      imageStorageId: v.optional(v.id("_storage")),
      imageUrl: v.optional(v.string()),
      batchYear: v.number(),
    }), v.null()),
    token: v.union(v.object({
      _id: v.id("tokens"),
      _creationTime: v.number(),
      transactionId: v.id("transactions"),
      eventId: v.id("events"),
      studentId: v.id("students"),
      isUsed: v.boolean(),
      uniqueCode: v.optional(v.string()),
    }), v.null()),
  }), v.null())),
  handler: async (ctx) => {
    // Get all transactions
    const transactions = await ctx.db.query("transactions").order("desc").collect();
    
    const results = await Promise.all(
      transactions.map(async (transaction) => {
        // Find token for this transaction
        const token = await ctx.db
          .query("tokens")
          .filter((q) => q.eq(q.field("transactionId"), transaction._id))
          .unique();
        
        if (!token) {
          return {
            transaction,
            event: null,
            student: null,
            token: null,
          };
        }
        
        // Get event details
        const event = await ctx.db.get(token.eventId);
        
        // Get student details
        const student = await ctx.db.get(token.studentId);
        
        // Resolve student image URL if storage ID exists
        let imageUrl: string | undefined = undefined;
        if (student?.imageStorageId) {
          const url = await ctx.storage.getUrl(student.imageStorageId);
          imageUrl = url || undefined;
        }
        
        return {
          transaction,
          event,
          student: student ? { ...student, imageUrl } : null,
          token,
        };
      })
    );
    
    return results;
  },
});