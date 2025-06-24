import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create app user if needed using wallet session
export const createAppUserIfNeeded = mutation({
  args: { sessionId: v.id("walletSessions") },
  handler: async (ctx, args) => {
    // Get wallet session
    const session = await ctx.db.get(args.sessionId);
    if (!session || session.expiresAt < Date.now()) {
      throw new Error("Must be logged in");
    }

    // Check if app user already exists (by walletAddress)
    const existingAppUser = await ctx.db
      .query("appUsers")
      .withIndex("by_wallet_address", (q) => q.eq("walletAddress", session.walletAddress))
      .first();

    if (existingAppUser) {
      return existingAppUser;
    }

    // Create app user
    const handle = `${session.walletAddress.slice(0, 6)}${session.walletAddress.slice(-4)}`;
    const avatarUrl = `https://api.dicebear.com/7.x/identicon/svg?seed=${session.walletAddress}`;

    const appUserId = await ctx.db.insert("appUsers", {
      handle,
      avatarUrl,
      walletAddress: session.walletAddress,
      about: "New writer on Qisati"
    });

    return await ctx.db.get(appUserId);
  }
});

export const getCurrentAppUser = query({
  args: { sessionId: v.id("walletSessions") },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session || session.expiresAt < Date.now()) {
      return null;
    }

    // Find app user by walletAddress
    const appUser = await ctx.db
      .query("appUsers")
      .withIndex("by_wallet_address", (q) => q.eq("walletAddress", session.walletAddress))
      .first();

    return appUser;
  }
});
