import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

const PRIVACY_KEY = "velospend_balance_hidden";

interface PrivacyStore {
  isHidden: boolean;
  loadPreference: () => Promise<void>;
  toggle: () => Promise<void>;
}

export const usePrivacyStore = create<PrivacyStore>((set, get) => ({
  isHidden: false,

  loadPreference: async () => {
    try {
      const stored = await AsyncStorage.getItem(PRIVACY_KEY);
      if (stored !== null) {
        set({ isHidden: JSON.parse(stored) });
      }
    } catch (error) {
      console.error("Failed to load privacy preference:", error);
    }
  },

  toggle: async () => {
    const newValue = !get().isHidden;
    try {
      await AsyncStorage.setItem(PRIVACY_KEY, JSON.stringify(newValue));
      set({ isHidden: newValue });
    } catch (error) {
      console.error("Failed to save privacy preference:", error);
    }
  },
}));