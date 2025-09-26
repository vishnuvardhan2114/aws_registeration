import { authTables } from "@convex-dev/auth/server";
import { defineSchema } from "convex/server";
import { coTransactions } from "./tables/coTransactions";
import { donationCategories } from "./tables/donationCategories";
import { donations } from "./tables/donations";
import { events } from "./tables/events";
import { students } from "./tables/students";
import { tokens } from "./tables/tokens";
import { transactions } from "./tables/transactions";
import { users } from "./tables/users";

export default defineSchema({
  ...authTables,
  users,
  events,
  students,
  transactions,
  tokens,
  donations,
  donationCategories,
  coTransactions,
});
