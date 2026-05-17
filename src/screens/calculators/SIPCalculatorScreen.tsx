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
import { useThemeStore } from "../../store/useThemeStore";

export default function SIPCalculatorScreen() {
  const navigation = useNavigation();
  const { colors: COLORS } = useThemeStore();

  const [monthlyInvestment, setMonthlyInvestment] = useState("");
  const [expectedReturn, setExpectedReturn] = useState("");
  const [timePeriod, setTimePeriod] = useState("");
  const [result, setResult] = useState<{
    totalInvested: number;
    totalReturns: number;
    maturityAmount: number;
  } | null>(null);

  const color = "#2ECC71";

  const calculate = () => {
    const p = parseFloat(monthlyInvestment);
    const r = parseFloat(expectedReturn) / 12 / 100;
    const n = parseFloat(timePeriod) * 12;

    if (!p || !r || !n) return;

    const maturityAmount = p * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
    const totalInvested = p * n;
    const totalReturns = maturityAmount - totalInvested;

    setResult({ totalInvested, totalReturns, maturityAmount });
  };

  const reset = () => {
    setMonthlyInvestment("");
    setExpectedReturn("");
    setTimePeriod("");
    setResult(null);
  };

  return (
    <KeyboardAvoidingView
      className="flex-1"
      style={{ backgroundColor: COLORS.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar barStyle="light-content" backgroundColor={color} />

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
            <Text className="text-white text-xl font-bold">SIP Calculator</Text>
            <Text className="text-white text-xs opacity-70">Systematic Investment Plan</Text>
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Result */}
        {result && (
          <View
            className="rounded-2xl p-5 mb-4"
            style={{ backgroundColor: color + "15", borderWidth: 1, borderColor: color + "30" }}
          >
            <Text className="text-sm font-semibold mb-1 text-center" style={{ color: COLORS.textSecondary }}>
              Maturity Amount
            </Text>
            <Text className="text-4xl font-bold mb-4 text-center" style={{ color }}>
              ₹{result.maturityAmount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            </Text>
            <View
              className="rounded-xl p-3"
              style={{ backgroundColor: "rgba(255,255,255,0.6)" }}
            >
              <View className="flex-row justify-between mb-2">
                <Text className="text-sm" style={{ color: COLORS.textSecondary }}>Total Invested</Text>
                <Text className="text-sm font-bold" style={{ color: COLORS.textPrimary }}>
                  ₹{result.totalInvested.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                </Text>
              </View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-sm" style={{ color: COLORS.textSecondary }}>Total Returns</Text>
                <Text className="text-sm font-bold" style={{ color }}>
                  ₹{result.totalReturns.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                </Text>
              </View>
              <View
                className="flex-row justify-between pt-2"
                style={{ borderTopWidth: 1, borderTopColor: COLORS.border }}
              >
                <Text className="text-sm font-bold" style={{ color: COLORS.textPrimary }}>Returns %</Text>
                <Text className="text-sm font-bold" style={{ color }}>
                  {((result.totalReturns / result.totalInvested) * 100).toFixed(1)}%
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
          <CalcInput label="Monthly Investment (₹)" value={monthlyInvestment} onChangeText={setMonthlyInvestment} placeholder="e.g. 5000" colors={COLORS} />
          <CalcInput label="Expected Annual Return (%)" value={expectedReturn} onChangeText={setExpectedReturn} placeholder="e.g. 12" colors={COLORS} />
          <CalcInput label="Time Period (Years)" value={timePeriod} onChangeText={setTimePeriod} placeholder="e.g. 10" colors={COLORS} />
        </View>

        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={reset}
            className="flex-1 py-4 rounded-2xl items-center"
            style={{ backgroundColor: COLORS.gray100, borderWidth: 1, borderColor: COLORS.border }}
          >
            <Text className="text-sm font-bold" style={{ color: COLORS.textSecondary }}>Reset</Text>
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

function CalcInput({ label, value, onChangeText, placeholder, colors }: any) {
  return (
    <View className="mb-3">
      <Text className="text-sm font-semibold mb-2" style={{ color: colors.textSecondary }}>{label}</Text>
      <View
        className="flex-row items-center rounded-xl px-3"
        style={{ backgroundColor: colors.gray100, borderWidth: 1, borderColor: colors.border }}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          keyboardType="decimal-pad"
          className="flex-1 py-3 text-base"
          style={{ color: colors.textPrimary }}
        />
      </View>
    </View>
  );
}