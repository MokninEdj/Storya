import { View, Text, ActivityIndicator } from "react-native";
import React from "react";
import COLORS from "@/constant/theme";

export default function Loader() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: COLORS.black,
      }}
    >
      <ActivityIndicator size={"large"} color={COLORS.primary} />
    </View>
  );
}
