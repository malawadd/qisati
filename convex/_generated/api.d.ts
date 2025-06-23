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
import type * as chainsync from "../chainsync.js";
import type * as createChapter from "../createChapter.js";
import type * as crons from "../crons.js";
import type * as dashboard from "../dashboard.js";
import type * as http from "../http.js";
import type * as migrations from "../migrations.js";
import type * as mintChapter from "../mintChapter.js";
import type * as mutations from "../mutations.js";
import type * as profiles from "../profiles.js";
import type * as queries from "../queries.js";
import type * as router from "../router.js";
import type * as seed from "../seed.js";
import type * as seriesMutations from "../seriesMutations.js";
import type * as uploadImage from "../uploadImage.js";
import type * as users from "../users.js";

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
  chainsync: typeof chainsync;
  createChapter: typeof createChapter;
  crons: typeof crons;
  dashboard: typeof dashboard;
  http: typeof http;
  migrations: typeof migrations;
  mintChapter: typeof mintChapter;
  mutations: typeof mutations;
  profiles: typeof profiles;
  queries: typeof queries;
  router: typeof router;
  seed: typeof seed;
  seriesMutations: typeof seriesMutations;
  uploadImage: typeof uploadImage;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
