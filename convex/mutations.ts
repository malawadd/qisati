/* eslint-disable @typescript-eslint/ban-ts-comment */

// @ts-nocheck
import { mutation, internalMutation } from "./_generated/server";
import { api } from "./_generated/api";
import { v } from "convex/values";
// No need for getAuthUserId

export const addComment = mutation({
  args: { 
    sessionId: v.id("walletSessions"),
    chapterId: v.id("chapters"), 
    body: v.string() 
  },
  handler: async (ctx, args) => {
    // Use a query for wallet session and user
    const session = await ctx.runQuery(api.queries.walletSessionById, { sessionId: args.sessionId });
    if (!session || session.expiresAt < Date.now()) {
      throw new Error("Must be logged in to comment");
    }
    const appUser = await ctx.runQuery(api.queries.appUserByWalletAddress, { walletAddress: session.walletAddress });
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
    sessionId: v.id("walletSessions"),
    chapter: v.id("chapters"), 
    md: v.string() 
  },
  handler: async (ctx, args) => {
    const session = await ctx.runQuery(api.queries.walletSessionById, { sessionId: args.sessionId });
    if (!session || session.expiresAt < Date.now()) {
      throw new Error("Must be logged in to save draft");
    }
    // Optionally check author rights as above

    const existingDraft = await ctx.db
      .query("drafts")
      .withIndex("by_chapter", (q) => q.eq("chapter", args.chapter))
      .first();
    
    if (existingDraft) {
      await ctx.db.patch(existingDraft._id, {
        bodyMd: args.md,
        updated: Date.now()
      });
    } else {
      await ctx.db.insert("drafts", {
        chapter: args.chapter,
        bodyMd: args.md,
        updated: Date.now()
      });
    }
    
    return { success: true };
  }
});

// export const publishChapter = mutation({
//   args: { 
//     sessionId: v.id("walletSessions"),
//     chapterId: v.id("chapters") 
//   },
//   handler: async (ctx, args) => {
//     const session = await ctx.runQuery(api.queries.walletSessionById, { sessionId: args.sessionId });
//     if (!session || session.expiresAt < Date.now()) {
//       throw new Error("Must be logged in to publish");
//     }
//     // Optionally check author rights

//     const chapter = await ctx.db.get(args.chapterId);
//     if (!chapter) {
//       throw new Error("Chapter not found");
//     }
    
//     await ctx.db.patch(args.chapterId, {
//       bodyMd: chapter.draftMd || chapter.bodyMd,
//       draftMd: undefined,
//       status: "live"
//     });
    
//     return { success: true };
//   }
// });

export const publishChapter = mutation({
  args: { 
    sessionId: v.id("walletSessions"),
    chapterId: v.id("chapters") 
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session || session.expiresAt < Date.now()) {
      throw new Error("Must be logged in to publish");
    }
    // Optionally check author rights

    const chapter = await ctx.db.get(args.chapterId);
    if (!chapter) {
      throw new Error("Chapter not found");
    }

    // Get the draft from the drafts table
    const draft = await ctx.db
      .query("drafts")
      .withIndex("by_chapter", (q) => q.eq("chapter", args.chapterId))
      .first();

    if (!draft || !draft.bodyMd) {
      throw new Error("No draft found to publish");
    }

    // Move draft content to published content
    console.log("Publishing chapter:", args.chapterId, "with draft content:", draft.bodyMd);
    await ctx.db.patch(args.chapterId, {
      bodyMd: draft.bodyMd,
      draftMd: undefined, // optional: you may want to remove this field
      status: "live"
    });

    return { success: true };
  }
});
export const saveCharacterVoice = mutation({
  args: {
    sessionId: v.id("walletSessions"),
    name: v.string(),
    openaiVoiceId: v.union(
      v.literal("alloy"),
      v.literal("ash"),
      v.literal("ballad"),
      v.literal("coral"),
      v.literal("echo"), 
      v.literal("fable"),
      v.literal("onyx"),
      v.literal("nova"),
      v.literal("sage"),
      v.literal("shimmer"),
      v.literal("verse")
    ),
    instructions: v.optional(v.string()),
    description: v.optional(v.string()),
    characterId: v.optional(v.id("characterVoices")) // For updates
  },
  handler: async (ctx, args) => {
    const session = await ctx.runQuery(api.queries.walletSessionById, { sessionId: args.sessionId });
    if (!session || session.expiresAt < Date.now()) {
      throw new Error("Must be logged in to save character voice");
    }
    
    const appUser = await ctx.runQuery(api.queries.appUserByWalletAddress, { walletAddress: session.walletAddress });
    if (!appUser) {
      throw new Error("User not found");
    }

    if (args.characterId) {
      // Update existing character
      const existing = await ctx.db.get(args.characterId);
      if (!existing || existing.userId !== appUser._id) {
        throw new Error("Character not found or not owned by user");
      }
      
      await ctx.db.patch(args.characterId, {
        name: args.name,
        openaiVoiceId: args.openaiVoiceId,
        instructions: args.instructions,
        description: args.description
      });
      
      return args.characterId;
    } else {
      // Create new character
      return await ctx.db.insert("characterVoices", {
        userId: appUser._id,
        name: args.name,
        openaiVoiceId: args.openaiVoiceId,
        instructions: args.instructions,
        description: args.description,
        createdAt: Date.now()
      });
    }
  }
});

export const deleteCharacterVoice = mutation({
  args: {
    sessionId: v.id("walletSessions"),
    characterId: v.id("characterVoices")
  },
  handler: async (ctx, args) => {
    const session = await ctx.runQuery(api.queries.walletSessionById, { sessionId: args.sessionId });
    if (!session || session.expiresAt < Date.now()) {
      throw new Error("Must be logged in to delete character voice");
    }
    
    const appUser = await ctx.runQuery(api.queries.appUserByWalletAddress, { walletAddress: session.walletAddress });
    if (!appUser) {
      throw new Error("User not found");
    }

    const character = await ctx.db.get(args.characterId);
    if (!character || character.userId !== appUser._id) {
      throw new Error("Character not found or not owned by user");
    }
    
    await ctx.db.delete(args.characterId);
    return { success: true };
  }
});

export const recordPendingTx = mutation({
  args: {
    sessionId: v.id("walletSessions"),
    hash: v.string(),
    type: v.union(v.literal("mintSeries"), v.literal("mintChapter"), v.literal("collect")),
    series: v.optional(v.id("series")),
    chapter: v.optional(v.id("chapters"))
  },
  handler: async (ctx, args) => {
    const session = await ctx.runQuery(api.queries.walletSessionById, { sessionId: args.sessionId });
    if (!session || session.expiresAt < Date.now()) {
      throw new Error("Must be logged in");
    }
    const appUser = await ctx.runQuery(api.queries.appUserByWalletAddress, { walletAddress: session.walletAddress });
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

// Internal mutations do not need session changes
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
  args: { 
    sessionId: v.id("walletSessions"),
    chapterId: v.id("chapters")
  },
  handler: async (ctx, args) => {
    const session = await ctx.runQuery(api.queries.walletSessionById, { sessionId: args.sessionId });
    if (!session || session.expiresAt < Date.now()) {
      throw new Error("Must be logged in to collect");
    }
    // Optionally check user or ownership

    const chapter = await ctx.db.get(args.chapterId);
    if (!chapter) {
      throw new Error("Chapter not found");
    }
    if (chapter.remaining <= 0) {
      throw new Error("Chapter sold out");
    }
    await ctx.db.patch(args.chapterId, {
      remaining: chapter.remaining - 1
    });
    const mockTxHash = `0x${Math.random().toString(16).slice(2)}`;
    const appUser = await ctx.runQuery(api.queries.appUserByWalletAddress, { walletAddress: session.walletAddress });
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

export const updateChapterAfterMint = mutation({
  args: {
    chapterId: v.id("chapters"),
    tokenId: v.number(),
    priceEth: v.number(),
    supply: v.number(),
    remaining: v.number(),
    status: v.union(v.literal("draft"), v.literal("live"), v.literal("coming"))
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.chapterId, {
      tokenId: args.tokenId,
      priceEth: args.priceEth,
      supply: args.supply,
      remaining: args.remaining,
      status: args.status
    });
    return { success: true };
  }
});

export const updateChapterAudioSegments = mutation({
  args: {
    chapterId: v.id("chapters"),
    audioSegments: v.array(v.object({
      text: v.string(),
      audioUrl: v.string(),
      characterId: v.optional(v.string()),
      startIndex: v.number(),
      endIndex: v.number()
    })),
    audioGenerationCount: v.number()
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.chapterId, {
      audioSegments: args.audioSegments,
      audioGenerationCount: args.audioGenerationCount
    });
    return { success: true };
  }
});