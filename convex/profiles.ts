import { query, mutation, action } from "./_generated/server";
import { v } from "convex/values";

// 1. No longer import getAuthUserId

export const profileByHandle = query({
  args: { handle: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("appUsers")
      .withIndex("by_handle", (q) => q.eq("handle", args.handle))
      .first();
    
    if (!user) return null;

    // Get user's socials
    const socials = await ctx.db
      .query("userSocials")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    // Get user's series
    const series = await ctx.db
      .query("series")
      .withIndex("by_author", (q) => q.eq("author", user._id))
      .collect();

    // Get follower/following counts
    const followerCount = await ctx.db
      .query("follows")
      .withIndex("by_following", (q) => q.eq("followingId", user._id))
      .collect();

    const followingCount = await ctx.db
      .query("follows")
      .withIndex("by_follower", (q) => q.eq("followerId", user._id))
      .collect();

    return {
      ...user,
      socials,
      series,
      followerCount: followerCount.length,
      followingCount: followingCount.length,
    };
  }
});

// Endpoints requiring auth now use sessionId

export const checkHandleAvailable = query({
  args: { sessionId: v.id("walletSessions"), handle: v.string() },
  handler: async (ctx, args) => {
    // Wallet session auth
    const session = await ctx.db.get(args.sessionId);
    if (!session || session.expiresAt < Date.now()) {
      return { available: false, error: "Must be logged in" };
    }
    const currentUser = await ctx.db.get(session.userId);

    // Basic validation
    if (!/^[a-zA-Z0-9_]+$/.test(args.handle)) {
      return { available: false, error: "Only letters, numbers, and underscores allowed" };
    }
    if (args.handle.length < 3 || args.handle.length > 20) {
      return { available: false, error: "Must be between 3 and 20 characters" };
    }

    const existingUser = await ctx.db
      .query("appUsers")
      .withIndex("by_handle", (q) => q.eq("handle", args.handle))
      .first();

    // Available if no one has it, or current user has it
    const available = !existingUser || (currentUser && existingUser._id === existingUser._id);
    return { 
      available, 
      error: available ? null : "Handle is already taken" 
    };
  }
});

export const updateProfile = mutation({
  args: {
    sessionId: v.id("walletSessions"),
    handle: v.optional(v.string()),
    about: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    bannerUrl: v.optional(v.string()),
    socials: v.optional(v.array(v.object({
      platform: v.string(),
      url: v.string(),
      displayText: v.optional(v.string()),
    }))),
  },
  handler: async (ctx, args) => {
    // Use wallet session to get user
    const session = await ctx.db.get(args.sessionId);
    if (!session || session.expiresAt < Date.now()) {
      throw new Error("Must be logged in to update profile");
    }
    const appUser = await ctx.db.get(session.userId);
    if (!appUser) {
      throw new Error("User not found");
    }

    // Validate handle if provided
    if (args.handle !== undefined) {
      if (!/^[a-zA-Z0-9_]+$/.test(args.handle)) {
        throw new Error("Handle can only contain letters, numbers, and underscores");
      }
      if (args.handle.length < 3 || args.handle.length > 20) {
        throw new Error("Handle must be between 3 and 20 characters");
      }

      // Check if handle is already taken
      const existingUser = await ctx.db
        .query("appUsers")
        .withIndex("by_handle", (q) => q.eq("handle", args.handle!))
        .first();
      
      if (existingUser && existingUser._id !== appUser._id) {
        throw new Error("Handle is already taken");
      }
    }

    // Update profile fields
    const updates: any = {};
    if (args.handle !== undefined) updates.handle = args.handle;
    if (args.about !== undefined) updates.about = args.about;
    if (args.avatarUrl !== undefined) updates.avatarUrl = args.avatarUrl;
    if (args.bannerUrl !== undefined) updates.bannerUrl = args.bannerUrl;

    if (Object.keys(updates).length > 0) {
      await ctx.db.patch(appUser._id, updates);
    }

    // Update socials if provided
    if (args.socials !== undefined) {
      // Delete existing socials
      const existingSocials = await ctx.db
        .query("userSocials")
        .withIndex("by_user", (q) => q.eq("userId", appUser._id))
        .collect();
      
      for (const social of existingSocials) {
        await ctx.db.delete(social._id);
      }

      // Insert new socials
      for (const social of args.socials) {
        await ctx.db.insert("userSocials", {
          userId: appUser._id,
          platform: social.platform,
          url: social.url,
          displayText: social.displayText,
        });
      }
    }

    return { success: true };
  }
});

export const followUser = mutation({
  args: { sessionId: v.id("walletSessions"), targetHandle: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session || session.expiresAt < Date.now()) {
      throw new Error("Must be logged in to follow");
    }
    const follower = await ctx.db.get(session.userId);

    const target = await ctx.db
      .query("appUsers")
      .withIndex("by_handle", (q) => q.eq("handle", args.targetHandle))
      .first();

    if (!follower || !target) {
      throw new Error("User not found");
    }

    if (follower._id === target._id) {
      throw new Error("Cannot follow yourself");
    }

    // Check if already following
    const existing = await ctx.db
      .query("follows")
      .withIndex("by_follower_following", (q) => 
        q.eq("followerId", follower._id).eq("followingId", target._id))
      .first();

    if (existing) {
      // Unfollow
      await ctx.db.delete(existing._id);
      return { following: false };
    } else {
      // Follow
      await ctx.db.insert("follows", {
        followerId: follower._id,
        followingId: target._id,
        createdAt: Date.now(),
      });
      return { following: true };
    }
  }
});

export const isFollowing = query({
  args: { sessionId: v.id("walletSessions"), targetHandle: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session || session.expiresAt < Date.now()) return false;
    const follower = await ctx.db.get(session.userId);

    const target = await ctx.db
      .query("appUsers")
      .withIndex("by_handle", (q) => q.eq("handle", args.targetHandle))
      .first();

    if (!follower || !target) return false;

    const existing = await ctx.db
      .query("follows")
      .withIndex("by_follower_following", (q) => 
        q.eq("followerId", follower._id).eq("followingId", target._id))
      .first();

    return !!existing;
  }
});

// No changes to uploadImage (doesn't require user)
export const uploadImage = action({
  args: { base64: v.string() },
  handler: async (ctx, args) => {
    // TODO: Replace with real upload to S3/IPFS
    const id = Math.floor(Math.random() * 1000);
    return `https://picsum.photos/seed/${id}/800/400`;
  },
});
