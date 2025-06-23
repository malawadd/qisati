import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const authorDashboard = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return { drafts: [], liveChapters: [], earnings: 0, user: null };
    }

    // Find user by auth ID
    const appUser = await ctx.db
      .query("appUsers")
      .withIndex("by_auth_user", (q) => q.eq("authUserId", userId))
      .first();
    
    if (!appUser) {
      return { drafts: [], liveChapters: [], earnings: 0, user: null };
    }

    // Get user's series
    const userSeries = await ctx.db
      .query("series")
      .withIndex("by_author", (q) => q.eq("author", appUser._id))
      .collect();

    const allChapters = [];
    for (const series of userSeries) {
      const chapters = await ctx.db
        .query("chapters")
        .withIndex("by_series", (q) => q.eq("series", series._id))
        .collect();
      allChapters.push(...chapters);
    }

    const drafts = allChapters.filter(ch => ch.status === "draft");
    const liveChapters = allChapters.filter(ch => ch.status === "live");
    
    const earnings = liveChapters.reduce((sum, ch) => 
      sum + (ch.priceEth * (ch.supply - ch.remaining)), 0
    );

    return { drafts, liveChapters, earnings, user: appUser };
  }
});

export const withdrawRewards = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to withdraw");
    }
    
    // TODO: Call Zora withdrawRewards on client, then mark in db if needed
    console.log("Withdrawal requested for user:", userId);
    return { ok: true };
  }
});
