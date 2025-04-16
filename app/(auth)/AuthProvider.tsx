import { useAuth } from "@clerk/clerk-expo";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";

export default function AuthProvider() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    if (!isLoaded) return;
    const inAuthScreen = segments[0] === "(auth)";

    if (!inAuthScreen && !isSignedIn) {
      router.replace("/(auth)/login");
    } else if (inAuthScreen && isSignedIn) {
      router.replace("/(tabs)");
    }
  }, [isLoaded, isSignedIn, segments]);

  if (!isLoaded) return null;

  return <Stack screenOptions={{ headerShown: false }} />;
}
