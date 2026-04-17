import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS, SHADOWS } from "../../constants";
import { useUserStore } from "../../store/useUserStore";
import { HomeStackParamList } from "../../types";

type MoreNavProp = StackNavigationProp<HomeStackParamList, "MoreScreen">;

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  color: string;
  screen: keyof HomeStackParamList;
}

const MENU_SECTIONS = [
  {
    title: "Finance",
    items: [
      { id: "accounts", label: "Accounts", icon: "bank", color: "#6C63FF", screen: "AccountsScreen" },
      { id: "categories", label: "Categories", icon: "tag-multiple", color: "#F39C12", screen: "AddAccountScreen" },
      { id: "investments", label: "Investments", icon: "trending-up", color: "#2ECC71", screen: "AddAccountScreen" },
      { id: "recurring", label: "Recurring Reminders", icon: "bell-ring", color: "#3498DB", screen: "AddAccountScreen" },
    ],
  },
  {
    title: "Account",
    items: [
      { id: "profile", label: "Profile", icon: "account-circle", color: "#9B59B6", screen: "AddAccountScreen" },
      { id: "settings", label: "Settings", icon: "cog", color: "#95A5A6", screen: "AddAccountScreen" },
    ],
  },
];

export default function MoreScreen() {
  const navigation = useNavigation<MoreNavProp>();
  const { user } = useUserStore();

  return (
    <View className="flex-1" style={{ backgroundColor: COLORS.background }}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* Header */}
      <View
        className="px-5 pt-14 pb-5"
        style={{ backgroundColor: COLORS.primary }}
      >
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-10 h-10 rounded-full items-center justify-center mr-3"
            style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
          >
            <MaterialCommunityIcons name="arrow-left" size={22} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">More</Text>
        </View>

        {/* User Info */}
        <View
          className="flex-row items-center mt-4 p-4 rounded-2xl"
          style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
        >
          <View
            className="w-12 h-12 rounded-full items-center justify-center mr-3"
            style={{ backgroundColor: "rgba(255,255,255,0.3)" }}
          >
            <MaterialCommunityIcons name="account" size={26} color="white" />
          </View>
          <View>
            <Text className="text-white text-base font-bold">
              {user?.name || "Guest"}
            </Text>
            <Text className="text-white text-xs opacity-70">
              {user?.email || "Tap Profile to update your info"}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      >
        {MENU_SECTIONS.map((section) => (
          <View key={section.title} className="mb-6">
            <Text
              className="text-xs font-bold uppercase mb-2 ml-1"
              style={{ color: COLORS.textMuted, letterSpacing: 1 }}
            >
              {section.title}
            </Text>
            <View
              className="rounded-2xl overflow-hidden"
              style={{ backgroundColor: COLORS.surface, ...SHADOWS.sm }}
            >
              {section.items.map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => navigation.navigate(item.screen as any)}
                  className="flex-row items-center px-4 py-4"
                  style={{
                    borderBottomWidth: index < section.items.length - 1 ? 1 : 0,
                    borderBottomColor: COLORS.border,
                  }}
                >
                  <View
                    className="w-9 h-9 rounded-xl items-center justify-center mr-3"
                    style={{ backgroundColor: item.color + "20" }}
                  >
                    <MaterialCommunityIcons
                      name={item.icon as any}
                      size={20}
                      color={item.color}
                    />
                  </View>
                  <Text
                    className="flex-1 text-sm font-semibold"
                    style={{ color: COLORS.textPrimary }}
                  >
                    {item.label}
                  </Text>
                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={20}
                    color={COLORS.gray400}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* App Version */}
        <Text
          className="text-center text-xs mt-2"
          style={{ color: COLORS.textMuted }}
        >
          VeloSpend v1.0.0
        </Text>
      </ScrollView>
    </View>
  );
}