import { create } from "zustand";
import { Appearance, ColorSchemeName } from "react-native";
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
  syncSystemTheme: () => void;
}

const resolveColors = (mode: ThemeMode): { colors: typeof COLORS; isDark: boolean } => {
  let isDark = false;

  if (mode === "system") {
    isDark = Appearance.getColorScheme() === "dark";
  } else {
    isDark = mode === "dark";
  }

  return {
    colors: isDark ? (DARK_COLORS as any) : COLORS,
    isDark,
  };
};

export const useThemeStore = create<ThemeStore>((set, get) => ({
  mode: "system",
  colors: COLORS,
  isDark: false,

  loadTheme: async () => {
    try {
      const stored = await AsyncStorage.getItem(SETTINGS_KEY);
      const mode: ThemeMode = stored
        ? JSON.parse(stored).theme || "system"
        : "system";
      const { colors, isDark } = resolveColors(mode);
      set({ mode, colors, isDark });
    } catch (error) {
      console.error("Failed to load theme:", error);
      const { colors, isDark } = resolveColors("system");
      set({ mode: "system", colors, isDark });
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
      const { colors, isDark } = resolveColors(mode);
      set({ mode, colors, isDark });
    } catch (error) {
      console.error("Failed to save theme:", error);
    }
  },

  syncSystemTheme: () => {
    const { mode } = get();
    if (mode === "system") {
      const { colors, isDark } = resolveColors("system");
      set({ colors, isDark });
    }
  },
}));