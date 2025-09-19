import { defineSchema } from "convex/server";
import { events } from "./tables/events";
import { students } from "./tables/students";
import { tokens } from "./tables/tokens";
import { transactions } from "./tables/transactions";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,
  events,
  students,
  transactions,
  tokens,
});
