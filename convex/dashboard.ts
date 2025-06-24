import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const authorDashboard = query({
  args: { sessionId: v.id("walletSessions") },
  handler: async (ctx, args) => {
    // Get wallet session and user
    const session = await ctx.db.get(args.sessionId);
    if (!session || session.expiresAt < Date.now()) {
      return { drafts: [], liveChapters: [], earnings: 0, user: null };
    }

    // Find user by wallet address
    const appUser = await ctx.db
      .query("appUsers")
      .withIndex("by_wallet_address", (q) => q.eq("walletAddress", session.walletAddress))
      .first();

    // If no app user exists, return empty dashboard (will be created by mutation)
    if (!appUser) {
      return { drafts: [], liveChapters: [], earnings: 0, user: null, needsAppUser: true };
    }

    // Get user's series
    const userSeries = await ctx.db
      .query("series")
      .withIndex("by_author", (q) => q.eq("author", appUser._id))
      .collect();

    const allChapters: any[] = [];
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
  args: { sessionId: v.id("walletSessions") },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session || session.expiresAt < Date.now()) {
      throw new Error("Must be logged in to withdraw");
    }

    // Find user by wallet address
    const appUser = await ctx.db
      .query("appUsers")
      .withIndex("by_wallet_address", (q) => q.eq("walletAddress", session.walletAddress))
      .first();

    if (!appUser) {
      throw new Error("User not found");
    }
    
    // TODO: Call Zora withdrawRewards on client, then mark in db if needed
    console.log("Withdrawal requested for user:", appUser._id);
    return { ok: true };
  }
});
