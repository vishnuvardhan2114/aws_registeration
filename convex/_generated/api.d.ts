/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as dashboard from "../dashboard.js";
import type * as donationCategories from "../donationCategories.js";
import type * as donationEmail from "../donationEmail.js";
import type * as donationPayments from "../donationPayments.js";
import type * as donations from "../donations.js";
import type * as email from "../email.js";
import type * as events from "../events.js";
import type * as http from "../http.js";
import type * as payments from "../payments.js";
import type * as razorpay from "../razorpay.js";
import type * as storage from "../storage.js";
import type * as students from "../students.js";
import type * as tables_donationCategories from "../tables/donationCategories.js";
import type * as tables_donations from "../tables/donations.js";
import type * as tables_events from "../tables/events.js";
import type * as tables_students from "../tables/students.js";
import type * as tables_tokens from "../tables/tokens.js";
import type * as tables_transactions from "../tables/transactions.js";
import type * as tables_users from "../tables/users.js";
import type * as tokens from "../tokens.js";
import type * as transactions from "../transactions.js";
import type * as users from "../users.js";
import type * as utils_templates_paymentReceipt from "../utils/templates/paymentReceipt.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

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
  dashboard: typeof dashboard;
  donationCategories: typeof donationCategories;
  donationEmail: typeof donationEmail;
  donationPayments: typeof donationPayments;
  donations: typeof donations;
  email: typeof email;
  events: typeof events;
  http: typeof http;
  payments: typeof payments;
  razorpay: typeof razorpay;
  storage: typeof storage;
  students: typeof students;
  "tables/donationCategories": typeof tables_donationCategories;
  "tables/donations": typeof tables_donations;
  "tables/events": typeof tables_events;
  "tables/students": typeof tables_students;
  "tables/tokens": typeof tables_tokens;
  "tables/transactions": typeof tables_transactions;
  "tables/users": typeof tables_users;
  tokens: typeof tokens;
  transactions: typeof transactions;
  users: typeof users;
  "utils/templates/paymentReceipt": typeof utils_templates_paymentReceipt;
}>;
declare const fullApiWithMounts: typeof fullApi;

export declare const api: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "internal">
>;

export declare const components: {
  resend: {
    lib: {
      cancelEmail: FunctionReference<
        "mutation",
        "internal",
        { emailId: string },
        null
      >;
      cleanupAbandonedEmails: FunctionReference<
        "mutation",
        "internal",
        { olderThan?: number },
        null
      >;
      cleanupOldEmails: FunctionReference<
        "mutation",
        "internal",
        { olderThan?: number },
        null
      >;
      createManualEmail: FunctionReference<
        "mutation",
        "internal",
        {
          from: string;
          headers?: Array<{ name: string; value: string }>;
          replyTo?: Array<string>;
          subject: string;
          to: string;
        },
        string
      >;
      get: FunctionReference<
        "query",
        "internal",
        { emailId: string },
        {
          complained: boolean;
          createdAt: number;
          errorMessage?: string;
          finalizedAt: number;
          from: string;
          headers?: Array<{ name: string; value: string }>;
          html?: string;
          opened: boolean;
          replyTo: Array<string>;
          resendId?: string;
          segment: number;
          status:
            | "waiting"
            | "queued"
            | "cancelled"
            | "sent"
            | "delivered"
            | "delivery_delayed"
            | "bounced"
            | "failed";
          subject: string;
          text?: string;
          to: string;
        } | null
      >;
      getStatus: FunctionReference<
        "query",
        "internal",
        { emailId: string },
        {
          complained: boolean;
          errorMessage: string | null;
          opened: boolean;
          status:
            | "waiting"
            | "queued"
            | "cancelled"
            | "sent"
            | "delivered"
            | "delivery_delayed"
            | "bounced"
            | "failed";
        } | null
      >;
      handleEmailEvent: FunctionReference<
        "mutation",
        "internal",
        { event: any },
        null
      >;
      sendEmail: FunctionReference<
        "mutation",
        "internal",
        {
          from: string;
          headers?: Array<{ name: string; value: string }>;
          html?: string;
          options: {
            apiKey: string;
            initialBackoffMs: number;
            onEmailEvent?: { fnHandle: string };
            retryAttempts: number;
            testMode: boolean;
          };
          replyTo?: Array<string>;
          subject: string;
          text?: string;
          to: string;
        },
        string
      >;
      updateManualEmail: FunctionReference<
        "mutation",
        "internal",
        {
          emailId: string;
          errorMessage?: string;
          resendId?: string;
          status:
            | "waiting"
            | "queued"
            | "cancelled"
            | "sent"
            | "delivered"
            | "delivery_delayed"
            | "bounced"
            | "failed";
        },
        null
      >;
    };
  };
};
