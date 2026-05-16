import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS, SHADOWS } from "../../constants";

export default function SimpleInterestScreen() {
  const navigation = useNavigation();

  const [principal, setPrincipal] = useState("");
  const [rate, setRate] = useState("");
  const [time, setTime] = useState("");
  const [timeUnit, setTimeUnit] = useState<"years" | "months">("years");
  const [result, setResult] = useState<{
    interest: number;
    totalAmount: number;
  } | null>(null);

  const calculate = () => {
    const p = parseFloat(principal);
    const r = parseFloat(rate);
    let t = parseFloat(time);

    if (!p || !r || !t) return;

    if (timeUnit === "months") t = t / 12;

    const interest = (p * r * t) / 100;
    const totalAmount = p + interest;

    setResult({ interest, totalAmount });
  };

  const reset = () => {
    setPrincipal("");
    setRate("");
    setTime("");
    setResult(null);
  };

  const color = "#3498DB";

  return (
    <KeyboardAvoidingView
      className="flex-1"
      style={{ backgroundColor: COLORS.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar barStyle="light-content" backgroundColor={color} />

      {/* Header */}
      <View className="px-5 pt-14 pb-5" style={{ backgroundColor: color }}>
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-10 h-10 rounded-full items-center justify-center mr-3"
            style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
          >
            <MaterialCommunityIcons name="arrow-left" size={22} color="white" />
          </TouchableOpacity>
          <View>
            <Text className="text-white text-xl font-bold">Simple Interest</Text>
            <Text className="text-white text-xs opacity-70">SI = (P × R × T) / 100</Text>
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Result Card */}
        {result && (
          <View
            className="rounded-2xl p-5 mb-4 items-center"
            style={{ backgroundColor: color + "15", borderWidth: 1, borderColor: color + "30" }}
          >
            <Text className="text-sm font-semibold mb-1" style={{ color: COLORS.textSecondary }}>
              Total Amount
            </Text>
            <Text className="text-4xl font-bold mb-3" style={{ color }}>
              ₹{result.totalAmount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
            </Text>
            <View className="flex-row gap-6">
              <View className="items-center">
                <Text className="text-xs" style={{ color: COLORS.textMuted }}>Principal</Text>
                <Text className="text-sm font-bold" style={{ color: COLORS.textPrimary }}>
                  ₹{parseFloat(principal).toLocaleString("en-IN")}
                </Text>
              </View>
              <View className="items-center">
                <Text className="text-xs" style={{ color: COLORS.textMuted }}>Interest</Text>
                <Text className="text-sm font-bold" style={{ color }}>
                  ₹{result.interest.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Inputs */}
        <View
          className="rounded-2xl p-4 mb-4"
          style={{ backgroundColor: COLORS.surface, ...SHADOWS.sm }}
        >
          <CalcInput
            label="Principal Amount (₹)"
            value={principal}
            onChangeText={setPrincipal}
            placeholder="e.g. 10000"
            color={color}
          />
          <CalcInput
            label="Rate of Interest (% per year)"
            value={rate}
            onChangeText={setRate}
            placeholder="e.g. 8"
            color={color}
          />

          {/* Time with unit toggle */}
          <Text className="text-sm font-semibold mb-2" style={{ color: COLORS.textSecondary }}>
            Time Period
          </Text>
          <View className="flex-row gap-3 mb-3">
            <View
              className="flex-1 flex-row items-center rounded-xl px-3"
              style={{
                backgroundColor: COLORS.gray100,
                borderWidth: 1,
                borderColor: COLORS.border,
              }}
            >
              <TextInput
                value={time}
                onChangeText={setTime}
                placeholder="e.g. 2"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="decimal-pad"
                className="flex-1 py-3 text-base"
                style={{ color: COLORS.textPrimary }}
              />
            </View>
            <View
              className="flex-row rounded-xl overflow-hidden"
              style={{ backgroundColor: COLORS.gray100 }}
            >
              {(["years", "months"] as const).map((unit) => (
                <TouchableOpacity
                  key={unit}
                  onPress={() => setTimeUnit(unit)}
                  className="px-3 py-2 items-center justify-center"
                  style={{
                    backgroundColor: timeUnit === unit ? color : "transparent",
                  }}
                >
                  <Text
                    className="text-xs font-bold capitalize"
                    style={{ color: timeUnit === unit ? "white" : COLORS.textSecondary }}
                  >
                    {unit}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Buttons */}
        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={reset}
            className="flex-1 py-4 rounded-2xl items-center"
            style={{
              backgroundColor: COLORS.gray100,
              borderWidth: 1,
              borderColor: COLORS.border,
            }}
          >
            <Text className="text-sm font-bold" style={{ color: COLORS.textSecondary }}>
              Reset
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={calculate}
            className="flex-1 py-4 rounded-2xl items-center"
            style={{ backgroundColor: color, ...SHADOWS.md }}
          >
            <Text className="text-white text-sm font-bold">Calculate</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function CalcInput({
  label,
  value,
  onChangeText,
  placeholder,
  color,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  color: string;
}) {
  return (
    <View className="mb-3">
      <Text className="text-sm font-semibold mb-2" style={{ color: COLORS.textSecondary }}>
        {label}
      </Text>
      <View
        className="flex-row items-center rounded-xl px-3"
        style={{
          backgroundColor: COLORS.gray100,
          borderWidth: 1,
          borderColor: COLORS.border,
        }}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textMuted}
          keyboardType="decimal-pad"
          className="flex-1 py-3 text-base"
          style={{ color: COLORS.textPrimary }}
        />
      </View>
    </View>
  );
}