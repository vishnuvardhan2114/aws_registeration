import { defineTable } from "convex/server";
import { v } from "convex/values";

export const events = defineTable({
  name: v.string(),
  isFoodIncluded: v.boolean(),
  amount: v.float64(),
  EndDate: v.string(),
  StartDate: v.string(),
})
  .searchIndex("search_name", { searchField: "name" })
  .index("food_included", ["isFoodIncluded"]);
