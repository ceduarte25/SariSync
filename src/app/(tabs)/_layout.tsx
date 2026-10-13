import { Text } from "react-native";
import { Tabs } from "expo-router";

import { colors } from "@/theme";

const tabScreenOptions = {
  headerShadowVisible: false,
  headerStyle: { backgroundColor: colors.bg },
  headerTintColor: colors.ink,
  tabBarActiveTintColor: colors.accent,
  tabBarInactiveTintColor: colors.muted,
  tabBarStyle: { backgroundColor: colors.white, borderTopColor: colors.line },
  sceneStyle: { backgroundColor: colors.bg },
} as const;

function TabGlyph({ glyph }: { glyph: string }) {
  return <Text style={{ fontSize: 18 }}>{glyph}</Text>;
}

export default function TabsLayout() {
  return (
    <Tabs screenOptions={tabScreenOptions}>
      <Tabs.Screen
        name="sale"
        options={{
          title: "Sell",
          tabBarIcon: () => <TabGlyph glyph="🛒" />,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: "Workers",
          tabBarIcon: () => <TabGlyph glyph="👷" />,
        }}
      />
      <Tabs.Screen
        name="items"
        options={{
          title: "Items",
          tabBarIcon: () => <TabGlyph glyph="📦" />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: "Backup",
          tabBarIcon: () => <TabGlyph glyph="💾" />,
        }}
      />
    </Tabs>
  );
}
