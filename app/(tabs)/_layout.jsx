import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../../constants/colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { View, Animated } from "react-native";

export default function Tablayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={({ route, focused }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary || "#999",
        tabBarActiveBackgroundColor: COLORS.cardBackground,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          textTransform: "capitalize",
        },
        headerTitleStyle: {
          fontWeight: "600",
          color: COLORS.textPrimary,
        },
        headerShadowVisible: false,
        tabBarStyle: {
          backgroundColor: COLORS.cardBackground,
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
          paddingTop: 5,
          paddingBottom: insets.bottom,
          height: 62 + insets.bottom,
        },
        tabBarIcon: ({ color, size, focused }) => {
          let iconName;

          switch (route.name) {
            case "index":
              iconName = "home-outline";
              break;
            case "create":
              iconName = "add-circle-outline";
              break;
            case "profile":
              iconName = "person-outline";
              break;
            default:
              iconName = "ellipse-outline";
          }

          return (
            <View style={{ alignItems: "center", justifyContent: "center" }}>
              <Ionicons
                name={iconName}
                size={focused ? size + 1.3 : size}
                color={color}
                style={{
                  opacity: focused ? 1 : 0.6,
                  transform: [{ scale: focused ? 1.1 : 1 }],
                }}
              />
            </View>
          );
        },
      })}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="create" options={{ title: "Compartilhar" }} />
      <Tabs.Screen name="profile" options={{ title: "Perfil" }} />
    </Tabs>
  );
}
