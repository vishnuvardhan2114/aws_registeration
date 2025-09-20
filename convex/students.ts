// convex/students.ts
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";


export const getFileUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, { storageId }) => {
    const url = await ctx.storage.getUrl(storageId);
    return { url }; 
  },
});


// Get a single student by ID
export const getStudent = query({
  args: { studentId: v.id("students") },
  returns: v.union(
    v.object({
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
    v.null()
  ),
  handler: async (ctx, args) => {
    const student = await ctx.db.get(args.studentId);
    if (!student) return null;
    
    // Resolve image URL if storage ID exists
    let imageUrl: string | undefined = undefined;
    if (student.imageStorageId) {
      const url = await ctx.storage.getUrl(student.imageStorageId);
      imageUrl = url || undefined;
    }
    
    return {
      ...student,
      imageUrl,
    };
  },
});

// Get a student by ID (alias for getStudent for consistency)
export const getStudentById = query({
  args: { studentId: v.id("students") },
  returns: v.union(
    v.object({
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
    v.null()
  ),
  handler: async (ctx, args) => {
    const student = await ctx.db.get(args.studentId);
    if (!student) return null;
    
    // Resolve image URL if storage ID exists
    let imageUrl: string | undefined = undefined;
    if (student.imageStorageId) {
      const url = await ctx.storage.getUrl(student.imageStorageId);
      imageUrl = url || undefined;
    }
    
    return {
      ...student,
      imageUrl,
    };
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
  returns: v.id("students"),
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
      imageUrl: v.optional(v.string()),
      batchYear: v.number(),
    })
  ),
  handler: async (ctx) => {
    const students = await ctx.db.query("students").order("desc").collect();
    
    // Resolve image URLs for each student
    const studentsWithUrls = await Promise.all(
      students.map(async (student) => {
        let imageUrl: string | undefined = undefined;
        if (student.imageStorageId) {
          const url = await ctx.storage.getUrl(student.imageStorageId);
          imageUrl = url || undefined;
        }
        
        return {
          ...student,
          imageUrl,
        };
      })
    );

    return studentsWithUrls;
  },
});
