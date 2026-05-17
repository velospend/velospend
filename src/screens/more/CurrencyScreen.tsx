import { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StatusBar,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLORS, SHADOWS, CURRENCIES } from "../../constants";
import { useThemeStore } from "../../store/useThemeStore";

const SETTINGS_KEY = "velospend_settings";

export default function CurrencyScreen() {
  const navigation = useNavigation();
  const { colors: COLORS } = useThemeStore();
  const [selectedCurrency, setSelectedCurrency] = useState("INR");

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        try {
          const stored = await AsyncStorage.getItem(SETTINGS_KEY);
          if (stored) {
            const settings = JSON.parse(stored);
            setSelectedCurrency(settings.currency || "INR");
          }
        } catch (error) {
          console.error("Failed to load currency:", error);
        }
      };
      load();
    }, [])
  );

  const handleSelect = async (currency: string) => {
    try {
      const stored = await AsyncStorage.getItem(SETTINGS_KEY);
      const settings = stored ? JSON.parse(stored) : {};
      await AsyncStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify({ ...settings, currency })
      );
      setSelectedCurrency(currency);
      navigation.goBack();
    } catch (error) {
      console.error("Failed to save currency:", error);
    }
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
          <View>
            <Text className="text-white text-xl font-bold">Currency</Text>
            <Text className="text-white text-xs opacity-70">
              Select your default currency
            </Text>
          </View>
        </View>
      </View>

      <FlatList
        data={CURRENCIES}
        keyExtractor={(item) => item.value}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => (
          <View style={{ height: 1, backgroundColor: COLORS.border }} />
        )}
        ListHeaderComponent={() => (
          <View
            className="rounded-t-2xl overflow-hidden"
            style={{ backgroundColor: COLORS.surface, ...SHADOWS.sm }}
          />
        )}
        renderItem={({ item, index }) => {
          const isSelected = selectedCurrency === item.value;
          const isFirst = index === 0;
          const isLast = index === CURRENCIES.length - 1;
          return (
            <TouchableOpacity
              onPress={() => handleSelect(item.value)}
              className="flex-row items-center px-4 py-4"
              style={{
                backgroundColor: COLORS.surface,
                borderTopLeftRadius: isFirst ? 16 : 0,
                borderTopRightRadius: isFirst ? 16 : 0,
                borderBottomLeftRadius: isLast ? 16 : 0,
                borderBottomRightRadius: isLast ? 16 : 0,
                ...SHADOWS.sm,
              }}
            >
              {/* Symbol */}
              <View
                className="w-10 h-10 rounded-full items-center justify-center mr-3"
                style={{
                  backgroundColor: isSelected
                    ? COLORS.primary + "20"
                    : COLORS.gray100,
                }}
              >
                <Text
                  className="text-base font-bold"
                  style={{
                    color: isSelected ? COLORS.primary : COLORS.textSecondary,
                  }}
                >
                  {item.symbol}
                </Text>
              </View>

              {/* Label */}
              <View className="flex-1">
                <Text
                  className="text-sm font-semibold"
                  style={{ color: COLORS.textPrimary }}
                >
                  {item.label}
                </Text>
                <Text className="text-xs mt-0.5" style={{ color: COLORS.textMuted }}>
                  {item.value}
                </Text>
              </View>

              {/* Selected checkmark */}
              {isSelected && (
                <MaterialCommunityIcons
                  name="check-circle"
                  size={22}
                  color={COLORS.primary}
                />
              )}
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}