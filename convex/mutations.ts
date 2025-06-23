import { mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const addComment = mutation({
  args: { 
    chapterId: v.id("chapters"), 
    body: v.string() 
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to comment");
    }
    
    // Find user by auth ID - for now create a simple mapping
    // TODO: Properly link auth users to app users
    const appUser = await ctx.db.query("appUsers").first();
    if (!appUser) {
      throw new Error("User not found");
    }
    
    return await ctx.db.insert("comments", {
      chapter: args.chapterId,
      author: appUser._id,
      body: args.body,
      createdAt: Date.now()
    });
  }
});

export const saveDraftMd = mutation({
  args: {
    chapterId: v.id("chapters"),
    md: v.string()
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to save draft");
    }
    
    await ctx.db.patch(args.chapterId, {
      draftMd: args.md
    });
    
    return { success: true };
  }
});

export const publishChapter = mutation({
  args: { chapterId: v.id("chapters") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to publish");
    }
    
    const chapter = await ctx.db.get(args.chapterId);
    if (!chapter) {
      throw new Error("Chapter not found");
    }
    
    // Move draft content to published content
    await ctx.db.patch(args.chapterId, {
      bodyMd: chapter.draftMd || chapter.bodyMd,
      draftMd: undefined,
      status: "live"
    });
    
    return { success: true };
  }
});

export const recordPendingTx = mutation({
  args: {
    hash: v.string(),
    type: v.union(v.literal("mintSeries"), v.literal("mintChapter"), v.literal("collect")),
    series: v.optional(v.id("series")),
    chapter: v.optional(v.id("chapters"))
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in");
    }
    
    // Find user by auth ID
    const appUser = await ctx.db.query("appUsers").first();
    if (!appUser) {
      throw new Error("User not found");
    }
    
    return await ctx.db.insert("pendingTxs", {
      hash: args.hash,
      type: args.type,
      user: appUser._id,
      series: args.series,
      chapter: args.chapter,
      createdAt: Date.now()
    });
  }
});

export const clearPendingTx = internalMutation({
  args: { hash: v.string() },
  handler: async (ctx, args) => {
    const tx = await ctx.db
      .query("pendingTxs")
      .withIndex("by_hash", (q) => q.eq("hash", args.hash))
      .first();
    
    if (tx) {
      await ctx.db.delete(tx._id);
    }
  }
});

export const updateChapterSupply = internalMutation({
  args: { 
    chapterId: v.id("chapters"), 
    remaining: v.number(),
    priceEth: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const updates: any = { remaining: args.remaining };
    if (args.priceEth !== undefined) {
      updates.priceEth = args.priceEth;
    }
    
    await ctx.db.patch(args.chapterId, updates);
  }
});

export const collectChapter = mutation({
  args: { chapterId: v.id("chapters") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to collect");
    }
    
    const chapter = await ctx.db.get(args.chapterId);
    if (!chapter) {
      throw new Error("Chapter not found");
    }
    
    if (chapter.remaining <= 0) {
      throw new Error("Chapter sold out");
    }
    
    // Optimistically update supply
    await ctx.db.patch(args.chapterId, {
      remaining: chapter.remaining - 1
    });
    
    // TODO: Trigger actual Zora mint transaction
    // For now, just record a pending transaction
    const mockTxHash = `0x${Math.random().toString(16).slice(2)}`;
    
    const appUser = await ctx.db.query("appUsers").first();
    if (appUser) {
      await ctx.db.insert("pendingTxs", {
        hash: mockTxHash,
        type: "collect",
        user: appUser._id,
        chapter: args.chapterId,
        createdAt: Date.now()
      });
    }
    
    return { txHash: mockTxHash };
  }
});
