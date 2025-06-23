import { action, internalQuery, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

export const addCategoriesToExistingSeries = action({
  args: {},
  handler: async (ctx) => {
    const series = await ctx.runQuery(internal.migrations.getAllSeries);
    
    for (const s of series) {
      if (!s.category) {
        let category = "literary"; // default
        if (s.title.includes("Digital Nomad")) category = "sci-fi";
        if (s.title.includes("Neo Tokyo")) category = "thriller";
        if (s.title.includes("Last Library")) category = "fantasy";
        
        await ctx.runMutation(internal.migrations.updateSeriesCategory, {
          id: s._id,
          category: category as any
        });
      }
    }
    
    return "Categories added to existing series!";
  }
});

export const getAllSeries = internalQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("series").collect();
  }
});

export const updateSeriesCategory = internalMutation({
  args: { 
    id: v.id("series"), 
    category: v.union(
      v.literal("sci-fi"),
      v.literal("fantasy"), 
      v.literal("thriller"),
      v.literal("romance"),
      v.literal("mystery"),
      v.literal("literary")
    )
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { category: args.category });
  }
});
