import { View, Text, ScrollView } from "react-native";
import React from "react";
import { styles } from "@/styles/feed.styles";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Loader from "@/components/Loader";
import COLORS from "@/constant/theme";
import { Image } from "expo-image";

export default function Bookmarks() {
  const bookmarks = useQuery(api.bookmarks.getBookmarks);
  if (bookmarks === undefined) return <Loader />;
  if (bookmarks.length === 0) return <NoBookmarks />;
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bookmarks</Text>
      </View>
      <ScrollView
        contentContainerStyle={{
          flexDirection: "row",
          padding: 8,
          flexWrap: "wrap",
        }}
      >
        {bookmarks.map((bookmark) => {
          if (!bookmark) return null;
          return (
            <View key={bookmark._id} style={{ width: "33.33%", padding: 1 }}>
              <Image
                source={{ uri: bookmark.imageURL }}
                style={{ aspectRatio: 1, width: "100%" }}
                cachePolicy={"memory-disk"}
                contentFit="cover"
                transition={200}
              />
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const NoBookmarks = () => {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: COLORS.black,
      }}
    >
      <Text style={styles.headerTitle}>No Bookmarks Found Yet</Text>
    </View>
  );
};
