import { query } from "./_generated/server";
import { v } from "convex/values";

export const homeStats = query({
  args: {},
  handler: async (ctx) => {
    // Get total number of series (stories)
    const allSeries = await ctx.db.query("series").collect();
    const totalSeries = allSeries.length;
    
    // Get total number of authors
    const allUsers = await ctx.db.query("appUsers").collect();
    const totalAuthors = allUsers.length;
    
    // Calculate total volume from live chapters
    const liveChapters = await ctx.db
      .query("chapters")
      .filter((q) => q.eq(q.field("status"), "live"))
      .collect();
    
    const totalEthEarned = liveChapters.reduce((sum, chapter) => {
      const sold = chapter.supply - chapter.remaining;
      return sum + (chapter.priceEth * sold);
    }, 0);
    
    // TODO: Calculate actual collector count from on-chain data
    const estimatedCollectors = Math.floor(totalEthEarned * 15); // Rough estimate
    
    return {
      stories: formatCount(totalSeries),
      authors: formatCount(totalAuthors),
      collectors: formatCount(estimatedCollectors),
      volume: formatEth(totalEthEarned)
    };
  }
});

// Helper function to format counts
function formatCount(count: number): string {
  if (count === 0) return "0";
  if (count < 1000) return count.toString();
  if (count < 1000000) return `${(count / 1000).toFixed(1)}K`;
  return `${(count / 1000000).toFixed(1)}M`;
}

// Helper function to format ETH amounts
function formatEth(ethAmount: number): string {
  if (ethAmount === 0) return "$0";
  if (ethAmount < 0.001) return "<$0.001";
  if (ethAmount < 1) return `$${ethAmount.toFixed(3)}`;
  if (ethAmount < 1000) return `$${ethAmount.toFixed(2)}`;
  if (ethAmount < 1000000) return `$${(ethAmount / 1000).toFixed(1)}K`;
  return `$${(ethAmount / 1000000).toFixed(1)}M`;
}

export const exploreFeed = query({
  args: { 
    page: v.optional(v.number()),
    category: v.optional(v.string()),
    search: v.optional(v.string()),
    includeNoContract: v.optional(v.boolean())
  },
  handler: async (ctx, args) => {
    const page = args.page || 1;
    const limit = 12;
    const offset = (page - 1) * limit;
    
    let allSeries;
    
    // Filter by category if specified
    if (args.category && args.category !== "all") {
      allSeries = await ctx.db
        .query("series")
        .withIndex("by_category", (q) => q.eq("category", args.category as any))
        .collect();
    } else {
      allSeries = await ctx.db.query("series").collect();
    }
    
    // Filter out series with default/empty contract addresses unless includeNoContract is true
    if (!args.includeNoContract) {
      allSeries = allSeries.filter(series => 
        series.contract && series.contract !== "0x0000000000000000000000000000000000000000"
      );
    }
    
    // Filter by search term if specified
    let filteredSeries = allSeries;
    if (args.search) {
      const searchLower = args.search.toLowerCase();
      filteredSeries = allSeries.filter(s => 
        s.title.toLowerCase().includes(searchLower) ||
        s.logline.toLowerCase().includes(searchLower)
      );
    }
    
    const series = filteredSeries.slice(offset, offset + limit);
    const result = [];
    
    for (const s of series) {
      const author = await ctx.db.get(s.author);
      const chapters = await ctx.db
        .query("chapters")
        .withIndex("by_series", (q) => q.eq("series", s._id))
        .collect();
      
      const totalSupply = chapters.reduce((sum, ch) => sum + ch.supply, 0);
      const currentSupply = chapters.reduce((sum, ch) => sum + ch.remaining, 0);
      
      result.push({
        id: s._id,
        slug: s.slug,
        title: s.title,
        author: {
          name: author?.handle || "Unknown",
          avatar: author?.avatarUrl || ""
        },
        cover: s.coverUrl,
        price: "0.05 ETH", // TODO: calculate from chapters
        supply: {
          current: currentSupply,
          total: totalSupply
        }
      });
    }
    
    return result;
  }
});

export const seriesBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const series = await ctx.db
      .query("series")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    
    if (!series) return null;
    
    const author = await ctx.db.get(series.author);
    const chapters = await ctx.db
      .query("chapters")
      .withIndex("by_series", (q) => q.eq("series", series._id))
      .order("asc")
      .collect();
    
    return {
      id: series._id,
      title: series.title,
      logline: series.logline,
      synopsis: series.synopsisMd,
      author: {
        name: author?.handle || "Unknown",
        bio: author?.about || "",
        avatar: author?.avatarUrl || ""
      },
      cover: series.coverUrl,
      chapters: chapters.map(ch => ({
        id: ch._id,
        title: ch.title,
        wordCount: ch.wordCount,
        status: ch.status,
        price: `${ch.priceEth} ETH`,
        supply: {
          current: ch.remaining,
          total: ch.supply
        }
      }))
    };
  }
});

export const chapterById = query({
  args: { id: v.id("chapters") },
  handler: async (ctx, args) => {
    const chapter = await ctx.db.get(args.id);
    if (!chapter) return null;
    
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_chapter", (q) => q.eq("chapter", args.id))
      .order("desc")
      .take(10);
    
    return {
      ...chapter,
      content: chapter.bodyMd || "Draft not published yet.",
      price: `${chapter.priceEth} ETH`,
      supply: {
        current: chapter.remaining,
        total: chapter.supply
      },
      owned: false, // TODO: check user's NFT ownership
      comments: comments.length
    };
  }
});

export const getChapterNavigation = query({
  args: { seriesId: v.id("series"), currentIndex: v.number() },
  handler: async (ctx, args) => {
    const chapters = await ctx.db
      .query("chapters")
      .withIndex("by_series", (q) => q.eq("series", args.seriesId))
      .order("asc")
      .collect();
    
    const currentIdx = chapters.findIndex(ch => ch.index === args.currentIndex);
    
    return {
      previous: currentIdx > 0 ? {
        _id: chapters[currentIdx - 1]._id,
        title: chapters[currentIdx - 1].title,
        index: chapters[currentIdx - 1].index
      } : null,
      next: currentIdx < chapters.length - 1 ? {
        _id: chapters[currentIdx + 1]._id,
        title: chapters[currentIdx + 1].title,
        index: chapters[currentIdx + 1].index
      } : null
    };
  }
});

export const draftByChapter = query({
  args: { chapterId: v.id("chapters") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("drafts")
      .withIndex("by_chapter", (q) => q.eq("chapter", args.chapterId))
      .first();
  }
});

export const seriesById = query({
  args: { id: v.id("series") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  }
});

export const chaptersForSeries = query({
  args: { seriesId: v.id("series") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("chapters")
      .withIndex("by_series", (q) => q.eq("series", args.seriesId))
      .order("asc")
      .collect();
  }
});

export const walletSessionById = query({
  args: { sessionId: v.id("walletSessions") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.sessionId);
  },
});

// Get appUser by wallet address
export const appUserByWalletAddress = query({
  args: { walletAddress: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("appUsers")
      .withIndex("by_wallet_address", (q) => q.eq("walletAddress", args.walletAddress))
      .first();
  },
});

export const getCharacterVoicesByUser = query({
  args: { sessionId: v.id("walletSessions") },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session || session.expiresAt < Date.now()) {
      return [];
    }
    
    const appUser = await ctx.db
      .query("appUsers")
      .withIndex("by_wallet_address", (q) => q.eq("walletAddress", session.walletAddress))
      .first();
    
    if (!appUser) {
      return [];
    }
    
    return await ctx.db
      .query("characterVoices")
      .withIndex("by_user", (q) => q.eq("userId", appUser._id))
      .order("desc")
      .collect();
  }
});

export const getCharacterVoicesByIds = query({
  args: { characterIds: v.array(v.id("characterVoices")) },
  handler: async (ctx, args) => {
    if (args.characterIds.length === 0) {
      return [];
    }
    
    const characterVoices = [];
    for (const id of args.characterIds) {
      const voice = await ctx.db.get(id);
      if (voice) {
        characterVoices.push(voice);
      }
    }
    
    return characterVoices;
  }
});