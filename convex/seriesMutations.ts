import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const updateSeriesTitle = mutation({
  args: { sessionId: v.id("walletSessions"), seriesId: v.id("series"), title: v.string() },
  handler: async (ctx, args) => {
    // Authenticate via wallet session
    const session = await ctx.db.get(args.sessionId);
    if (!session || session.expiresAt < Date.now()) {
      throw new Error("Must be logged in to update series");
    }

    // (Optionally) check if the user is the author of the series
    // Get the series to check author
    const series = await ctx.db.get(args.seriesId);
    if (!series) throw new Error("Series not found");
    const appUser = await ctx.db
      .query("appUsers")
      .withIndex("by_wallet_address", (q) => q.eq("walletAddress", session.walletAddress))
      .first();
    if (!appUser || String(series.author) !== String(appUser._id)) {
      throw new Error("Not authorized");
    }

    // Check if any chapters are live
    const liveChapter = await ctx.db
      .query("chapters")
      .withIndex("by_series", (q) => q.eq("series", args.seriesId))
      .filter((q) => q.eq(q.field("status"), "live"))
      .first();
    
    if (liveChapter) {
      throw new Error("Series locked after first publish");
    }

    await ctx.db.patch(args.seriesId, { title: args.title });
    return { success: true };
  }
});

export const createDraftChapter = mutation({
  args: { sessionId: v.id("walletSessions"), seriesId: v.id("series") },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session || session.expiresAt < Date.now()) {
      throw new Error("Must be logged in to create chapter");
    }
    // (Optionally) check if the user is the author of the series
    const series = await ctx.db.get(args.seriesId);
    if (!series) throw new Error("Series not found");
    const appUser = await ctx.db
      .query("appUsers")
      .withIndex("by_wallet_address", (q) => q.eq("walletAddress", session.walletAddress))
      .first();
    if (!appUser || String(series.author) !== String(appUser._id)) {
      throw new Error("Not authorized");
    }

    // Get the last chapter to determine next index
    const lastChapter = await ctx.db
      .query("chapters")
      .withIndex("by_series", (q) => q.eq("series", args.seriesId))
      .order("desc")
      .first();
    
    const nextIndex = lastChapter ? lastChapter.index + 1 : 1;

    const chapterId = await ctx.db.insert("chapters", {
      series: args.seriesId,
      index: nextIndex,
      title: `Untitled ${nextIndex}`,
      wordCount: 0,
      status: "draft",
      priceEth: 0.002,
      supply: 100,
      remaining: 100,
      tokenId: 0,
      markdownCid: "",
      draftMd: "",
      bodyMd: ""
    });

    return chapterId;
  }
});

export const updateChapterTitle = mutation({
  args: { sessionId: v.id("walletSessions"), chapterId: v.id("chapters"), title: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session || session.expiresAt < Date.now()) {
      throw new Error("Must be logged in to update chapter");
    }

    // (Optionally) check if the user is the author of the chapter
    const chapter = await ctx.db.get(args.chapterId);
    if (!chapter) throw new Error("Chapter not found");
    const series = await ctx.db.get(chapter.series);
    if (!series) throw new Error("Series not found");
    const appUser = await ctx.db
      .query("appUsers")
      .withIndex("by_wallet_address", (q) => q.eq("walletAddress", session.walletAddress))
      .first();
    if (!appUser || String(series.author) !== String(appUser._id)) {
      throw new Error("Not authorized");
    }

    await ctx.db.patch(args.chapterId, { title: args.title });
    return { success: true };
  }
});
