import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthenticatedUser } from "./users";

export const createPost = mutation({
  args: {
    postId: v.id("posts"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);
    const post = await ctx.db.get(args.postId);
    if (!post) {
      throw new Error("Post not found");
    }

    const commentId = await ctx.db.insert("comments", {
      userId: currentUser?._id,
      postId: args.postId,
      content: args.content,
    });

    await ctx.db.patch(args.postId, {
      comments: post.comments + 1,
    });

    if (currentUser._id !== post.userId) {
      await ctx.db.insert("notifications", {
        type: "comment",
        receiverId: post.userId,
        senderId: currentUser._id,
        postId: args.postId,
      });
    }

    return commentId;
  },
});

export const getComments = query({
  args: {
    postId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .collect();

    const enhancedComments = await Promise.all(
      comments.map(async (comment) => {
        const commentAuthor = await ctx.db.get(comment.userId);
        return {
          ...comment,
          author: {
            id: commentAuthor?._id,
            username: commentAuthor?.username,
            image: commentAuthor?.image,
          },
        };
      })
    );
    return enhancedComments;
  },
});
