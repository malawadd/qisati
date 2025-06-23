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
      tokenId: 1,
      category: "sci-fi"
    });

    // Create chapters with content
    const chapterContents = [
      {
        title: "The Great Escape",
        wordCount: 3500,
        bodyMd: `# The Great Escape

Maya stared at her laptop screen, the cursor blinking mockingly in the empty document. Three years of corporate life had drained her creativity, leaving her with nothing but spreadsheets and meeting notes.

The notification sound broke her concentration. Another Slack message from her manager about the quarterly reports. She closed the laptop with more force than necessary.

"That's it," she whispered to her empty apartment. "I'm done."

## The Plan

Within hours, Maya had outlined her escape:

1. Quit her job (obviously)
2. Sell everything she couldn't carry
3. Buy a one-way ticket to Bali
4. Figure out the rest later

It wasn't the most detailed plan, but it was hers. For the first time in years, she felt truly alive.

The apartment that had felt like a prison now buzzed with possibility. Every item she looked at fell into one of two categories: essential or excess. The excess pile grew quickly.

Her phone buzzed. A text from her best friend Emma: "Coffee tomorrow?"

Maya smiled as she typed back: "Can't. I'm becoming a digital nomad."

The three dots appeared and disappeared several times before Emma's response came: "What?!"

Maya laughed out loud. This was going to be interesting.`
      },
      {
        title: "Bali Bound",
        wordCount: 4200,
        bodyMd: `# Bali Bound

The plane descended through clouds that looked like cotton candy, revealing emerald rice terraces carved into volcanic slopes. Maya pressed her face to the window, watching Bali unfold beneath her like a living postcard.

Twenty-four hours ago, she'd been in a gray cubicle. Now she was about to land in paradise.

## First Steps

The humidity hit her like a warm embrace as she stepped off the plane. The air smelled of frangipani and possibility. Her backpack—everything she owned now—felt surprisingly light on her shoulders.

"Welcome to Bali," said the immigration officer, stamping her passport with a smile that seemed genuinely pleased to see her.

Maya had booked three nights at a hostel in Canggu, figuring that would give her time to find something more permanent. The taxi driver, Wayan, spoke excellent English and peppered her with questions about her plans.

"You work online?" he asked, navigating the chaotic traffic with practiced ease.

"I'm going to try," Maya replied, watching scooters weave between cars like schools of fish.

"Many digital nomads in Canggu. You will like it there."

## The Coworking Scene

The hostel was exactly what she'd expected: young travelers, surfboards leaning against walls, and the constant hum of laptops. Maya checked in and immediately headed to the common area, where a dozen people were working on their computers.

"First time in Bali?" asked a girl with purple hair and a MacBook covered in travel stickers.

"First time anywhere, really," Maya admitted.

"I'm Luna. Been here six months. You'll love it. What do you do?"

"I'm... figuring that out."

Luna grinned. "Perfect. That's what Bali's for."`
      },
      {
        title: "The Coworking Conspiracy",
        wordCount: 3800,
        bodyMd: `# The Coworking Conspiracy

Maya had been in Bali for two weeks when she noticed the pattern. Every morning at Dojo Bali, the same group of people would cluster around the corner tables, speaking in hushed tones over their laptops.

They weren't tourists. They weren't typical digital nomads either. They dressed too well, worked too quietly, and never seemed to actually produce anything visible.

## Strange Encounters

It started with small things. Conversations that stopped when she walked by. Meaningful glances exchanged over kombucha. The way they all seemed to know each other despite claiming to be from different countries.

"Who are those people?" Maya asked Luna one afternoon, nodding toward the mysterious corner crew.

Luna followed her gaze and her expression shifted. "Oh, them? Just some crypto people. You know how it is."

But Maya didn't know how it was. And Luna's answer felt rehearsed.

## The Discovery

Late one evening, Maya was working alone in the coworking space when she heard voices from the conference room. The door was slightly ajar, and she caught fragments of conversation:

"...the blockchain implementation..."
"...need more nodes in Southeast Asia..."
"...Maya's been asking questions..."

Her blood ran cold. They were talking about her.

She crept closer to the door, her heart pounding. Through the crack, she could see Luna at the head of the table, addressing a group of familiar faces.

"We need to bring her in or move her along," Luna was saying. "She's getting too close to the truth."

Maya's hand trembled as she reached for her phone to record, but a floorboard creaked under her weight. The room fell silent.

"Maya?" Luna's voice called out sweetly. "Is that you? Come join us. We have so much to discuss."`
      }
    ];

    for (let i = 0; i < chapterContents.length; i++) {
      const status = i < 2 ? "live" : "draft";
      await ctx.runMutation(internal.seed.createChapter, {
        series: series1,
        index: i + 1,
        title: chapterContents[i].title,
        wordCount: chapterContents[i].wordCount,
        status,
        priceEth: 0.002,
        supply: 500,
        remaining: status === "live" ? Math.floor(Math.random() * 400) + 50 : 500,
        tokenId: i + 2,
        markdownCid: `QmChapter${i + 1}Content`,
        bodyMd: chapterContents[i].bodyMd
      });
    }

    // Update metrics
    await ctx.runMutation(internal.seed.updateMetrics, {
      totalSeries: 1,
      totalChapters: 3,
      totalEthEarned: 0.5
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
    tokenId: v.number(),
    category: v.optional(v.union(
      v.literal("sci-fi"),
      v.literal("fantasy"), 
      v.literal("thriller"),
      v.literal("romance"),
      v.literal("mystery"),
      v.literal("literary")
    ))
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
    markdownCid: v.string(),
    bodyMd: v.optional(v.string()),
    draftMd: v.optional(v.string())
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
