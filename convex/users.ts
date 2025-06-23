import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createAppUserIfNeeded = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in");
    }

    // Check if app user already exists
    const existingAppUser = await ctx.db
      .query("appUsers")
      .withIndex("by_auth_user", (q) => q.eq("authUserId", userId))
      .first();
    
    if (existingAppUser) {
      return existingAppUser;
    }

    // Get auth user details
    const authUser = await ctx.db.get(userId);
    if (!authUser) {
      throw new Error("Auth user not found");
    }

    // Create app user with auth user details
    const handle = authUser.name || `user_${userId.slice(-8)}`;
    const avatarUrl = authUser.image || `https://picsum.photos/seed/${userId}/100/100`;
    
    const appUserId = await ctx.db.insert("appUsers", {
      handle,
      avatarUrl,
      authUserId: userId,
      about: "New writer on ReadOwn"
    });

    return await ctx.db.get(appUserId);
  }
});

export const getCurrentAppUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    // Find app user by auth ID
    const appUser = await ctx.db
      .query("appUsers")
      .withIndex("by_auth_user", (q) => q.eq("authUserId", userId))
      .first();
    
    return appUser;
  }
});
