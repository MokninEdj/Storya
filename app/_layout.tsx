import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import AuthProvider from "./(auth)/AuthProvider";
import ClerkAndConvexProvider from "@/providers/ClerkAndConvex";

export default function RootLayout() {
  return (
    <ClerkAndConvexProvider>
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }}>
          <AuthProvider />
        </SafeAreaView>
      </SafeAreaProvider>
    </ClerkAndConvexProvider>
  );
}
