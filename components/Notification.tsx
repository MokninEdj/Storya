import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { styles } from "@/styles/notification.styles";
import { Link } from "expo-router";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "@/constant/theme";
import { Id } from "@/convex/_generated/dataModel";
import { formatDistanceToNow } from "date-fns";
type Props = {
  _id: string;
  type: "like" | "comment" | "follow";
  _creationTime: number;
  sender: {
    _id: Id<"users">;
    username: string;
    image: string;
  };
  post: {
    _id: string;
    imageURL: string;
  };
  comment: string;
};
export default function Notification({
  notification,
}: {
  notification: Props;
}) {
  return (
    <View style={styles.notificationItem}>
      <View style={styles.notificationContent}>
        <Link href={`/user/${notification.sender._id}`} asChild>
          <TouchableOpacity style={styles.avatarContainer}>
            <Image
              source={{ uri: notification.sender.image }}
              transition={200}
              style={styles.avatar}
              contentFit="cover"
            />
            <View style={styles.iconBadge}>
              {notification.type === "like" ? (
                <Ionicons name="heart" color={COLORS.primary} size={16} />
              ) : notification.type === "comment" ? (
                <Ionicons name="chatbubble" color={"#f0f"} size={16} />
              ) : (
                <Ionicons name="person-add" color={"#0AF"} size={16} />
              )}
            </View>
          </TouchableOpacity>
        </Link>

        <View style={styles.notificationInfo}>
          <Link href={`/user/${notification.sender._id}`} asChild>
            <TouchableOpacity>
              <Text style={styles.username}>
                {notification.sender.username}
              </Text>
            </TouchableOpacity>
          </Link>

          <Text style={styles.action}>
            {notification.type === "like"
              ? "liked your post"
              : notification.type === "comment"
                ? "commented on your post"
                : "followed you"}
          </Text>
          <Text style={styles.timeAgo}>
            {formatDistanceToNow(notification._creationTime, {
              addSuffix: true,
            })}
          </Text>
        </View>
      </View>
      {notification.post && (
        <Image
          source={{ uri: notification.post.imageURL }}
          style={styles.postImage}
          contentFit="cover"
          transition={200}
        />
      )}
    </View>
  );
}
