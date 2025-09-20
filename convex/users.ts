import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get all users with pagination (excluding sensitive fields)
 */
export const getUsers = query({
  args: {
    paginationOpts: v.object({
      numItems: v.number(),
      cursor: v.union(v.string(), v.null()),
    }),
  },
  returns: v.object({
    page: v.array(v.object({
      _id: v.id("users"),
      _creationTime: v.number(),
      name: v.optional(v.string()),
      email: v.optional(v.string()),
      phone: v.optional(v.string()),
      role: v.optional(v.string()),
      emailVerificationTime: v.optional(v.number()),
      phoneVerificationTime: v.optional(v.number()),
    })),
    isDone: v.boolean(),
    continueCursor: v.union(v.string(), v.null()),
    splitCursor: v.optional(v.union(v.string(), v.null())),
    pageStatus: v.optional(v.union(v.literal("SplitRecommended"), v.literal("SplitRequired"), v.null())),
  }),
  handler: async (ctx, args) => {
    const result = await ctx.db
      .query("users")
      .order("desc")
      .paginate(args.paginationOpts);

    // Remove password field from each user for security
    const sanitizedPage = result.page.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    return {
      ...result,
      page: sanitizedPage,
    };
  },
});

/**
 * Get a single user by ID (excluding sensitive fields)
 */
export const getUserById = query({
  args: { userId: v.id("users") },
  returns: v.union(
    v.object({
      _id: v.id("users"),
      _creationTime: v.number(),
      name: v.optional(v.string()),
      email: v.optional(v.string()),
      phone: v.optional(v.string()),
      role: v.optional(v.string()),
      emailVerificationTime: v.optional(v.number()),
      phoneVerificationTime: v.optional(v.number()),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;
    
    // Remove password field for security
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },
});

/**
 * Create a new user
 */
export const createUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    password: v.string(),
    role: v.optional(v.string()),
    phone: v.optional(v.string()),
  },
  returns: v.id("users"),
  handler: async (ctx, args) => {
    // Check if user with email already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Create the user
    const userId = await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      password: args.password, // Note: In production, hash this password
      role: args.role || "user",
      phone: args.phone,
    });

    return userId;
  },
});

/**
 * Update an existing user
 */
export const updateUser = mutation({
  args: {
    userId: v.id("users"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    password: v.optional(v.string()),
    role: v.optional(v.string()),
    phone: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { userId, ...updates } = args;
    
    // Check if user exists
    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // If email is being updated, check for duplicates
    if (updates.email && updates.email !== user.email) {
      const existingUser = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", updates.email))
        .first();

      if (existingUser) {
        throw new Error("User with this email already exists");
      }
    }

    // Update the user
    await ctx.db.patch(userId, updates);
    return null;
  },
});

/**
 * Delete a user
 */
export const deleteUser = mutation({
  args: { userId: v.id("users") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.delete(args.userId);
    return null;
  },
});

/**
 * Search users by name or email (excluding sensitive fields)
 */
export const searchUsers = query({
  args: {
    searchTerm: v.string(),
    paginationOpts: v.object({
      numItems: v.number(),
      cursor: v.union(v.string(), v.null()),
    }),
  },
  returns: v.object({
    page: v.array(v.object({
      _id: v.id("users"),
      _creationTime: v.number(),
      name: v.optional(v.string()),
      email: v.optional(v.string()),
      phone: v.optional(v.string()),
      role: v.optional(v.string()),
      emailVerificationTime: v.optional(v.number()),
      phoneVerificationTime: v.optional(v.number()),
    })),
    isDone: v.boolean(),
    continueCursor: v.union(v.string(), v.null()),
  }),
  handler: async (ctx, args) => {
    if (!args.searchTerm.trim()) {
      const result = await ctx.db
        .query("users")
        .order("desc")
        .paginate(args.paginationOpts);

      // Remove password field from each user for security
      const sanitizedPage = result.page.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });

      return {
        ...result,
        page: sanitizedPage,
      };
    }

    // Search by name
    const nameResults = await ctx.db
      .query("users")
      .withSearchIndex("search_name", (q) => q.search("name", args.searchTerm))
      .collect();

    // Search by email
    const emailResults = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.searchTerm))
      .collect();

    // Combine and deduplicate results
    const allResults = [...nameResults, ...emailResults];
    const uniqueResults = allResults.filter((user, index, self) => 
      index === self.findIndex(u => u._id === user._id)
    );

    // Sort by creation time (descending)
    uniqueResults.sort((a, b) => b._creationTime - a._creationTime);

    // Simple pagination for search results
    const startIndex = args.paginationOpts.cursor ? 
      uniqueResults.findIndex(u => u._id === args.paginationOpts.cursor) + 1 : 0;
    const endIndex = startIndex + args.paginationOpts.numItems;
    const page = uniqueResults.slice(startIndex, endIndex);
    const isDone = endIndex >= uniqueResults.length;
    const continueCursor = isDone ? null : page[page.length - 1]?._id || null;

    // Remove password field from each user for security
    const sanitizedPage = page.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    return {
      page: sanitizedPage,
      isDone,
      continueCursor,
    };
  },
});
