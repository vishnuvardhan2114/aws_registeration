// convex/events.ts
import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all events
export const getAllEvents = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("events"),
      _creationTime: v.number(),
      name: v.string(),
      isFoodIncluded: v.boolean(),
      amount: v.float64(),
      EndDate: v.string(),
      StartDate: v.string(),
    })
  ),
  handler: async (ctx) => {
    return await ctx.db.query("events").order("desc").collect();
  },
});

// Get a single event by ID
export const getEvent = query({
  args: { eventId: v.id("events") },
  returns: v.union(
    v.object({
      _id: v.id("events"),
      _creationTime: v.number(),
      name: v.string(),
      isFoodIncluded: v.boolean(),
      amount: v.float64(),
      EndDate: v.string(),
      StartDate: v.string(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.eventId);
  },
});

// Add a new event
export const addEvent = mutation({
  args: {
    name: v.string(),
    isFoodIncluded: v.boolean(),
    amount: v.float64(),
    EndDate: v.string(),
    StartDate: v.string(),
  },
  returns: v.id("events"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("events", args);
  },
});

// Update an event by ID
export const updateEvent = mutation({
  args: {
    eventId: v.id("events"),
    name: v.optional(v.string()),
    isFoodIncluded: v.optional(v.boolean()),
    amount: v.optional(v.float64()),
    EndDate: v.optional(v.string()),
    StartDate: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { eventId, ...patch } = args;
    await ctx.db.patch(eventId, patch);
    return null;
  },
});

// Delete an event by ID
export const deleteEvent = mutation({
  args: { eventId: v.id("events") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.delete(args.eventId);
    return null;
  },
});

// Get active events (events that are currently active or upcoming)
export const getActiveEvents = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("events"),
      _creationTime: v.number(),
      name: v.string(),
      isFoodIncluded: v.boolean(),
      amount: v.float64(),
      EndDate: v.string(),
      StartDate: v.string(),
    })
  ),
  handler: async (ctx) => {
    const now = new Date().toISOString();
    return await ctx.db
      .query("events")
      .filter((q) => q.gte(q.field("EndDate"), now))
      .order("asc")
      .collect();
  },
});

// Get event statistics (registered users count and total amount collected)
export const getEventStats = query({
  args: { eventId: v.id("events") },
  returns: v.object({
    totalRegistrations: v.number(),
    totalAmountCollected: v.number(),
    foodCouponsUsed: v.number(),
    foodCouponsAvailable: v.number(),
  }),
  handler: async (ctx, args) => {
    // Get all tokens for this event
    const tokens = await ctx.db
      .query("tokens")
      .filter((q) => q.eq(q.field("eventId"), args.eventId))
      .collect();

    // Get all transactions for these tokens
    const transactionIds = tokens.map((token) => token.transactionId);
    const transactions = await Promise.all(
      transactionIds.map((id) => ctx.db.get(id))
    );

    // Filter out null transactions and calculate stats
    const validTransactions = transactions.filter((t) => t !== null);
    const totalAmountCollected = validTransactions.reduce(
      (sum, t) => sum + (t?.amount || 0),
      0
    );
    const foodCouponsUsed = tokens.filter((token) => token.isUsed).length;
    const foodCouponsAvailable = tokens.length - foodCouponsUsed;

    return {
      totalRegistrations: tokens.length,
      totalAmountCollected,
      foodCouponsUsed,
      foodCouponsAvailable,
    };
  },
});

// Get all registered users for a specific event with their details
export const getEventRegistrations = query({
  args: { eventId: v.id("events") },
  returns: v.array(
    v.object({
      _id: v.id("tokens"),
      _creationTime: v.number(),
      isUsed: v.boolean(),
      uniqueCode: v.string(),
      student: v.object({
        _id: v.id("students"),
        name: v.string(),
        email: v.string(),
        phoneNumber: v.string(),
        batchYear: v.number(),
        imageUrl: v.optional(v.string()),
      }),
      transaction: v.object({
        _id: v.id("transactions"),
        amount: v.number(),
        status: v.string(),
        method: v.string(),
        created_at: v.string(),
      }),
    })
  ),
  handler: async (ctx, args) => {
    // Get all tokens for this event
    const tokens = await ctx.db
      .query("tokens")
      .filter((q) => q.eq(q.field("eventId"), args.eventId))
      .order("desc")
      .collect();

    // Get details for each registration
    const registrations = await Promise.all(
      tokens.map(async (token) => {
        const student = await ctx.db.get(token.studentId);
        const transaction = await ctx.db.get(token.transactionId);

        if (!student || !transaction) {
          return null;
        }

        // Resolve student image URL if storage ID exists
        let imageUrl: string | undefined = undefined;
        if (student.imageStorageId) {
          const url = await ctx.storage.getUrl(student.imageStorageId);
          imageUrl = url || undefined;
        }

        return {
          _id: token._id,
          _creationTime: token._creationTime,
          isUsed: token.isUsed,
          uniqueCode: token.uniqueCode,
          student: {
            _id: student._id,
            name: student.name,
            email: student.email,
            phoneNumber: student.phoneNumber,
            batchYear: student.batchYear,
            imageUrl,
          },
          transaction: {
            _id: transaction._id,
            amount: transaction.amount,
            status: transaction.status,
            method: transaction.method,
            created_at: transaction.created_at,
          },
        };
      })
    );

    // Filter out null registrations
    return registrations.filter((reg) => reg !== null);
  },
});

export const getPaginatedEventRegistrations = query({
  args: {
    eventId: v.id("events"),
    searchName: v.optional(v.string()),
    paginationOpts: paginationOptsValidator, // Use Convex's pagination validator
  },
  handler: async (ctx, args) => {
    // 1. If searching by name, get matching student IDs
    let studentIds: Set<string> | undefined;
    if (args.searchName) {
      const students = await ctx.db
        .query("students")
        .withSearchIndex("search_name", (q) =>
          q.search("name", args.searchName!)
        )
        .collect();
      studentIds = new Set(students.map((s) => s._id));
    }

    // 2. Query tokens by eventId, paginate
    const tokensQuery = ctx.db
      .query("tokens")
      .withIndex("by_event_student", (q) => q.eq("eventId", args.eventId));

    // 3. Paginate tokens
    const page = await tokensQuery.paginate(args.paginationOpts);

    // 4. Filter tokens with coTransactions and (if searching) matching studentId
    const filteredTokens = page.page.filter(
      (token) =>
        token.coTransactions && (!studentIds || studentIds.has(token.studentId))
    );

    // 5. Fetch related students and coTransactions
    const students = await Promise.all(
      filteredTokens.map((token) => ctx.db.get(token.studentId))
    );
    const coTransactions = await Promise.all(
      filteredTokens.map((token) => ctx.db.get(token.coTransactions!))
    );

    // 6. Format the result
    const result = filteredTokens.map((token, i) => {
      const student = students[i];
      const coTransaction = coTransactions[i];
      return {
        _id: token._id,
        studentId: student?._id,
        name: student?.name,
        contact: student?.phoneNumber,
        paymentStatus: coTransaction?.status,
        receipt: coTransaction?.storageId, // adjust as needed
        batchYear: student?.batchYear,
        registrationDate: token._creationTime, // adjust if you have a different field
        dateOfBirth: student?.dateOfBirth,
      };
    });

    return {
      ...page,
      page: result,
    };
  },
});
