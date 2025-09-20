// convex/transactions.ts
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get a single transaction by ID
export const getTransaction = query({
  args: { transactionId: v.id("transactions") },
  returns: v.union(
    v.object({
      _id: v.id("transactions"),
      _creationTime: v.number(),
      paymentId: v.string(),
      amount: v.number(),
      orderId: v.string(),
      status: v.string(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.transactionId);
  },
});

// Get all transactions with pagination
export const getTransactions = query({
  args: {
    paginationOpts: v.object({
      numItems: v.number(),
      cursor: v.union(v.string(), v.null()),
    }),
  },
  returns: v.object({
    page: v.array(v.object({
      _id: v.id("transactions"),
      _creationTime: v.number(),
      paymentId: v.string(),
      amount: v.number(),
      orderId: v.string(),
      status: v.string(),
    })),
    isDone: v.boolean(),
    continueCursor: v.union(v.string(), v.null()),
  }),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("transactions")
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

// Search transactions by payment ID, order ID, or status
export const searchTransactions = query({
  args: {
    searchTerm: v.string(),
    statusFilter: v.optional(v.string()),
    paginationOpts: v.object({
      numItems: v.number(),
      cursor: v.union(v.string(), v.null()),
    }),
  },
  returns: v.object({
    page: v.array(v.object({
      _id: v.id("transactions"),
      _creationTime: v.number(),
      paymentId: v.string(),
      amount: v.number(),
      orderId: v.string(),
      status: v.string(),
    })),
    isDone: v.boolean(),
    continueCursor: v.union(v.string(), v.null()),
  }),
  handler: async (ctx, args) => {
    let query = ctx.db.query("transactions");

    // Apply status filter if provided
    if (args.statusFilter && args.statusFilter !== 'all') {
      // Note: This is a simple filter. For better performance, you might want to add an index
      const allTransactions = await query.collect();
      const filtered = allTransactions.filter(t => t.status === args.statusFilter);
      
      // Apply search filter
      const searchFiltered = args.searchTerm.trim() 
        ? filtered.filter(t => 
            t.paymentId.toLowerCase().includes(args.searchTerm.toLowerCase()) ||
            t.orderId.toLowerCase().includes(args.searchTerm.toLowerCase())
          )
        : filtered;

      // Sort by creation time (descending)
      searchFiltered.sort((a, b) => b._creationTime - a._creationTime);

      // Simple pagination for filtered results
      const startIndex = args.paginationOpts.cursor ? 
        searchFiltered.findIndex(t => t._id === args.paginationOpts.cursor) + 1 : 0;
      const endIndex = startIndex + args.paginationOpts.numItems;
      const page = searchFiltered.slice(startIndex, endIndex);
      const isDone = endIndex >= searchFiltered.length;
      const continueCursor = isDone ? null : page[page.length - 1]?._id || null;

      return {
        page,
        isDone,
        continueCursor,
      };
    }

    // If no status filter, use regular pagination with search
    if (args.searchTerm.trim()) {
      const allTransactions = await query.collect();
      const filtered = allTransactions.filter(t => 
        t.paymentId.toLowerCase().includes(args.searchTerm.toLowerCase()) ||
        t.orderId.toLowerCase().includes(args.searchTerm.toLowerCase())
      );
      
      // Sort by creation time (descending)
      filtered.sort((a, b) => b._creationTime - a._creationTime);

      // Simple pagination for search results
      const startIndex = args.paginationOpts.cursor ? 
        filtered.findIndex(t => t._id === args.paginationOpts.cursor) + 1 : 0;
      const endIndex = startIndex + args.paginationOpts.numItems;
      const page = filtered.slice(startIndex, endIndex);
      const isDone = endIndex >= filtered.length;
      const continueCursor = isDone ? null : page[page.length - 1]?._id || null;

      return {
        page,
        isDone,
        continueCursor,
      };
    }

    // No filters, use regular pagination
    return await query.order("desc").paginate(args.paginationOpts);
  },
});

// Get transaction statistics
export const getTransactionStats = query({
  args: {},
  returns: v.object({
    totalTransactions: v.number(),
    totalAmount: v.number(),
    completedTransactions: v.number(),
    pendingTransactions: v.number(),
    failedTransactions: v.number(),
    refundedTransactions: v.number(),
  }),
  handler: async (ctx) => {
    const transactions = await ctx.db.query("transactions").collect();
    
    const stats = transactions.reduce((acc, transaction) => {
      acc.totalTransactions++;
      acc.totalAmount += transaction.amount;
      
      switch (transaction.status) {
        case 'completed':
          acc.completedTransactions++;
          break;
        case 'pending':
          acc.pendingTransactions++;
          break;
        case 'failed':
          acc.failedTransactions++;
          break;
        case 'refunded':
          acc.refundedTransactions++;
          break;
      }
      
      return acc;
    }, {
      totalTransactions: 0,
      totalAmount: 0,
      completedTransactions: 0,
      pendingTransactions: 0,
      failedTransactions: 0,
      refundedTransactions: 0,
    });

    return stats;
  },
});

// Add a new transaction
export const addTransaction = mutation({
  args: {
    paymentId: v.string(),
    amount: v.number(),
    orderId: v.string(),
    status: v.string(),
  },
  returns: v.id("transactions"),
  handler: async (ctx, args) => {
    const transactionToInsert = {
      paymentId: args.paymentId,
      amount: args.amount,
      orderId: args.orderId,
      status: args.status,
    };
    return await ctx.db.insert("transactions", transactionToInsert);
  },
});

// Update a transaction by ID
export const updateTransaction = mutation({
  args: {
    transactionId: v.id("transactions"),
    paymentId: v.optional(v.string()),
    amount: v.optional(v.number()),
    orderId: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { transactionId, ...patch } = args;
    await ctx.db.patch(transactionId, patch);
    return null;
  },
});
