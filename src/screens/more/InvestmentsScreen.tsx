import { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SectionList,
  StatusBar,
  Alert,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS, SHADOWS, INVESTMENT_TYPES } from "../../constants";
import { useThemeStore } from "../../store/useThemeStore";
import { getInvestmentsByUser, deleteInvestment } from "../../database/queries/investments";
import { useUserStore } from "../../store/useUserStore";
import { Investment, MoreStackParamList } from "../../types";

type InvestmentsNavProp = StackNavigationProp<MoreStackParamList, "InvestmentsScreen">;

export default function InvestmentsScreen() {
  const navigation = useNavigation<InvestmentsNavProp>();
  const { colors: COLORS } = useThemeStore();
  const { user } = useUserStore();
  const [sections, setSections] = useState<{ title: string; data: Investment[] }[]>([]);
  const [totalInvested, setTotalInvested] = useState(0);
  const [totalCurrentValue, setTotalCurrentValue] = useState(0);

  const loadInvestments = useCallback(() => {
    if (!user) return;
    const all = getInvestmentsByUser(user.id);

    // group by type
    const grouped = new Map<string, Investment[]>();
    all.forEach((inv) => {
      const typeLabel = INVESTMENT_TYPES.find((t) => t.value === inv.type)?.label || inv.type;
      if (!grouped.has(typeLabel)) grouped.set(typeLabel, []);
      grouped.get(typeLabel)!.push(inv);
    });

    setSections(
      Array.from(grouped.entries()).map(([title, data]) => ({ title, data }))
    );
    setTotalInvested(all.reduce((sum, inv) => sum + inv.totalInvested, 0));
    setTotalCurrentValue(all.reduce((sum, inv) => sum + inv.currentValue, 0));
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadInvestments();
    }, [loadInvestments])
  );

  const totalReturns = totalCurrentValue - totalInvested;
  const returnsPercent = totalInvested > 0
    ? ((totalReturns / totalInvested) * 100).toFixed(2)
    : "0.00";
  const isPositive = totalReturns >= 0;

  const handleDelete = (investment: Investment) => {
    Alert.alert(
      "Delete Investment",
      `Are you sure you want to delete "${investment.investmentName}"? All transactions will be deleted too.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteInvestment(investment.id);
            loadInvestments();
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1" style={{ backgroundColor: COLORS.background }}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.investment} />

      {/* Header */}
      <View
        className="px-5 pt-14 pb-5"
        style={{ backgroundColor: COLORS.investment }}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="w-10 h-10 rounded-full items-center justify-center mr-3"
              style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
            >
              <MaterialCommunityIcons name="arrow-left" size={22} color="white" />
            </TouchableOpacity>
            <Text className="text-white text-xl font-bold">Investments</Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate("AddInvestmentScreen")}
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
          >
            <MaterialCommunityIcons name="plus" size={22} color="white" />
          </TouchableOpacity>
        </View>

        {/* Portfolio Summary */}
        <View
          className="mt-4 p-4 rounded-2xl"
          style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
        >
          <Text className="text-white text-sm opacity-80 mb-1">
            Total Portfolio Value
          </Text>
          <Text className="text-white text-3xl font-bold">
            ₹{totalCurrentValue.toLocaleString("en-IN")}
          </Text>
          <View className="flex-row items-center justify-between mt-2">
            <Text className="text-white text-xs opacity-70">
              Invested: ₹{totalInvested.toLocaleString("en-IN")}
            </Text>
            <View
              className="flex-row items-center px-2 py-1 rounded-full"
              style={{ backgroundColor: isPositive ? "rgba(46,204,113,0.3)" : "rgba(231,76,60,0.3)" }}
            >
              <MaterialCommunityIcons
                name={isPositive ? "trending-up" : "trending-down"}
                size={14}
                color="white"
              />
              <Text className="text-white text-xs font-bold ml-1">
                {isPositive ? "+" : ""}₹{totalReturns.toLocaleString("en-IN")} ({returnsPercent}%)
              </Text>
            </View>
          </View>
        </View>
      </View>

      {sections.length === 0 ? (
        <EmptyInvestments onAdd={() => navigation.navigate("AddInvestmentScreen")} />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
          renderSectionHeader={({ section }) => (
            <View className="flex-row items-center mb-3 mt-2">
              <View
                className="px-3 py-1 rounded-full mr-2"
                style={{ backgroundColor: COLORS.investment + "20" }}
              >
                <Text
                  className="text-xs font-bold"
                  style={{ color: COLORS.investment }}
                >
                  {section.title}
                </Text>
              </View>
              <View
                className="flex-1 h-px"
                style={{ backgroundColor: COLORS.border }}
              />
              <Text className="text-xs ml-2" style={{ color: COLORS.textMuted }}>
                {section.data.length} investment{section.data.length > 1 ? "s" : ""}
              </Text>
            </View>
          )}
          renderSectionFooter={() => <View style={{ height: 12 }} />}
          renderItem={({ item }) => (
            <InvestmentCard
              investment={item}
              onPress={() => navigation.navigate("InvestmentDetailScreen", { investmentId: item.id })}
              onEdit={() => navigation.navigate("EditInvestmentScreen", { investmentId: item.id })}
              onDelete={() => handleDelete(item)}
            />
          )}
        />
      )}
    </View>
  );
}

// ─── Investment Card ──────────────────────────────────────────────────────────

function InvestmentCard({
  investment,
  onPress,
  onEdit,
  onDelete,
}: {
  investment: Investment;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const returns = investment.currentValue - investment.totalInvested;
  const returnsPercent = investment.totalInvested > 0
    ? ((returns / investment.totalInvested) * 100).toFixed(2)
    : "0.00";
  const isPositive = returns >= 0;

  return (
    <TouchableOpacity
      onPress={onPress}
      className="rounded-2xl p-4 mb-3"
      style={{ backgroundColor: COLORS.surface, ...SHADOWS.sm }}
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-row items-center flex-1">
          <View
            className="w-12 h-12 rounded-2xl items-center justify-center mr-3"
            style={{ backgroundColor: COLORS.investment + "20" }}
          >
            <MaterialCommunityIcons
              name="trending-up"
              size={24}
              color={COLORS.investment}
            />
          </View>
          <View className="flex-1">
            <Text
              className="text-base font-bold"
              style={{ color: COLORS.textPrimary }}
              numberOfLines={1}
            >
              {investment.investmentName}
            </Text>
            <View className="flex-row items-center mt-1 gap-2">
              <View
                className="px-2 py-0.5 rounded-full"
                style={{ backgroundColor: COLORS.investment + "20" }}
              >
                <Text
                  className="text-xs font-semibold"
                  style={{ color: COLORS.investment }}
                >
                  {investment.recurringType === "recurring"
                    ? `${investment.recurrencePeriod} SIP`
                    : "One-time"}
                </Text>
              </View>
            </View>
          </View>
        </View>
        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={onEdit}
            className="w-7 h-7 rounded-full items-center justify-center"
            style={{ backgroundColor: COLORS.primary + "20" }}
          >
            <MaterialCommunityIcons name="pencil" size={14} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onDelete}
            className="w-7 h-7 rounded-full items-center justify-center"
            style={{ backgroundColor: COLORS.error + "20" }}
          >
            <MaterialCommunityIcons name="trash-can" size={14} color={COLORS.error} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Values */}
      <View
        className="flex-row mt-3 pt-3"
        style={{ borderTopWidth: 1, borderTopColor: COLORS.border }}
      >
        <View className="flex-1">
          <Text className="text-xs" style={{ color: COLORS.textMuted }}>Invested</Text>
          <Text className="text-sm font-bold mt-0.5" style={{ color: COLORS.textPrimary }}>
            ₹{investment.totalInvested.toLocaleString("en-IN")}
          </Text>
        </View>
        <View className="flex-1">
          <Text className="text-xs" style={{ color: COLORS.textMuted }}>Current Value</Text>
          <Text className="text-sm font-bold mt-0.5" style={{ color: COLORS.textPrimary }}>
            ₹{investment.currentValue.toLocaleString("en-IN")}
          </Text>
        </View>
        <View className="flex-1 items-end">
          <Text className="text-xs" style={{ color: COLORS.textMuted }}>Returns</Text>
          <View className="flex-row items-center mt-0.5">
            <MaterialCommunityIcons
              name={isPositive ? "trending-up" : "trending-down"}
              size={14}
              color={isPositive ? COLORS.income : COLORS.expense}
            />
            <Text
              className="text-sm font-bold ml-0.5"
              style={{ color: isPositive ? COLORS.income : COLORS.expense }}
            >
              {returnsPercent}%
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyInvestments({ onAdd }: { onAdd: () => void }) {
  return (
    <View className="flex-1 items-center justify-center px-8">
      <MaterialCommunityIcons name="chart-line" size={64} color={COLORS.gray300} />
      <Text className="text-lg font-bold mt-4" style={{ color: COLORS.textSecondary }}>
        No Investments Yet
      </Text>
      <Text className="text-sm text-center mt-2 mb-6" style={{ color: COLORS.textMuted }}>
        Start tracking your investments and watch your portfolio grow
      </Text>
      <TouchableOpacity
        onPress={onAdd}
        className="px-6 py-3 rounded-2xl"
        style={{ backgroundColor: COLORS.investment }}
      >
        <Text className="text-white font-bold">Add Investment</Text>
      </TouchableOpacity>
    </View>
  );
}