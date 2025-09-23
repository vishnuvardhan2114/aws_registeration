import { defineTable } from "convex/server";
import { v } from "convex/values";

export const donationCategories = defineTable({
  name: v.string(),
  description: v.optional(v.string()),
  isActive: v.boolean(),
  sortOrder: v.number(),
  isDefault: v.boolean(), // For "Others" category
  icon: v.optional(v.string()), // Icon name for UI
  color: v.optional(v.string()), // Hex color for UI
  minAmount: v.optional(v.number()), // Minimum donation amount
  maxAmount: v.optional(v.number()), // Maximum donation amount
  isPopular: v.optional(v.boolean()), // Highlight popular categories
  metadata: v.optional(v.any()), // Additional category-specific data
})
  .index("by_active", ["isActive"])
  .index("by_sortOrder", ["sortOrder"])
  .index("by_popular", ["isPopular"])
  .index("by_default", ["isDefault"]);
