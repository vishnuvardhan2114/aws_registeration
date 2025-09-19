import { defineTable } from "convex/server";
import { v } from "convex/values";

export const tokens = defineTable({
  transactionId: v.id("transactions"),
  eventId: v.id("events"),
  studentId: v.id("students"),
  isUsed: v.boolean(),
}).index("by_event_student", ["eventId", "studentId"]);
