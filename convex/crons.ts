import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";
import { internalAction, internalQuery } from "./_generated/server";
import { v } from "convex/values";

export const syncActiveTokens = internalAction({
  args: {},
  handler: async (ctx) => {
    // Get all live chapters
    const chapters = await ctx.runQuery(internal.crons.getActiveChapters);
    
    for (const chapter of chapters) {
      const series = await ctx.runQuery(internal.crons.getSeriesById, { 
        id: chapter.series 
      });
      
      if (series) {
        await ctx.runAction(internal.chainsync.upsertTokenFromChain, {
          contract: series.contract,
          tokenId: chapter.tokenId
        });
      }
    }
    
    // Sync pending transactions
    await ctx.runAction(internal.chainsync.syncPendingTransactions, {});
  }
});

export const getActiveChapters = internalQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("chapters")
      .filter((q) => q.eq(q.field("status"), "live"))
      .collect();
  }
});

export const getSeriesById = internalQuery({
  args: { id: v.id("series") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  }
});

const crons = cronJobs();

// Sync token data every 60 seconds - DISABLED for now
// crons.interval("sync active tokens", { seconds: 6000 }, internal.crons.syncActiveTokens, {});

export default crons;


