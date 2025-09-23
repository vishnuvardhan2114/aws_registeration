import { defineSchema } from "convex/server";
import { events } from "./tables/events";
import { students } from "./tables/students";
import { tokens } from "./tables/tokens";
import { transactions } from "./tables/transactions";
import { donations } from "./tables/donations";
import { donationCategories } from "./tables/donationCategories";
import { authTables } from "@convex-dev/auth/server";
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
});
