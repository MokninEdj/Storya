import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import AuthProvider from "./(auth)/AuthProvider";
import ClerkAndConvexProvider from "@/providers/ClerkAndConvex";
import { useFonts } from "expo-font";
import { SplashScreen } from "expo-router";
import { useCallback, useEffect } from "react";
import * as NavigationBar from "expo-navigation-bar";
import { Platform } from "react-native";
import { StatusBar } from "expo-status-bar";
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "JetBrainsMono-Medium": require("../assets/fonts/JetBrainsMono-Medium.ttf"),
  });

  // hide splash screen after fonts are loaded
  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  // update native navigation bar in android
  useEffect(() => {
    if (Platform.OS === "android") {
      NavigationBar.setBackgroundColorAsync("#000");
      NavigationBar.setButtonStyleAsync("light");
    }
  }, []);

  return (
    <ClerkAndConvexProvider>
      <SafeAreaProvider>
        <SafeAreaView
          style={{ flex: 1, backgroundColor: "#000" }}
          onLayout={onLayoutRootView}
        >
          <AuthProvider />
        </SafeAreaView>
      </SafeAreaProvider>
      <StatusBar style="light" />
    </ClerkAndConvexProvider>
  );
}
