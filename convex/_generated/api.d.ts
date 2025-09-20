/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as auth from "../auth.js";
import type * as events from "../events.js";
import type * as http from "../http.js";
import type * as razorpay from "../razorpay.js";
import type * as storage from "../storage.js";
import type * as students from "../students.js";
import type * as tables_events from "../tables/events.js";
import type * as tables_students from "../tables/students.js";
import type * as tables_tokens from "../tables/tokens.js";
import type * as tables_transactions from "../tables/transactions.js";
import type * as tables_users from "../tables/users.js";
import type * as tokens from "../tokens.js";
import type * as transactions from "../transactions.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  events: typeof events;
  http: typeof http;
  razorpay: typeof razorpay;
  storage: typeof storage;
  students: typeof students;
  "tables/events": typeof tables_events;
  "tables/students": typeof tables_students;
  "tables/tokens": typeof tables_tokens;
  "tables/transactions": typeof tables_transactions;
  "tables/users": typeof tables_users;
  tokens: typeof tokens;
  transactions: typeof transactions;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
