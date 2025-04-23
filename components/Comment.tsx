import { View, Text, Image } from "react-native";
import React from "react";
import { styles } from "@/styles/feed.styles";
import { formatDistanceToNow } from "date-fns";

type Props = {
  content: string;
  _creationTime: number;
  user: {
    fullName: string;
    image: string;
  };
};
export default function Comment({ comment }: { comment: Props }) {
  return (
    <View style={styles.commentContainer}>
      <Image
        source={{
          uri: comment?.user?.image ?? "https://picsum.photos/200",
        }}
        style={styles.commentAvatar}
        resizeMode="cover"
      />
      <View style={styles.commentContent}>
        <Text style={styles.commentUsername}>{comment?.user?.fullName}</Text>
        <Text style={styles.commentText}>{comment?.content}</Text>
        <Text style={styles.commentTime}>
          {formatDistanceToNow(comment?._creationTime)}
        </Text>
      </View>
    </View>
  );
}
