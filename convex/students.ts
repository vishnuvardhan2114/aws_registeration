// convex/students.ts
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get a single student by ID
export const getStudent = query({
  args: { studentId: v.id("students") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.studentId);
  },
});

// Add a new student
export const addStudent = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    phoneNumber: v.string(),
    dateOfBirth: v.string(),
    imageStorageId: v.optional(v.id("_storage")),
    batchYear: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("students", args);
  },
});

export const addOrUpdateStudent = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    phoneNumber: v.string(),
    dateOfBirth: v.string(),
    imageStorageId: v.optional(v.id("_storage")),
    batchYear: v.number(),
  },
  handler: async (ctx, args) => {
    // Check for existing student by email
    let existing = await ctx.db
      .query("students")
      .filter((q) => q.eq(q.field("email"), args.email))
      .unique();

    // If not found by email, check by phone number
    if (!existing) {
      existing = await ctx.db
        .query("students")
        .filter((q) => q.eq(q.field("phoneNumber"), args.phoneNumber))
        .unique();
    }

    if (existing) {
      await ctx.db.patch(existing._id, args);
      return existing._id;
    } else {
      return await ctx.db.insert("students", args);
    }
  },
});

// Update a student by ID
export const updateStudent = mutation({
  args: {
    studentId: v.id("students"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    dateOfBirth: v.optional(v.string()),
    imageStorageId: v.optional(v.id("_storage")),
    batchYear: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { studentId, ...patch } = args;
    await ctx.db.patch(studentId, patch);
  },
});

// Get all students
export const getAllStudents = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("students"),
      _creationTime: v.number(),
      name: v.string(),
      email: v.string(),
      phoneNumber: v.string(),
      dateOfBirth: v.string(),
      imageStorageId: v.optional(v.id("_storage")),
      batchYear: v.number(),
    })
  ),
  handler: async (ctx) => {
    return await ctx.db.query("students").order("desc").collect();
  },
});
