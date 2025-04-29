import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthenticatedUser } from "./users";
export const generateUploadURL = mutation(async (ctx) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Unauthorized");
  }
  return await ctx.storage.generateUploadUrl();
});

export const createPost = mutation({
  args: {
    storageId: v.id("_storage"),
    caption: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);
    const imageURL = await ctx.storage.getUrl(args.storageId);
    if (!imageURL) {
      throw new Error("Image URL not found");
    }
    const postId = await ctx.db.insert("posts", {
      userId: currentUser._id,
      imageURL,
      storageId: args.storageId,
      caption: args.caption,
      likes: 0,
      comments: 0,
    });

    // Update user posts count
    await ctx.db.patch(currentUser._id, {
      posts: currentUser.posts + 1,
    });

    return postId;
  },
});

export const getFeeds = query({
  handler: async (ctx) => {
    const currentUser = await getAuthenticatedUser(ctx);
    const posts = await ctx.db.query("posts").collect();
    if (posts.length === 0) return [];

    // Enhance the post response
    const enhancedPosts = await Promise.all(
      posts.map(async (post) => {
        const postAuthor = await ctx.db.get(post.userId);

        const like = await ctx.db
          .query("likes")
          .withIndex("by_user_and_post", (q) =>
            q.eq("userId", currentUser._id).eq("postId", post._id)
          )
          .first();
        const bookmark = await ctx.db
          .query("bookmarks")
          .withIndex("by_both", (q) =>
            q.eq("userId", currentUser._id).eq("postId", post._id)
          )
          .first();
        return {
          ...post,
          author: {
            _id: postAuthor?._id,
            username: postAuthor?.username,
            image: postAuthor?.image,
          },
          isLiked: !!like,
          isBookmarked: !!bookmark,
        };
      })
    );
    return enhancedPosts;
  },
});

export const likePost = mutation({
  args: {
    postId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);
    const post = await ctx.db.get(args.postId);
    if (!post) {
      throw new Error("Post not found");
    }

    const like = await ctx.db
      .query("likes")
      .withIndex("by_user_and_post", (q) =>
        q.eq("userId", currentUser._id).eq("postId", args.postId)
      )
      .first();

    if (like) {
      await ctx.db.delete(like._id);
      await ctx.db.patch(args.postId, { likes: post.likes - 1 });
      return false;
    } else {
      await ctx.db.insert("likes", {
        userId: currentUser._id,
        postId: args.postId,
      });
      await ctx.db.patch(args.postId, { likes: post.likes + 1 });
      if (currentUser._id !== post.userId) {
        await ctx.db.insert("notifications", {
          type: "like",
          receiverId: post.userId,
          senderId: currentUser._id,
          postId: args.postId,
        });
      }
      return true;
    }
  },
});

export const deletePost = mutation({
  args: {
    postId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);
    const post = await ctx.db.get(args.postId);
    if (!post) {
      throw new Error("Post not found");
    }
    if (currentUser._id !== post.userId) {
      throw new Error("Unauthorized");
    }

    // delete all likes from db related to this post
    const likes = await ctx.db
      .query("likes")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .collect();

    for (const like of likes) {
      await ctx.db.delete(like._id);
    }

    // delete all comments from db related to this post
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .collect();

    for (const comment of comments) {
      await ctx.db.delete(comment._id);
    }

    // delete all bookmarks from db related to this post
    const bookmarks = await ctx.db
      .query("bookmarks")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .collect();

    for (const bookmark of bookmarks) {
      await ctx.db.delete(bookmark._id);
    }

    // delete image from the storage
    await ctx.storage.delete(post.storageId);

    // delete post from db
    await ctx.db.delete(args.postId);

    // update user posts count
    await ctx.db.patch(currentUser._id, {
      posts: Math.max(0, (currentUser.posts || 1) - 1),
    });
  },
});

export const getPostsByUserId = query({
  args: {
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const user = args.userId
      ? await ctx.db.get(args.userId)
      : await getAuthenticatedUser(ctx);

    if (!user) throw new Error("User not found");

    const posts = await ctx.db
      .query("posts")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId || user?._id))
      .collect();
    return posts;
  },
});
