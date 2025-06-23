import { query, mutation, action } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

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

export const updateProfile = mutation({
  args: {
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
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to update profile");
    }

    // Find user by auth ID
    const appUser = await ctx.db
      .query("appUsers")
      .withIndex("by_auth_user", (q) => q.eq("authUserId", userId))
      .first();
    
    if (!appUser) {
      throw new Error("User not found");
    }

    // Update profile fields
    const updates: any = {};
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
  args: { targetHandle: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to follow");
    }

    const follower = await ctx.db
      .query("appUsers")
      .withIndex("by_auth_user", (q) => q.eq("authUserId", userId))
      .first();

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
  args: { targetHandle: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return false;

    const follower = await ctx.db
      .query("appUsers")
      .withIndex("by_auth_user", (q) => q.eq("authUserId", userId))
      .first();

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

export const uploadImage = action({
  args: { base64: v.string() },
  handler: async (ctx, args) => {
    // TODO: Replace with real upload to S3/IPFS
    const id = Math.floor(Math.random() * 1000);
    return `https://picsum.photos/seed/${id}/800/400`;
  },
});
