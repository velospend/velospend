import { useEffect, useState } from "react";
import { View, ActivityIndicator, Appearance } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import { createTables, seedGuestUser } from "./src/database/schema";
import RootNavigator from "./src/navigation";
import { COLORS } from "./src/constants";
import { useThemeStore } from "./src/store/useThemeStore";

export default function App() {
  const { loadTheme, syncSystemTheme } = useThemeStore();
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        createTables();
        seedGuestUser();
        await loadTheme();
        console.log("✅ App initialized successfully");
      } catch (error) {
        console.error("❌ Initialization failed:", error);
      } finally {
        setDbReady(true);
      }
    };
    init();
  }, []);

  // listen for system theme changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(() => {
      syncSystemTheme();
    });
    return () => subscription.remove();
  }, []);

  if (!dbReady) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: COLORS.primary,
        }}
      >
        <ActivityIndicator size="large" color="white" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}