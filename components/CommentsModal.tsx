import {
  View,
  Text,
  Modal,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  FlatList,
  TextInput,
} from "react-native";
import React, { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { styles } from "@/styles/feed.styles";
import COLORS from "@/constant/theme";
import { Ionicons } from "@expo/vector-icons";
import Loader from "./Loader";
import Comment from "./Comment";
import { Colors } from "react-native/Libraries/NewAppScreen";
type Props = {
  postId: Id<"posts">;
  visible: boolean;
  onClose: () => void;
};
export default function CommentsModal({ onClose, postId, visible }: Props) {
  const comments = useQuery(api.comments.getComments, { postId });
  const addComment = useMutation(api.comments.createPost);
  const [newComment, setNewComment] = useState("");

  const onAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      await addComment({
        content: newComment,
        postId,
      });
      setNewComment("");
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <Modal
      visible={visible}
      onRequestClose={onClose}
      transparent={true}
      animationType="slide"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalContainer}
      >
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Comments</Text>
        </View>
        {comments === undefined ? (
          <Loader />
        ) : (
          <FlatList
            data={comments}
            keyExtractor={(item) => item._id.toString()}
            renderItem={({ item }) => <Comment comment={item} />}
            style={styles.commentsList}
          />
        )}

        <View style={styles.commentInput}>
          <TextInput
            value={newComment}
            onChangeText={setNewComment}
            placeholder="Add new comment"
            style={styles.input}
            multiline
            placeholderTextColor={COLORS.textDark}
          />
          <TouchableOpacity
            onPress={onAddComment}
            disabled={!newComment.trim()}
          >
            <Text
              style={[
                styles.postButton,
                !newComment.trim() && styles.postButtonDisabled,
              ]}
            >
              Post
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
