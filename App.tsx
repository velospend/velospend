import { useEffect } from "react";
import { View, Text } from "react-native";
import { createTables } from "./src/database/schema";

export default function App() {
  useEffect(() => {
    try {
      createTables();
      console.log("✅ Database initialized successfully");
    } catch (error) {
      console.error("❌ Database initialization failed:", error);
    }
  }, []);

  return (
    <View className="flex-1 items-center justify-center bg-blue-500">
      <Text className="text-white text-2xl font-bold">Yash VeloSpend 🚀</Text>
    </View>
  );
}