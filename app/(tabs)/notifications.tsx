import { View, Text, FlatList } from "react-native";
import React from "react";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Loader from "@/components/Loader";
import COLORS from "@/constant/theme";
import { styles } from "@/styles/notification.styles";
import { Ionicons } from "@expo/vector-icons";
import Notification from "@/components/Notification";

export default function notifications() {
  const notifications = useQuery(api.notifications.getNotifications);

  if (notifications === undefined) return <Loader />;
  if (notifications.length === 0) return <NoNotifications />;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>
      {/* Notifications List */}

      <FlatList
        data={notifications}
        keyExtractor={(item) => item._id.toString()}
        renderItem={({ item }) => <Notification notification={item} />}
        showsVerticalScrollIndicator={false}
        style={styles.listContainer}
      />
    </View>
  );
}

const NoNotifications = () => {
  return (
    <View style={[styles.container, styles.centered]}>
      <Ionicons name="notifications-outline" size={48} color={COLORS.primary} />
      <Text style={{ fontSize: 20, color: COLORS.white }}>
        No notifications yet
      </Text>
    </View>
  );
};
