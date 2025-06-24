import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

export const mintChapter = action({
  args: {
    sessionId: v.id("walletSessions"),
    chapterId: v.id("chapters"),
    size: v.number(),
    price: v.number(),
    splits: v.optional(v.array(v.object({
      address: v.string(),
      percentage: v.number()
    })))
  },
  handler: async (ctx, args) => {
    // Use runQuery for all DB fetches!
    const session = await ctx.runQuery(api.queries.walletSessionById, { sessionId: args.sessionId });
    console.log("Session:", session);
    console.log("Session expires at:", session?.expiresAt, "Current time:", Date.now());
    if (!session || session.expiresAt < Date.now()) {
      throw new Error("Must be logged in to mint");
    }

    const appUser = await ctx.runQuery(api.queries.appUserByWalletAddress, { walletAddress: session.walletAddress });
    if (!appUser) {
      throw new Error("User not found");
    }

    // The rest stays the same...
    const chapter = await ctx.runQuery(api.queries.chapterById, { id: args.chapterId });
    if (!chapter) {
      throw new Error("Chapter not found");
    }
    const series = await ctx.runQuery(api.queries.seriesById, { id: chapter.series });
    if (!series) {
      throw new Error("Series not found");
    }
    if (String(series.author) !== String(appUser._id)) {
      throw new Error("Not authorized");
    }

    // Mint logic, etc.
    const mockTokenId = Math.floor(Math.random() * 10000) + 1000;
    const mockTxHash = `0x${Math.random().toString(16).slice(2)}`;
    console.log("Mock token ID:", mockTokenId);
    console.log("Mock transaction hash:", mockTxHash);

    if (chapter.status !== "live") {
      // Not published, so publish it!
      await ctx.runMutation(api.mutations.publishChapter, {
        sessionId: args.sessionId,
        chapterId: args.chapterId,
      });
    }

    await ctx.runMutation(api.mutations.updateChapterAfterMint, {
      chapterId: args.chapterId,
      tokenId: mockTokenId,
      priceEth: args.price,
      supply: args.size,
      remaining: args.size,
      status: "live"
    });
    console.log("Chapter updated after minting");

    await ctx.runMutation(api.mutations.recordPendingTx, {
      sessionId: args.sessionId,
      hash: mockTxHash,
      type: "mintChapter",
      chapter: args.chapterId
    });

    console.log("recordPendingTx updated after minting");

    return { 
      txHash: mockTxHash, 
      tokenId: mockTokenId,
      success: true 
    };
  }
});
