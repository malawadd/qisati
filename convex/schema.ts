import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  appUsers: defineTable({
    handle: v.string(),
    avatarUrl: v.string(),
    bannerUrl: v.optional(v.string()),
    about: v.optional(v.string()),
    authUserId: v.optional(v.id("users")), // Link to auth user
  }).index("by_handle", ["handle"])
    .index("by_auth_user", ["authUserId"]),

  userSocials: defineTable({
    userId: v.id("appUsers"),
    platform: v.string(), // "twitter", "instagram", "website", etc.
    url: v.string(),
    displayText: v.optional(v.string()),
  }).index("by_user", ["userId"]),

  follows: defineTable({
    followerId: v.id("appUsers"),
    followingId: v.id("appUsers"),
    createdAt: v.number(),
  }).index("by_follower", ["followerId"])
    .index("by_following", ["followingId"])
    .index("by_follower_following", ["followerId", "followingId"]),

  series: defineTable({
    slug: v.string(),
    title: v.string(),
    coverUrl: v.string(),
    logline: v.string(),
    synopsisMd: v.string(),
    author: v.id("appUsers"),
    contract: v.string(),
    tokenId: v.number(),
    category: v.optional(v.union(
      v.literal("sci-fi"),
      v.literal("fantasy"), 
      v.literal("thriller"),
      v.literal("romance"),
      v.literal("mystery"),
      v.literal("literary")
    )),
  }).index("by_slug", ["slug"])
    .index("by_author", ["author"])
    .index("by_category", ["category"]),

  chapters: defineTable({
    series: v.id("series"),
    index: v.number(),
    title: v.string(),
    wordCount: v.number(),
    status: v.union(v.literal("draft"), v.literal("live"), v.literal("coming")),
    priceEth: v.number(),
    supply: v.number(),
    remaining: v.number(),
    tokenId: v.number(),
    markdownCid: v.string(),
    draftMd: v.optional(v.string()),   // live draft while editing
    bodyMd: v.optional(v.string()),    // final Markdown after mint
  }).index("by_series", ["series"])
    .index("by_series_and_index", ["series", "index"]),

  comments: defineTable({
    chapter: v.id("chapters"),
    author: v.id("appUsers"),
    body: v.string(),
    createdAt: v.number(),
  }).index("by_chapter", ["chapter"]),

  tokenSnapshots: defineTable({
    contract: v.string(),
    tokenId: v.number(),
    block: v.number(),
    remaining: v.number(),
    totalMinted: v.number(),
    priceEth: v.number(),
  }).index("by_contract_and_token", ["contract", "tokenId"]),

  pendingTxs: defineTable({
    hash: v.string(),
    type: v.union(
      v.literal("mintSeries"), 
      v.literal("mintChapter"), 
      v.literal("collect")
    ),
    user: v.id("appUsers"),
    series: v.optional(v.id("series")),
    chapter: v.optional(v.id("chapters")),
    createdAt: v.number(),
  }).index("by_hash", ["hash"])
    .index("by_user", ["user"]),

  metrics: defineTable({
    totalSeries: v.number(),
    totalChapters: v.number(),
    totalEthEarned: v.number(),
  }),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
