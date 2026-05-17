import { View, Text } from "react-native";
import { useThemeStore } from "../../store/useThemeStore";
export default function RecurringRemindersScreen() {
  const { colors: COLORS } = useThemeStore();
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-xl font-bold text-gray-800">Recurring Reminders Screen</Text>
    </View>
  );
}