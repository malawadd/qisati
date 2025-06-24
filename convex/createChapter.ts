import { mutation } from "./_generated/server";
import { v } from "convex/values";


export const createNewChapter = mutation({
  args: {
    sessionId: v.id("walletSessions"),
    title: v.string(),
    seriesId: v.optional(v.id("series"))
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session || session.expiresAt < Date.now()) {
      throw new Error("Must be logged in to create chapter");
    }

    const appUser = await ctx.db
    .query("appUsers")
    .withIndex("by_wallet_address", (q) => q.eq("walletAddress", session.walletAddress))
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
