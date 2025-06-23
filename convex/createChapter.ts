import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createNewChapter = mutation({
  args: {
    title: v.string(),
    seriesId: v.optional(v.id("series"))
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to create chapter");
    }

    const appUser = await ctx.db
      .query("appUsers")
      .withIndex("by_auth_user", (q) => q.eq("authUserId", userId))
      .first();
    
    if (!appUser) {
      throw new Error("User not found");
    }

    let seriesId = args.seriesId;
    
    // If no series provided, create a default one
    if (!seriesId) {
      seriesId = await ctx.db.insert("series", {
        slug: `untitled-${Date.now()}`,
        title: "Untitled Series",
        coverUrl: "https://picsum.photos/240/360?random=new",
        logline: "A new story in progress...",
        synopsisMd: "# About This Series\n\nThis is a new series.",
        author: appUser._id,
        contract: "0x0000000000000000000000000000000000000000",
        tokenId: 0,
        category: "literary"
      });
    }

    // Get next chapter index
    const existingChapters = await ctx.db
      .query("chapters")
      .withIndex("by_series", (q) => q.eq("series", seriesId))
      .collect();
    
    const nextIndex = existingChapters.length + 1;

    const chapterId = await ctx.db.insert("chapters", {
      series: seriesId,
      index: nextIndex,
      title: args.title,
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

    return { chapterId, seriesId };
  }
});
