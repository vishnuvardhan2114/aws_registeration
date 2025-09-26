import { defineTable } from "convex/server";
import { v } from "convex/values";

export const tokens = defineTable({
  transactionId: v.optional(v.id("transactions")),
  eventId: v.id("events"),
  studentId: v.id("students"),
  isUsed: v.boolean(),
  uniqueCode: v.string(),
  coTransactions: v.optional(v.id("coTransactions")),
}).index("by_event_student", ["eventId", "studentId"]);
