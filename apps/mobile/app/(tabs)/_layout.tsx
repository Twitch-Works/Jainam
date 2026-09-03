import { Tabs } from "expo-router";
import { StyleSheet } from "react-native";
import { colors, fontFamily } from "@/theme";
import { HomeIcon, MeditateIcon, BookIcon, InsightsIcon, ProfileIcon } from "@/components/icons";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.goldDeep,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <HomeIcon color={color} size={22} />,
        }}
      />
      <Tabs.Screen
        name="sadhana"
        options={{
          title: "Sadhana",
          tabBarIcon: ({ color }) => <MeditateIcon color={color} size={22} />,
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: "Library",
          tabBarIcon: ({ color }) => <BookIcon color={color} size={22} />,
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: "Insights",
          tabBarIcon: ({ color }) => <InsightsIcon color={color} size={22} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <ProfileIcon color={color} size={22} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.cream,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    height: 84,
    paddingTop: 8,
    paddingBottom: 24,
  },
  tabLabel: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: 11,
  },
});
