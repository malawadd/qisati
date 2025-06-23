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
  args: { page: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const page = args.page || 1;
    const limit = 12;
    const offset = (page - 1) * limit;
    
    const series = await ctx.db.query("series").collect();
    const result = [];
    
    for (const s of series.slice(offset, offset + limit)) {
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
    
    // TODO: Fetch actual content from IPFS using markdownCid
    const mockContent = `# ${chapter.title}

Maya stared at her laptop screen, the cursor blinking mockingly in the empty document. Three years of corporate life had drained her creativity, leaving her with nothing but spreadsheets and meeting notes.

The notification sound broke her concentration. Another Slack message from her manager about the quarterly reports. She closed the laptop with more force than necessary.

"That's it," she whispered to her empty apartment. "I'm done."

## The Plan

Within hours, Maya had outlined her escape:

1. Quit her job (obviously)
2. Sell everything she couldn't carry  
3. Buy a one-way ticket to Bali
4. Figure out the rest later

It wasn't the most detailed plan, but it was hers. For the first time in years, she felt truly alive.`;
    
    return {
      id: chapter._id,
      title: chapter.title,
      content: mockContent,
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

export const commentsForChapter = query({
  args: { id: v.id("chapters"), page: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const page = args.page || 1;
    const limit = 20;
    const offset = (page - 1) * limit;
    
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_chapter", (q) => q.eq("chapter", args.id))
      .order("desc")
      .collect();
    
    const result = [];
    for (const comment of comments.slice(offset, offset + limit)) {
      const author = await ctx.db.get(comment.author);
      result.push({
        id: comment._id,
        body: comment.body,
        author: {
          name: author?.handle || "Anonymous",
          avatar: author?.avatarUrl || ""
        },
        createdAt: comment.createdAt
      });
    }
    
    return result;
  }
});
