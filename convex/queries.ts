import { query } from "./_generated/server";
import { v } from "convex/values";

export const homeStats = query({
  args: {},
  handler: async (ctx) => {
    const metrics = await ctx.db.query("metrics").first();
    if (!metrics) {
      return {
        stories: "0",
        authors: "0", 
        collectors: "0",
        volume: "$0"
      };
    }
    
    const userCount = await ctx.db.query("appUsers").collect();
    return {
      stories: `${(metrics.totalSeries / 1000).toFixed(1)}K`,
      authors: `${(userCount.length / 1000).toFixed(1)}K`,
      collectors: "45K", // TODO: calculate from on-chain data
      volume: `$${metrics.totalEthEarned}M`
    };
  }
});

export const exploreFeed = query({
  args: { 
    page: v.optional(v.number()),
    category: v.optional(v.string()),
    search: v.optional(v.string())
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
      id: chapter._id,
      title: chapter.title,
      content: chapter.bodyMd || "Draft not published yet.",
      price: `${chapter.priceEth} ETH`,
      supply: {
        current: chapter.remaining,
        total: chapter.supply
      },
      owned: false, // TODO: check user's NFT ownership
      comments: comments.length,
      series: chapter.series,
      index: chapter.index
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
      previous: currentIdx > 0 ? chapters[currentIdx - 1] : null,
      next: currentIdx < chapters.length - 1 ? chapters[currentIdx + 1] : null
    };
  }
});
