import { View, Text, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import { styles } from "@/styles/feed.styles";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "@/constant/theme";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import CommentsModal from "./CommentsModal";
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
  const [likesCount, setLikesCount] = useState(post.likes);
  const [commentsCount, setCommentsCount] = useState(post.comments);
  const [showModal, setShowModal] = useState(false);
  const toggleLiked = useMutation(api.posts.likePost);

  const handleLike = async () => {
    try {
      const isLiked = await toggleLiked({ postId: post._id });
      setIsLiked(isLiked);
      setLikesCount((prev: any) => (isLiked ? prev + 1 : prev - 1));
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <View style={styles.post}>
      {/* Header */}
      <View style={styles.postHeader}>
        <Link href={"/(tabs)/notifications"}>
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
        {/* <TouchableOpacity>
          <Ionicons name="ellipsis-horizontal" size={24} color={COLORS.white} />
        </TouchableOpacity> */}
        <TouchableOpacity>
          <Ionicons name="trash-outline" size={24} color={COLORS.primary} />
        </TouchableOpacity>
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
        <TouchableOpacity>
          <Ionicons name="bookmark-outline" size={22} color={COLORS.white} />
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

        <TouchableOpacity>
          <Text style={styles.commentText}>View all 2 comments</Text>
        </TouchableOpacity>
        <Text style={styles.timeAgo}>2 days ago</Text>
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
