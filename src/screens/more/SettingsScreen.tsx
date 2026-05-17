import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Switch,
  Alert,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLORS, SHADOWS, CURRENCIES } from "../../constants";
import { archiveOldTransactions } from "../../database/queries/transactions";
import { getDatabase } from "../../database/db";
import { useUserStore } from "../../store/useUserStore";
import { useThemeStore } from "../../store/useThemeStore";

const SETTINGS_KEY = "velospend_settings";

interface Settings {
  currency: string;
  notificationsEnabled: boolean;
  theme: "light" | "dark" | "system";
}

const DEFAULT_SETTINGS: Settings = {
  currency: "INR",
  notificationsEnabled: true,
  theme: "system",
};

export default function SettingsScreen() {
  const navigation = useNavigation();
  const { colors: COLORS } = useThemeStore();
  const { user, loadUser } = useUserStore();
  const { mode: currentTheme, setTheme } = useThemeStore();

  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(false);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem(SETTINGS_KEY);
      if (stored) setSettings(JSON.parse(stored));
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  };

  const saveSettings = async (newSettings: Settings) => {
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadSettings();
    }, [])
  );

  // const handleCurrencyChange = (currency: string) => {
  //   Alert.alert(
  //     "Change Currency",
  //     `Set ${currency} as your default currency?`,
  //     [
  //       { text: "Cancel", style: "cancel" },
  //       {
  //         text: "Confirm",
  //         onPress: () => saveSettings({ ...settings, currency }),
  //       },
  //     ]
  //   );
  // };

  const handleArchiveTransactions = () => {
    Alert.alert(
      "Archive Old Transactions",
      "This will archive all transactions older than 6 months. They won't be deleted but won't show in your main list.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Archive",
          onPress: () => {
            if (user) {
              archiveOldTransactions(user.id);
              Alert.alert("Done", "Old transactions have been archived.");
            }
          },
        },
      ]
    );
  };

  const handleClearAllData = () => {
    Alert.alert(
      "Clear All Data",
      "This will permanently delete ALL your data including accounts, transactions, planners and categories. This cannot be undone!",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear Everything",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Are you absolutely sure?",
              "All your financial data will be permanently deleted.",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Yes, Delete Everything",
                  style: "destructive",
                  onPress: async () => {
                    try {
                      const db = getDatabase();
                      db.execSync(`DELETE FROM transactions;`);
                      db.execSync(`DELETE FROM planner_records;`);
                      db.execSync(`DELETE FROM planners;`);
                      db.execSync(`DELETE FROM investment_transactions;`);
                      db.execSync(`DELETE FROM investments;`);
                      db.execSync(`DELETE FROM recurring_rules;`);
                      db.execSync(`DELETE FROM accounts;`);
                      db.execSync(`DELETE FROM categories WHERE is_default = 0;`);
                      await AsyncStorage.removeItem(SETTINGS_KEY);
                      loadUser();
                      Alert.alert("Done", "All data has been cleared.");
                    } catch (error) {
                      Alert.alert("Error", "Could not clear data. Please try again.");
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

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
          <Text className="text-white text-xl font-bold">Settings</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      >
        {/* Appearance */}
<SectionTitle title="Appearance" />
<View
  className="rounded-2xl p-4 mb-4"
  style={{ backgroundColor: COLORS.surface, ...SHADOWS.sm }}
>
  <Text
    className="text-sm font-semibold mb-3"
    style={{ color: COLORS.textSecondary }}
  >
    Theme
  </Text>
  <View
    className="flex-row rounded-xl overflow-hidden"
    style={{ backgroundColor: COLORS.gray100 }}
  >
    {([
      { label: "Light", value: "light", icon: "white-balance-sunny" },
      { label: "System", value: "system", icon: "theme-light-dark" },
      { label: "Dark", value: "dark", icon: "moon-waning-crescent" },
    ] as const).map((theme) => {
      const isSelected = currentTheme === theme.value;
      return (
        <TouchableOpacity
          key={theme.value}
          onPress={() => setTheme(theme.value)}
          className="flex-1 flex-row items-center justify-center py-3 gap-1"
          style={{
            backgroundColor: isSelected ? COLORS.primary : "transparent",
            borderRadius: 12,
            margin: 3,
          }}
        >
          <MaterialCommunityIcons
            name={theme.icon as any}
            size={14}
            color={isSelected ? "white" : COLORS.textSecondary}
          />
          <Text
            className="text-xs font-bold"
            style={{ color: isSelected ? "white" : COLORS.textSecondary }}
          >
            {theme.label}
          </Text>
        </TouchableOpacity>
      );
    })}
  </View>
</View>

        {/* Currency */}
<SectionTitle title="Currency" />
<View
  className="rounded-2xl overflow-hidden mb-4"
  style={{ backgroundColor: COLORS.surface, ...SHADOWS.sm }}
>
  <TouchableOpacity
    onPress={() => (navigation as any).navigate("CurrencyScreen")}
    className="flex-row items-center px-4 py-4"
  >
    <View
      className="w-8 h-8 rounded-full items-center justify-center mr-3"
      style={{ backgroundColor: COLORS.primary + "20" }}
    >
      <Text
        className="text-sm font-bold"
        style={{ color: COLORS.primary }}
      >
        {CURRENCIES.find((c) => c.value === settings.currency)?.symbol || "₹"}
      </Text>
    </View>
    <View className="flex-1">
      <Text
        className="text-sm font-semibold"
        style={{ color: COLORS.textPrimary }}
      >
        Default Currency
      </Text>
      <Text className="text-xs mt-0.5" style={{ color: COLORS.textMuted }}>
        {CURRENCIES.find((c) => c.value === settings.currency)?.label || "Indian Rupee"}
      </Text>
    </View>
    <MaterialCommunityIcons
      name="chevron-right"
      size={20}
      color={COLORS.gray400}
    />
  </TouchableOpacity>
</View>

        {/* Notifications */}
        {/* <SectionTitle title="Notifications" />
        <View
          className="rounded-2xl mb-4"
          style={{ backgroundColor: COLORS.surface, ...SHADOWS.sm }}
        >
          <View className="flex-row items-center px-4 py-4">
            <View
              className="w-8 h-8 rounded-full items-center justify-center mr-3"
              style={{ backgroundColor: COLORS.primary + "20" }}
            >
              <MaterialCommunityIcons
                name="bell"
                size={16}
                color={COLORS.primary}
              />
            </View>
            <View className="flex-1">
              <Text
                className="text-sm font-semibold"
                style={{ color: COLORS.textPrimary }}
              >
                Recurring Reminders
              </Text>
              <Text className="text-xs mt-0.5" style={{ color: COLORS.textMuted }}>
                Get notified for upcoming recurring transactions
              </Text>
            </View>
            <Switch
              value={settings.notificationsEnabled}
              onValueChange={(value) =>
                saveSettings({ ...settings, notificationsEnabled: value })
              }
              trackColor={{ false: COLORS.gray300, true: COLORS.primary }}
              thumbColor="white"
            />
          </View>
        </View> */}

        {/* Data Management */}
        <SectionTitle title="Data Management" />
        <View
          className="rounded-2xl overflow-hidden mb-4"
          style={{ backgroundColor: COLORS.surface, ...SHADOWS.sm }}
        >
          <TouchableOpacity
            onPress={handleArchiveTransactions}
            className="flex-row items-center px-4 py-4"
            style={{ borderBottomWidth: 1, borderBottomColor: COLORS.border }}
          >
            <View
              className="w-8 h-8 rounded-full items-center justify-center mr-3"
              style={{ backgroundColor: COLORS.warning + "20" }}
            >
              <MaterialCommunityIcons
                name="archive"
                size={16}
                color={COLORS.warning}
              />
            </View>
            <View className="flex-1">
              <Text
                className="text-sm font-semibold"
                style={{ color: COLORS.textPrimary }}
              >
                Archive Old Transactions
              </Text>
              <Text className="text-xs mt-0.5" style={{ color: COLORS.textMuted }}>
                Archive transactions older than 6 months
              </Text>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={20}
              color={COLORS.gray400}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleClearAllData}
            className="flex-row items-center px-4 py-4"
          >
            <View
              className="w-8 h-8 rounded-full items-center justify-center mr-3"
              style={{ backgroundColor: COLORS.error + "20" }}
            >
              <MaterialCommunityIcons
                name="delete-forever"
                size={16}
                color={COLORS.error}
              />
            </View>
            <View className="flex-1">
              <Text
                className="text-sm font-semibold"
                style={{ color: COLORS.error }}
              >
                Clear All Data
              </Text>
              <Text className="text-xs mt-0.5" style={{ color: COLORS.textMuted }}>
                Permanently delete all your data
              </Text>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={20}
              color={COLORS.gray400}
            />
          </TouchableOpacity>
        </View>

        {/* About */}
        <SectionTitle title="About" />
        <View
          className="rounded-2xl overflow-hidden"
          style={{ backgroundColor: COLORS.surface, ...SHADOWS.sm }}
        >
          <View
            className="flex-row items-center px-4 py-4"
            style={{ borderBottomWidth: 1, borderBottomColor: COLORS.border }}
          >
            <View
              className="w-8 h-8 rounded-full items-center justify-center mr-3"
              style={{ backgroundColor: COLORS.primary + "20" }}
            >
              <MaterialCommunityIcons
                name="information"
                size={16}
                color={COLORS.primary}
              />
            </View>
            <View className="flex-1">
              <Text
                className="text-sm font-semibold"
                style={{ color: COLORS.textPrimary }}
              >
                Version
              </Text>
            </View>
            <Text className="text-sm" style={{ color: COLORS.textMuted }}>
              v1.0.0
            </Text>
          </View>

          <TouchableOpacity
            onPress={() =>
              Alert.alert("Rate VeloSpend", "Thank you for using VeloSpend! Rating will be available when the app is published.")
            }
            className="flex-row items-center px-4 py-4"
          >
            <View
              className="w-8 h-8 rounded-full items-center justify-center mr-3"
              style={{ backgroundColor: COLORS.warning + "20" }}
            >
              <MaterialCommunityIcons
                name="star"
                size={16}
                color={COLORS.warning}
              />
            </View>
            <View className="flex-1">
              <Text
                className="text-sm font-semibold"
                style={{ color: COLORS.textPrimary }}
              >
                Rate VeloSpend
              </Text>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={20}
              color={COLORS.gray400}
            />
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <Text
          className="text-xs text-center mt-6"
          style={{ color: COLORS.textMuted }}
        >
          Made with ❤️ by VeloSpend
        </Text>
      </ScrollView>
    </View>
  );
}

// ─── Section Title ────────────────────────────────────────────────────────────

function SectionTitle({ title }: { title: string }) {
  return (
    <Text
      className="text-xs font-bold uppercase mb-2 ml-1"
      style={{ color: COLORS.textMuted, letterSpacing: 1 }}
    >
      {title}
    </Text>
  );
}
