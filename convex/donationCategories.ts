import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Get all donation categories (admin use)
 */
export const getAllCategories = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("donationCategories")
      .order("asc")
      .collect();
  },
});

/**
 * Get active donation categories for public use
 */
export const getActiveCategories = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("donationCategories")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .order("asc")
      .collect();
  },
});

/**
 * Get categories ordered by sort order for public use
 */
export const getCategoriesForDonation = query({
  args: {},
  handler: async (ctx) => {
    const categories = await ctx.db
      .query("donationCategories")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();

    // Sort by sortOrder, then by creation time
    return categories.sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) {
        return a.sortOrder - b.sortOrder;
      }
      return a._creationTime - b._creationTime;
    });
  },
});

/**
 * Get a specific category by ID
 */
export const getCategory = query({
  args: { categoryId: v.id("donationCategories") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.categoryId);
  },
});

/**
 * Create a new donation category
 */
export const createCategory = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    icon: v.optional(v.string()),
    color: v.optional(v.string()),
    minAmount: v.optional(v.number()),
    maxAmount: v.optional(v.number()),
    isPopular: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Get the highest sort order
    const categories = await ctx.db
      .query("donationCategories")
      .order("desc")
      .collect();
    
    const maxSortOrder = categories.length > 0 ? categories[0].sortOrder : 0;

    const categoryId = await ctx.db.insert("donationCategories", {
      name: args.name,
      description: args.description,
      isActive: true,
      sortOrder: maxSortOrder + 1,
      isDefault: false,
      icon: args.icon,
      color: args.color,
      minAmount: args.minAmount,
      maxAmount: args.maxAmount,
      isPopular: args.isPopular || false,
    });

    return categoryId;
  },
});

/**
 * Update a donation category
 */
export const updateCategory = mutation({
  args: {
    categoryId: v.id("donationCategories"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    icon: v.optional(v.string()),
    color: v.optional(v.string()),
    minAmount: v.optional(v.number()),
    maxAmount: v.optional(v.number()),
    isPopular: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { categoryId, ...updateData } = args;
    
    // Remove undefined values
    const cleanUpdateData = Object.fromEntries(
      Object.entries(updateData).filter(([, value]) => value !== undefined)
    );

    await ctx.db.patch(categoryId, cleanUpdateData);
    return categoryId;
  },
});

/**
 * Delete a donation category (soft delete by setting isActive to false)
 */
export const deleteCategory = mutation({
  args: { categoryId: v.id("donationCategories") },
  handler: async (ctx, args) => {
    // Check if category is default (cannot be deleted)
    const category = await ctx.db.get(args.categoryId);
    if (category?.isDefault) {
      throw new Error("Cannot delete default category");
    }

    // Check if category has donations
    const donations = await ctx.db
      .query("donations")
      .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
      .collect();

    if (donations.length > 0) {
      // Soft delete by setting isActive to false
      await ctx.db.patch(args.categoryId, { isActive: false });
    } else {
      // Hard delete if no donations
      await ctx.db.delete(args.categoryId);
    }

    return args.categoryId;
  },
});

/**
 * Reorder categories
 */
export const reorderCategories = mutation({
  args: {
    categoryOrders: v.array(v.object({
      categoryId: v.id("donationCategories"),
      sortOrder: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    const updatePromises = args.categoryOrders.map(({ categoryId, sortOrder }) =>
      ctx.db.patch(categoryId, { sortOrder })
    );

    await Promise.all(updatePromises);
    return true;
  },
});

/**
 * Initialize default categories (run once during setup)
 */
export const initializeDefaultCategories = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if categories already exist
    const existingCategories = await ctx.db
      .query("donationCategories")
      .collect();

    if (existingCategories.length > 0) {
      return { message: "Categories already initialized" };
    }

    const defaultCategories = [
      {
        name: "General Donation",
        description: "Support our organization's general activities",
        icon: "heart",
        color: "#ef4444",
        isPopular: true,
        sortOrder: 1,
      },
      {
        name: "Education Support",
        description: "Help students with educational expenses",
        icon: "book-open",
        color: "#3b82f6",
        isPopular: true,
        sortOrder: 2,
      },
      {
        name: "Event Sponsorship",
        description: "Sponsor upcoming events and activities",
        icon: "calendar",
        color: "#8b5cf6",
        sortOrder: 3,
      },
      {
        name: "Infrastructure",
        description: "Support infrastructure development",
        icon: "building",
        color: "#10b981",
        sortOrder: 4,
      },
      {
        name: "Others",
        description: "Specify your own purpose",
        icon: "more-horizontal",
        color: "#6b7280",
        isDefault: true,
        sortOrder: 999,
      },
    ];

    const categoryIds = [];
    for (const category of defaultCategories) {
      const categoryId = await ctx.db.insert("donationCategories", {
        ...category,
        isActive: true,
        isDefault: category.isDefault || false,
      });
      categoryIds.push(categoryId);
    }

    return { 
      message: "Default categories initialized", 
      categoryIds 
    };
  },
});
