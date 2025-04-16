import { SignOutButton } from "@/components/SignOutButton";
import { SignedIn, SignedOut, useUser } from "@clerk/clerk-expo";
import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function Index() {
  const { user } = useUser();
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Link href="/(auth)/login">
        <Text>Login</Text>
      </Link>
      <Text>Edit app/index.tsx to edit this screen.</Text>
      <View>
        <SignedIn>
          <Text>Hello {user?.emailAddresses[0].emailAddress}</Text>
          <SignOutButton />
        </SignedIn>
      </View>
    </View>
  );
}
