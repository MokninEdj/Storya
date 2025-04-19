import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  TextInput,
} from "react-native";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { styles } from "@/styles/create.styles";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "@/constant/theme";
import * as imagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import * as FileSystem from "expo-file-system";

export default function create() {
  const [caption, setCaption] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);

  const router = useRouter();
  const { user } = useUser();
  const pickImage = async () => {
    const result = await imagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) setSelectedImage(result.assets[0].uri);
  };

  const generateUploadURL = useMutation(api.posts.generateUploadURL);
  const createPost = useMutation(api.posts.createPost);

  const onSharePost = async () => {
    if (!selectedImage) return;
    try {
      setIsSharing(true);
      const uploadUrl = await generateUploadURL();
      const uploadResult = await FileSystem.uploadAsync(
        uploadUrl,
        selectedImage,
        {
          httpMethod: "POST",
          uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
          mimeType: "image/jpeg",
        }
      );
      if (uploadResult.status !== 200) {
        throw new Error("Failed to upload image");
      }
      const { storageId } = JSON.parse(uploadResult.body);
      await createPost({ storageId, caption });

      router.push("/(tabs)");
    } catch (error) {
      console.log(error);
    } finally {
      setIsSharing(false);
    }
  };

  if (!selectedImage) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Post</Text>
          <View style={{ width: 28 }} />
        </View>
        <TouchableOpacity
          style={styles.emptyImageContainer}
          onPress={pickImage}
        >
          <Ionicons
            name="image-outline"
            size={48}
            color={COLORS.textSecondary}
          />
          <Text style={styles.emptyImageText}>Tap to upload an image</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === "ios" ? 120 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            setSelectedImage(null);
            setCaption("");
          }}
          disabled={isSharing}
        >
          <Ionicons
            name="close-outline"
            size={24}
            color={isSharing ? COLORS.placeholderText : COLORS.white}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Post</Text>
        <TouchableOpacity
          onPress={onSharePost}
          disabled={isSharing || !selectedImage}
          style={[styles.shareButton, isSharing && styles.shareButtonDisabled]}
        >
          {isSharing ? (
            <ActivityIndicator size={"small"} color={COLORS.primary} />
          ) : (
            <Text style={styles.shareText}>Share</Text>
          )}
        </TouchableOpacity>
      </View>
      {/* Content */}
      <ScrollView
        style={styles.scrollContent}
        bounces={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.content, isSharing && styles.contentDisabled]}>
          {/* Image Preview */}
          <View style={styles.imageSection}>
            <Image
              source={{ uri: selectedImage }}
              style={styles.previewImage}
              contentFit="cover"
              transition={200}
            />
            <TouchableOpacity
              onPress={pickImage}
              disabled={isSharing}
              style={styles.changeImageButton}
            >
              <Ionicons name="image-outline" size={24} color={COLORS.white} />
              <Text style={styles.changeImageText}>Change</Text>
            </TouchableOpacity>
          </View>

          {/* Caption */}
          <View style={styles.inputSection}>
            <View style={styles.captionContainer}>
              <Image
                source={user?.imageUrl}
                style={styles.userAvatar}
                contentFit="cover"
                transition={200}
              />
              <TextInput
                placeholder="What's on your mind?"
                placeholderTextColor={COLORS.placeholderText}
                multiline
                style={styles.captionInput}
                value={caption}
                editable={!isSharing}
                onChangeText={setCaption}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
