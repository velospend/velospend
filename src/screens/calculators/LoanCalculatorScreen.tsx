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

export default function LoanCalculatorScreen() {
  const navigation = useNavigation();
  const { colors: COLORS } = useThemeStore();

  const [loanAmount, setLoanAmount] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [tenure, setTenure] = useState("");
  const [tenureUnit, setTenureUnit] = useState<"years" | "months">("years");
  const [result, setResult] = useState<{
    emi: number;
    totalAmount: number;
    totalInterest: number;
  } | null>(null);

  const color = "#E74C3C";

  const calculate = () => {
    const p = parseFloat(loanAmount);
    const annualRate = parseFloat(interestRate);
    let months = parseFloat(tenure);

    if (!p || !annualRate || !months) return;

    if (tenureUnit === "years") months = months * 12;

    const r = annualRate / 12 / 100;
    const emi = (p * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
    const totalAmount = emi * months;
    const totalInterest = totalAmount - p;

    setResult({ emi, totalAmount, totalInterest });
  };

  const reset = () => {
    setLoanAmount("");
    setInterestRate("");
    setTenure("");
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
            <Text className="text-white text-xl font-bold">Loan / EMI Calculator</Text>
            <Text className="text-white text-xs opacity-70">Calculate your monthly EMI</Text>
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
              Monthly EMI
            </Text>
            <Text className="text-4xl font-bold mb-4 text-center" style={{ color }}>
              ₹{result.emi.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            </Text>
            <View
              className="rounded-xl p-3"
              style={{ backgroundColor: "rgba(255,255,255,0.6)" }}
            >
              <View className="flex-row justify-between mb-2">
                <Text className="text-sm" style={{ color: COLORS.textSecondary }}>Principal Amount</Text>
                <Text className="text-sm font-bold" style={{ color: COLORS.textPrimary }}>
                  ₹{parseFloat(loanAmount).toLocaleString("en-IN")}
                </Text>
              </View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-sm" style={{ color: COLORS.textSecondary }}>Total Interest</Text>
                <Text className="text-sm font-bold" style={{ color }}>
                  ₹{result.totalInterest.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                </Text>
              </View>
              <View
                className="flex-row justify-between pt-2"
                style={{ borderTopWidth: 1, borderTopColor: COLORS.border }}
              >
                <Text className="text-sm font-bold" style={{ color: COLORS.textPrimary }}>Total Payment</Text>
                <Text className="text-sm font-bold" style={{ color: COLORS.textPrimary }}>
                  ₹{result.totalAmount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
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
          <CalcInput label="Loan Amount (₹)" value={loanAmount} onChangeText={setLoanAmount} placeholder="e.g. 500000" colors={COLORS} />
          <CalcInput label="Annual Interest Rate (%)" value={interestRate} onChangeText={setInterestRate} placeholder="e.g. 10.5" colors={COLORS} />

          {/* Tenure */}
          <Text className="text-sm font-semibold mb-2" style={{ color: COLORS.textSecondary }}>
            Loan Tenure
          </Text>
          <View className="flex-row gap-3 mb-3">
            <View
              className="flex-1 flex-row items-center rounded-xl px-3"
              style={{ backgroundColor: COLORS.gray100, borderWidth: 1, borderColor: COLORS.border }}
            >
              <TextInput
                value={tenure}
                onChangeText={setTenure}
                placeholder="e.g. 5"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="decimal-pad"
                className="flex-1 py-3 text-base"
                style={{ color: COLORS.textPrimary }}
              />
            </View>
            <View className="flex-row rounded-xl overflow-hidden" style={{ backgroundColor: COLORS.gray100 }}>
              {(["years", "months"] as const).map((unit) => (
                <TouchableOpacity
                  key={unit}
                  onPress={() => setTenureUnit(unit)}
                  className="px-3 py-2 items-center justify-center"
                  style={{ backgroundColor: tenureUnit === unit ? color : "transparent" }}
                >
                  <Text
                    className="text-xs font-bold capitalize"
                    style={{ color: tenureUnit === unit ? "white" : COLORS.textSecondary }}
                  >
                    {unit}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
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