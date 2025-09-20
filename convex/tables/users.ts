  import { defineTable } from "convex/server";
import { v } from "convex/values";

export const users = defineTable({
  name: v.optional(v.string()),
  image: v.optional(v.string()),
  email: v.optional(v.string()),
  emailVerificationTime: v.optional(v.number()),
  phone: v.optional(v.string()),
  phoneVerificationTime: v.optional(v.number()),
  password:v.optional(v.string()),
  role: v.optional(v.string()),
})
  .searchIndex("search_name", { searchField: "name" })
  .searchIndex("search_phone", { searchField: "phone" })
  .index("by_email", ["email"])
  .index("by_phone", ["phone"]);
