import { v } from "convex/values";
import { query } from "./_generated/server";

// Get dashboard statistics
export const getDashboardStats = query({
  args: {},
  returns: v.object({
    totalStudents: v.number(),
    totalRevenue: v.number(),
    totalTransactions: v.number(),
    activeEvents: v.number(),
    recentTransactions: v.array(v.object({
      _id: v.id("transactions"),
      _creationTime: v.number(),
      amount: v.number(),
      status: v.string(),
      method: v.string(),
    })),
  }),
  handler: async (ctx) => {
    // Get total students count
    const students = await ctx.db.query("students").collect();
    const totalStudents = students.length;

    // Get all transactions and calculate revenue
    const transactions = await ctx.db.query("transactions").collect();
    const totalTransactions = transactions.length;
    
    // Calculate total revenue from successful transactions
    const totalRevenue = transactions
      .filter(t => t.status === "captured")
      .reduce((sum, t) => sum + t.amount, 0);

    // Get active events (events that haven't ended yet)
    const now = new Date();
    const events = await ctx.db.query("events").collect();
    const activeEvents = events.filter(event => {
      const endDate = new Date(event.EndDate);
      return endDate > now;
    }).length;

    // Get recent transactions (last 5)
    const recentTransactions = transactions
      .sort((a, b) => b._creationTime - a._creationTime)
      .slice(0, 5)
      .map(t => ({
        _id: t._id,
        _creationTime: t._creationTime,
        amount: t.amount,
        status: t.status,
        method: t.method,
      }));

    return {
      totalStudents,
      totalRevenue,
      totalTransactions,
      activeEvents,
      recentTransactions,
    };
  },
});

// Get revenue statistics for the last 30 days
export const getRevenueStats = query({
  args: {},
  returns: v.object({
    totalRevenue: v.number(),
    monthlyRevenue: v.number(),
    weeklyRevenue: v.number(),
    dailyRevenue: v.number(),
    transactionCount: v.number(),
  }),
  handler: async (ctx) => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const transactions = await ctx.db.query("transactions").collect();
    const successfulTransactions = transactions.filter(t => t.status === "captured");

    const totalRevenue = successfulTransactions.reduce((sum, t) => sum + t.amount, 0);
    
    const monthlyRevenue = successfulTransactions
      .filter(t => new Date(t._creationTime) >= thirtyDaysAgo)
      .reduce((sum, t) => sum + t.amount, 0);
    
    const weeklyRevenue = successfulTransactions
      .filter(t => new Date(t._creationTime) >= sevenDaysAgo)
      .reduce((sum, t) => sum + t.amount, 0);
    
    const dailyRevenue = successfulTransactions
      .filter(t => new Date(t._creationTime) >= oneDayAgo)
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalRevenue,
      monthlyRevenue,
      weeklyRevenue,
      dailyRevenue,
      transactionCount: successfulTransactions.length,
    };
  },
});
