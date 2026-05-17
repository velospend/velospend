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

const FD_FREQUENCIES = [
  { label: "Monthly", value: 12 },
  { label: "Quarterly", value: 4 },
  { label: "Half-yearly", value: 2 },
  { label: "Yearly", value: 1 },
];

export default function FDCalculatorScreen() {
  const navigation = useNavigation();
  const { colors: COLORS } = useThemeStore();

  const [principal, setPrincipal] = useState("");
  const [rate, setRate] = useState("");
  const [time, setTime] = useState("");
  const [frequency, setFrequency] = useState(4);
  const [result, setResult] = useState<{
    maturityAmount: number;
    totalInterest: number;
  } | null>(null);

  const color = "#F39C12";

  const calculate = () => {
    const p = parseFloat(principal);
    const r = parseFloat(rate) / 100;
    const t = parseFloat(time);
    const n = frequency;

    if (!p || !r || !t) return;

    const maturityAmount = p * Math.pow(1 + r / n, n * t);
    const totalInterest = maturityAmount - p;

    setResult({ maturityAmount, totalInterest });
  };

  const reset = () => {
    setPrincipal("");
    setRate("");
    setTime("");
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
            <Text className="text-white text-xl font-bold">FD Calculator</Text>
            <Text className="text-white text-xs opacity-70">Fixed Deposit Returns</Text>
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
                <Text className="text-sm" style={{ color: COLORS.textSecondary }}>Principal Amount</Text>
                <Text className="text-sm font-bold" style={{ color: COLORS.textPrimary }}>
                  ₹{parseFloat(principal).toLocaleString("en-IN")}
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
                <Text className="text-sm font-bold" style={{ color: COLORS.textPrimary }}>Returns %</Text>
                <Text className="text-sm font-bold" style={{ color }}>
                  {((result.totalInterest / parseFloat(principal)) * 100).toFixed(1)}%
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
          <CalcInput label="Principal Amount (₹)" value={principal} onChangeText={setPrincipal} placeholder="e.g. 100000" colors={COLORS} />
          <CalcInput label="Annual Interest Rate (%)" value={rate} onChangeText={setRate} placeholder="e.g. 7.5" colors={COLORS} />
          <CalcInput label="Time Period (Years)" value={time} onChangeText={setTime} placeholder="e.g. 3" colors={COLORS} />

          {/* Compounding Frequency */}
          <Text className="text-sm font-semibold mb-2" style={{ color: COLORS.textSecondary }}>
            Compounding Frequency
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {FD_FREQUENCIES.map((f) => (
              <TouchableOpacity
                key={f.value}
                onPress={() => setFrequency(f.value)}
                className="px-3 py-2 rounded-xl"
                style={{
                  backgroundColor: frequency === f.value ? color : COLORS.gray100,
                  borderWidth: 1,
                  borderColor: frequency === f.value ? color : COLORS.border,
                }}
              >
                <Text
                  className="text-xs font-semibold"
                  style={{ color: frequency === f.value ? "white" : COLORS.textSecondary }}
                >
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
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