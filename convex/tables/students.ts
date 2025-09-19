import { defineTable } from "convex/server";
import { v } from "convex/values";

export const students = defineTable({
  name: v.string(),
  email: v.string(),
  phoneNumber: v.string(),
  dateOfBirth: v.string(),
  imageStorageId: v.optional(v.id("_storage")),
  batchYear: v.number(),
})
  .searchIndex("search_name", { searchField: "name" })
  .searchIndex("search_phoneNumber", { searchField: "phoneNumber" })
  .index("by_email", ["email"])
  .index("by_phoneNumber", ["phoneNumber"]);
