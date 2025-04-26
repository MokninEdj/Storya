import { View, Text, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import { styles } from "@/styles/feed.styles";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "@/constant/theme";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import CommentsModal from "./CommentsModal";
import { formatDistanceToNow } from "date-fns";
import { useUser } from "@clerk/clerk-expo";
type PostProps = {
  post: {
    _id: string;
    author: {
      id: string;
      username: string;
      image: string;
    };
    imageURL: string;
    likes: number;
    comments: number;
    caption?: string;
    isLiked: boolean;
    isBookmarked: boolean;
  };
};

export default function Post({ post }: { post: any }) {
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked);
  const [likesCount, setLikesCount] = useState(post.likes);
  const [commentsCount, setCommentsCount] = useState(post.comments);
  const [showModal, setShowModal] = useState(false);
  const toggleLiked = useMutation(api.posts.likePost);
  const toggleBookmarked = useMutation(api.bookmarks.addBookmark);
  const handleLike = async () => {
    try {
      const isLiked = await toggleLiked({ postId: post._id });
      setIsLiked(isLiked);
      setLikesCount((prev: any) => (isLiked ? prev + 1 : prev - 1));
    } catch (error) {
      console.log(error);
    }
  };

  const handleBookmark = async () => {
    try {
      const isBookmarked = await toggleBookmarked({ postId: post._id });
      setIsBookmarked(isBookmarked);
    } catch (error) {
      console.log(error);
    }
  };

  const { user } = useUser();
  const currentUser = useQuery(
    api.users.getUserByClerkId,
    user ? { clerkId: user.id } : "skip"
  );

  const deletePost = useMutation(api.posts.deletePost);
  const handleDeletePost = async () => {
    try {
      await deletePost({ postId: post._id });
      setShowModal(false);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <View style={styles.post}>
      <View style={styles.postHeader}>
        <Link
          href={
            currentUser?._id === post.author._id
              ? "/(tabs)/profile"
              : `/user/${post.author._id}`
          }
          asChild
        >
          <TouchableOpacity style={styles.postHeaderLeft}>
            <Image
              source={{ uri: post.author.image }}
              style={styles.postAvatar}
              contentFit="cover"
              transition={200}
              cachePolicy={"memory-disk"}
            />
            <Text style={styles.postUsername}>{post.author.username}</Text>
          </TouchableOpacity>
        </Link>
        {currentUser?._id === post.userId ? (
          <TouchableOpacity onPress={handleDeletePost}>
            <Ionicons name="trash-outline" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity>
            <Ionicons
              name="ellipsis-horizontal"
              size={24}
              color={COLORS.white}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Image */}
      <Image
        source={{ uri: post.imageURL }}
        style={styles.postImage}
        contentFit="cover"
        transition={200}
        cachePolicy={"memory-disk"}
      />

      {/* Post Footer */}
      <View style={styles.postActions}>
        <View style={styles.postActionsLeft}>
          <TouchableOpacity onPress={handleLike}>
            <Ionicons
              name={isLiked ? "heart" : "heart-outline"}
              size={22}
              color={isLiked ? COLORS.primary : COLORS.white}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowModal(true)}>
            <Ionicons
              name="chatbubble-outline"
              size={22}
              color={COLORS.white}
            />
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={handleBookmark}>
          <Ionicons
            name={isBookmarked ? "bookmark" : "bookmark-outline"}
            size={22}
            color={COLORS.white}
          />
        </TouchableOpacity>
      </View>

      {/* Post Info @*/}
      <View style={styles.postInfo}>
        <Text style={styles.likesText}>
          {likesCount > 0
            ? `${likesCount.toLocaleString()} likes`
            : "Be the first to like this"}
        </Text>
        {post.caption && (
          <View style={styles.captionContainer}>
            <Text style={styles.captionUsername}>{post.author.username}</Text>
            <Text style={styles.captionText}>{post.caption}</Text>
          </View>
        )}

        {commentsCount > 0 && (
          <TouchableOpacity onPress={() => setShowModal(true)}>
            <Text style={styles.commentText}>
              View all {commentsCount} comments
            </Text>
          </TouchableOpacity>
        )}
        <Text style={styles.timeAgo}>
          {formatDistanceToNow(post._creationTime, { addSuffix: true })}
        </Text>
      </View>

      <CommentsModal
        postId={post._id}
        visible={showModal}
        onClose={() => setShowModal(false)}
        onCommentAdd={() => setCommentsCount((prev: any) => prev + 1)}
      />
    </View>
  );
}
