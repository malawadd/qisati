import { action, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

export const seedDatabase = action({
  args: {},
  handler: async (ctx) => {
    console.log("Starting database seed...");
    // Create users
    const user1 = await ctx.runMutation(internal.seed.createUser, {
      handle: "sarah_chen",
      avatarUrl: "https://picsum.photos/100/100?random=1",
      about: "Tech journalist turned fiction writer, exploring the intersection of technology and human connection."
    });

    const user2 = await ctx.runMutation(internal.seed.createUser, {
      handle: "kenji_nakamura", 
      avatarUrl: "https://picsum.photos/100/100?random=2",
      about: "Cyberpunk author from Neo Tokyo, writing the future one line of code at a time."
    });

    // Create series
    const series1 = await ctx.runMutation(internal.seed.createSeries, {
      slug: "digital-nomad",
      title: "The Digital Nomad Chronicles",
      coverUrl: "https://picsum.photos/240/360?random=1",
      logline: "A thrilling journey through remote work culture and digital freedom.",
      synopsisMd: "# About This Series\n\nThis is a groundbreaking exploration of modern work culture through the lens of speculative fiction. Follow Maya as she navigates the complexities of digital nomadism in a world where physical location becomes increasingly irrelevant.\n\n## What to Expect\n\n- Deep character development\n- Cutting-edge technology concepts\n- Real-world remote work insights\n- Thrilling plot twists",
      author: user1,
      contract: "0x1234567890123456789012345678901234567890",
      tokenId: 1
    });

    const series2 = await ctx.runMutation(internal.seed.createSeries, {
      slug: "neo-tokyo-nights",
      title: "Midnight in Neo Tokyo",
      coverUrl: "https://picsum.photos/240/360?random=2", 
      logline: "Neon-soaked streets hide digital secrets in this cyberpunk thriller.",
      synopsisMd: "# Neo Tokyo Nights\n\nIn the year 2087, Neo Tokyo pulses with digital life. Hackers, corporate spies, and AI entities navigate a world where reality and virtuality blur beyond recognition.\n\n## The Story\n\nFollow Akira as he uncovers a conspiracy that threatens the very fabric of digital society.",
      author: user2,
      contract: "0x2345678901234567890123456789012345678901",
      tokenId: 1
    });

    const series3 = await ctx.runMutation(internal.seed.createSeries, {
      slug: "last-library",
      title: "The Last Library",
      coverUrl: "https://picsum.photos/240/360?random=3",
      logline: "In a world without books, one librarian fights to preserve human knowledge.",
      synopsisMd: "# The Last Library\n\nBooks are extinct. Knowledge is controlled. But in the ruins of the old world, one library remains.\n\n## The Mission\n\nMaya Rodriguez guards humanity's last collection of physical books, fighting against a regime that seeks to control all information.",
      author: user1,
      contract: "0x3456789012345678901234567890123456789012",
      tokenId: 1
    });

    // Create chapters for each series
    const chapterData = [
      { title: "The Great Escape", wordCount: 3500, markdownCid: "QmChapter1Content" },
      { title: "Bali Bound", wordCount: 4200, markdownCid: "QmChapter2Content" },
      { title: "The Coworking Conspiracy", wordCount: 3800, markdownCid: "QmChapter3Content" },
      { title: "Digital Detox", wordCount: 4100, markdownCid: "QmChapter4Content" },
      { title: "The Network Effect", wordCount: 3900, markdownCid: "QmChapter5Content" }
    ];

    for (const seriesId of [series1, series2, series3]) {
      for (let i = 0; i < 5; i++) {
        const status = i < 2 ? "live" : i === 2 ? "draft" : "coming";
        await ctx.runMutation(internal.seed.createChapter, {
          series: seriesId,
          index: i + 1,
          title: chapterData[i].title,
          wordCount: chapterData[i].wordCount,
          status,
          priceEth: 0.002,
          supply: 500,
          remaining: status === "live" ? Math.floor(Math.random() * 400) + 50 : 500,
          tokenId: i + 2,
          markdownCid: chapterData[i].markdownCid
        });
      }
    }

    // Update metrics
    await ctx.runMutation(internal.seed.updateMetrics, {
      totalSeries: 3,
      totalChapters: 15,
      totalEthEarned: 2.1
    });

    console.log("Database seeded successfully!");
    return "Database seeded successfully!";
  }
});

export const createUser = internalMutation({
  args: { handle: v.string(), avatarUrl: v.string(), about: v.optional(v.string()) },
  handler: async (ctx, args) => {
    return await ctx.db.insert("appUsers", args);
  }
});

export const createSeries = internalMutation({
  args: {
    slug: v.string(),
    title: v.string(), 
    coverUrl: v.string(),
    logline: v.string(),
    synopsisMd: v.string(),
    author: v.id("appUsers"),
    contract: v.string(),
    tokenId: v.number()
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("series", args);
  }
});

export const createChapter = internalMutation({
  args: {
    series: v.id("series"),
    index: v.number(),
    title: v.string(),
    wordCount: v.number(),
    status: v.union(v.literal("draft"), v.literal("live"), v.literal("coming")),
    priceEth: v.number(),
    supply: v.number(),
    remaining: v.number(),
    tokenId: v.number(),
    markdownCid: v.string()
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("chapters", args);
  }
});

export const updateMetrics = internalMutation({
  args: { totalSeries: v.number(), totalChapters: v.number(), totalEthEarned: v.number() },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("metrics").first();
    if (existing) {
      await ctx.db.patch(existing._id, args);
    } else {
      await ctx.db.insert("metrics", args);
    }
  }
});


