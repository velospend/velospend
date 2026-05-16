import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS, SHADOWS } from "../../constants";
import { CalculatorStackParamList } from "../../types";

type CalcNavProp = StackNavigationProp<CalculatorStackParamList, "CalculatorsScreen">;

const CALCULATORS = [
  {
    id: "si",
    title: "Simple Interest",
    description: "Calculate interest on principal amount",
    icon: "cash-plus",
    color: "#3498DB",
    screen: "SimpleInterestScreen",
  },
  {
    id: "ci",
    title: "Compound Interest",
    description: "Calculate interest compounded over time",
    icon: "chart-line",
    color: "#9B59B6",
    screen: "CompoundInterestScreen",
  },
  {
    id: "loan",
    title: "Loan / EMI",
    description: "Calculate monthly EMI for any loan",
    icon: "bank",
    color: "#E74C3C",
    screen: "LoanCalculatorScreen",
  },
  {
    id: "sip",
    title: "SIP Calculator",
    description: "Calculate returns on monthly SIP investments",
    icon: "trending-up",
    color: "#2ECC71",
    screen: "SIPCalculatorScreen",
  },
  {
    id: "fd",
    title: "FD Calculator",
    description: "Calculate maturity amount for fixed deposits",
    icon: "piggy-bank",
    color: "#F39C12",
    screen: "FDCalculatorScreen",
  },
];

export default function CalculatorsScreen() {
  const navigation = useNavigation<CalcNavProp>();

  return (
    <View className="flex-1" style={{ backgroundColor: COLORS.background }}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* Header */}
      <View
        className="px-5 pt-14 pb-5"
        style={{ backgroundColor: COLORS.primary }}
      >
        <Text className="text-white text-2xl font-bold">Calculators</Text>
        <Text className="text-white text-sm opacity-70 mt-1">
          Financial tools to plan better
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      >
        {CALCULATORS.map((calc) => (
          <TouchableOpacity
            key={calc.id}
            onPress={() => navigation.navigate(calc.screen as any)}
            className="flex-row items-center rounded-2xl p-4 mb-3"
            style={{ backgroundColor: COLORS.surface, ...SHADOWS.sm }}
          >
            <View
              className="w-14 h-14 rounded-2xl items-center justify-center mr-4"
              style={{ backgroundColor: calc.color + "20" }}
            >
              <MaterialCommunityIcons
                name={calc.icon as any}
                size={28}
                color={calc.color}
              />
            </View>
            <View className="flex-1">
              <Text
                className="text-base font-bold"
                style={{ color: COLORS.textPrimary }}
              >
                {calc.title}
              </Text>
              <Text
                className="text-xs mt-0.5"
                style={{ color: COLORS.textMuted }}
              >
                {calc.description}
              </Text>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={20}
              color={COLORS.gray400}
            />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}