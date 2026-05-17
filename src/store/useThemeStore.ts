import { create } from "zustand";
import { Appearance } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLORS, DARK_COLORS } from "../constants";

const SETTINGS_KEY = "velospend_settings";

type ThemeMode = "light" | "dark" | "system";

interface ThemeStore {
  mode: ThemeMode;
  colors: typeof COLORS;
  isDark: boolean;
  loadTheme: () => Promise<void>;
  setTheme: (mode: ThemeMode) => Promise<void>;
}

const getColors = (mode: ThemeMode): { colors: typeof COLORS; isDark: boolean } => {
  if (mode === "system") {
    const systemTheme = Appearance.getColorScheme();
    const isDark = systemTheme === "dark";
    return { colors: isDark ? (DARK_COLORS as any) : COLORS, isDark };
  }
  const isDark = mode === "dark";
  return { colors: isDark ? (DARK_COLORS as any) : COLORS, isDark };
};

export const useThemeStore = create<ThemeStore>((set) => ({
  mode: "system",
  colors: COLORS,
  isDark: false,

  loadTheme: async () => {
    try {
      const stored = await AsyncStorage.getItem(SETTINGS_KEY);
      if (stored) {
        const settings = JSON.parse(stored);
        const mode: ThemeMode = settings.theme || "system";
        const { colors, isDark } = getColors(mode);
        set({ mode, colors, isDark });
      }
    } catch (error) {
      console.error("Failed to load theme:", error);
    }
  },

  setTheme: async (mode: ThemeMode) => {
    try {
      const stored = await AsyncStorage.getItem(SETTINGS_KEY);
      const settings = stored ? JSON.parse(stored) : {};
      await AsyncStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify({ ...settings, theme: mode })
      );
      const { colors, isDark } = getColors(mode);
      set({ mode, colors, isDark });
    } catch (error) {
      console.error("Failed to save theme:", error);
    }
  },
}));