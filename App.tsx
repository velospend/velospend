import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import { createTables, seedGuestUser } from "./src/database/schema";
import RootNavigator from "./src/navigation";
import { COLORS } from "./src/constants";

export default function App() {
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    const initDb = async () => {
      try {
        createTables();
        seedGuestUser();
        console.log("✅ Database initialized successfully");
      } catch (error) {
        console.error("❌ Database initialization failed:", error);
      } finally {
        setDbReady(true);
      }
    };
    initDb();
  }, []);

  // don't render anything until database is ready
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