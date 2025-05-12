import { Stack, useRouter, useSegments } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useEffect, useRef } from "react";
import { useAuthStore } from "../store/authStore";
import { StatusBar } from "expo-status-bar";
import * as NavigationBar from "expo-navigation-bar";
import SafeScreen from "../components/SafeScreen";
import { AppState } from "react-native";

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const { user, token, initialized } = useAuthStore();

  const appReady = useRef(false);

  useEffect(() => {
    if (!initialized) return;

    const inAuthGroup = segments[0] === "(auth)";
    const currentScreen = segments[1] || "index";

    if (!user || !token) {
      if (!inAuthGroup) {
        router.replace("/(auth)");
      }
    } else {
      if (inAuthGroup && currentScreen !== "signup") {
        router.replace("/(tabs)");
      }
    }

    appReady.current = true;
  }, [user, token, segments, initialized]);

  return (
    <SafeAreaProvider>
      <SafeScreen>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </SafeScreen>
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}
