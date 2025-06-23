import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const updateSeriesTitle = mutation({
  args: { seriesId: v.id("series"), title: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to update series");
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
  args: { seriesId: v.id("series") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to create chapter");
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
