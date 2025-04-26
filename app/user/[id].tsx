import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  FlatList,
} from "react-native";
import React from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useLocalSearchParams } from "expo-router";
import { Id } from "@/convex/_generated/dataModel";
import { styles } from "@/styles/profile.styles";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "@/constant/theme";
import { Image } from "expo-image";
import { ScrollView } from "react-native";
import Loader from "@/components/Loader";
import { useRouter } from "expo-router";

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams();
  console.log({ id });

  const router = useRouter();
  const profile = useQuery(api.users.getUserProfile, {
    id: id as Id<"users">,
  });
  const posts = useQuery(api.posts.getPostsByUserId, {
    userId: id as Id<"users">,
  });
  const isFollowing = useQuery(api.users.isFollowing, {
    followingId: id as Id<"users">,
  });
  const toggleFollow = useMutation(api.users.toggleFollow);

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)");
  };

  if (profile === undefined || posts === undefined || isFollowing === undefined)
    return <Loader />;
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack}>
          <Ionicons name="arrow-back" size={20} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{profile?.username}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileInfo}>
          <View style={styles.avatarAndStats}>
            <View style={styles.avatarContainer}>
              <Image
                source={{ uri: profile?.image }}
                transition={200}
                contentFit="cover"
                style={styles.avatar}
              />
            </View>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{profile?.posts}</Text>
                <Text style={styles.statLabel}>Posts</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{profile?.followers}</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{profile?.following}</Text>
                <Text style={styles.statLabel}>Following</Text>
              </View>
            </View>
          </View>
          <Text style={styles.username}>{profile?.fullName}</Text>
          {profile?.bio && <Text style={styles.bio}>{profile?.bio}</Text>}
          <Pressable
            style={[styles.followButton, isFollowing && styles.followingButton]}
            onPress={() => toggleFollow({ followingId: id as Id<"users"> })}
          >
            <Text
              style={[
                styles.followButtonText,
                isFollowing && styles.followingButtonText,
              ]}
            >
              {isFollowing ? "Following" : "Follow"}
            </Text>
          </Pressable>
        </View>
        <View style={styles.postsGrid}>
          {posts.length === 0 ? (
            <View style={styles.noPostsContainer}>
              <Ionicons name="image-outline" size={48} color={COLORS.white} />
              <Text style={styles.noPostsText}>No posts yet</Text>
            </View>
          ) : (
            <FlatList
              data={posts}
              numColumns={3}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.gridItem}>
                  <Image
                    source={{ uri: item.imageURL }}
                    transition={200}
                    contentFit="cover"
                    style={styles.gridImage}
                    cachePolicy={"memory-disk"}
                  />
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}
