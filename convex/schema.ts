import { defineSchema } from "convex/server";
import { events } from "./tables/events";
import { students } from "./tables/students";
import { tokens } from "./tables/tokens";
import { transactions } from "./tables/transactions";

export default defineSchema({
  events,
  students,
  transactions,
  tokens,
});
