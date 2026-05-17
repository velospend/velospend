import { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StatusBar,
} from "react-native";
import { useNavigation, useRoute, RouteProp, useFocusEffect } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS, SHADOWS } from "../../constants";
import { useThemeStore } from "../../store/useThemeStore";
import { getTransactionsByPlanner } from "../../database/queries/transactions";
import { Transaction, PlannerStackParamList } from "../../types";

type NavProp = StackNavigationProp<PlannerStackParamList, "PlannerTransactionsScreen">;
type RoutePropType = RouteProp<PlannerStackParamList, "PlannerTransactionsScreen">;

interface GroupedTransactions {
  title: string;
  data: Transaction[];
}

export default function PlannerTransactionsScreen() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RoutePropType>();
  const { colors: COLORS } = useThemeStore();
  const { plannerId, categoryId, categoryName, plannerTitle } = route.params;

  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useFocusEffect(
    useCallback(() => {
      const txns = getTransactionsByPlanner(plannerId, categoryId);
      setTransactions(txns);
    }, [plannerId, categoryId])
  );

  // ─── Summary ──────────────────────────────────────────────────────────────
  const total = transactions.reduce((sum, t) => sum + t.amount, 0);

  // ─── Group by date ────────────────────────────────────────────────────────
  const grouped: GroupedTransactions[] = (() => {
    const map = new Map<string, Transaction[]>();
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    transactions.forEach((txn) => {
      const date = new Date(txn.dateTime);
      let label = "";
      if (date.toDateString() === today.toDateString()) {
        label = "Today";
      } else if (date.toDateString() === yesterday.toDateString()) {
        label = "Yesterday";
      } else {
        label = date.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });
      }
      if (!map.has(label)) map.set(label, []);
      map.get(label)!.push(txn);
    });

    return Array.from(map.entries()).map(([title, data]) => ({ title, data }));
  })();

  return (
    <View className="flex-1" style={{ backgroundColor: COLORS.background }}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* Header */}
      <View
        className="px-5 pt-14 pb-5"
        style={{ backgroundColor: COLORS.primary }}
      >
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-10 h-10 rounded-full items-center justify-center mr-3"
            style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
          >
            <MaterialCommunityIcons name="arrow-left" size={22} color="white" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-white text-xl font-bold">{categoryName}</Text>
            <Text className="text-white text-xs opacity-70">{plannerTitle}</Text>
          </View>
        </View>

        {/* Summary */}
        <View
          className="mt-4 p-4 rounded-2xl"
          style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
        >
          <Text className="text-white text-sm opacity-80 mb-1">
            Total Transactions
          </Text>
          <View className="flex-row items-center justify-between">
            <Text className="text-white text-3xl font-bold">
              ₹{total.toLocaleString("en-IN")}
            </Text>
            <View
              className="px-3 py-1 rounded-full"
              style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
            >
              <Text className="text-white text-sm font-bold">
                {transactions.length} txn{transactions.length !== 1 ? "s" : ""}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Transaction List */}
      {grouped.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <MaterialCommunityIcons
            name="receipt"
            size={56}
            color={COLORS.gray300}
          />
          <Text
            className="text-base font-semibold mt-4"
            style={{ color: COLORS.textSecondary }}
          >
            No transactions yet
          </Text>
          <Text
            className="text-sm text-center mt-1"
            style={{ color: COLORS.textMuted }}
          >
            Add a transaction and link it to this planner and category
          </Text>
        </View>
      ) : (
        <FlatList
          data={grouped}
          keyExtractor={(item) => item.title}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item: group }) => (
            <View className="mb-4">
              {/* Date Header */}
              <View className="flex-row items-center mb-2">
                <Text
                  className="text-xs font-bold uppercase"
                  style={{ color: COLORS.textMuted, letterSpacing: 0.5 }}
                >
                  {group.title}
                </Text>
                <View
                  className="flex-1 h-px ml-2"
                  style={{ backgroundColor: COLORS.border }}
                />
                <Text
                  className="text-xs ml-2"
                  style={{ color: COLORS.textMuted }}
                >
                  {group.data.length} item{group.data.length > 1 ? "s" : ""}
                </Text>
              </View>

              {/* Transactions */}
              <View
                className="rounded-2xl overflow-hidden"
                style={{ backgroundColor: COLORS.surface, ...SHADOWS.sm }}
              >
                {group.data.map((txn, index) => (
                  <TransactionRow
                    key={txn.id}
                    transaction={txn}
                    isLast={index === group.data.length - 1}
                    colors={COLORS}
                  />
                ))}
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

// ─── Transaction Row ──────────────────────────────────────────────────────────

function TransactionRow({
  transaction,
  isLast,
  colors
}: {
  transaction: Transaction;
  isLast: boolean;
  colors: any;
}) {
  const typeColors: Record<string, string> = {
    income: colors.income,
    expense: colors.expense,
    investment: colors.investment,
    self_transfer: colors.transfer,
  };

  const typeIcons: Record<string, string> = {
    income: "arrow-down-circle",
    expense: "arrow-up-circle",
    investment: "trending-up",
    self_transfer: "swap-horizontal",
  };

  const color = typeColors[transaction.type] || colors.primary;
  const icon = typeIcons[transaction.type] || "circle";
  const isIncome = transaction.type === "income";

  return (
    <View
      className="flex-row items-center px-4 py-3"
      style={{
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: colors.border,
      }}
    >
      <View
        className="w-10 h-10 rounded-full items-center justify-center mr-3"
        style={{ backgroundColor: color + "20" }}
      >
        <MaterialCommunityIcons name={icon as any} size={20} color={color} />
      </View>
      <View className="flex-1">
        <Text
          className="text-sm font-semibold"
          style={{ color: colors.textPrimary }}
          numberOfLines={1}
        >
          {transaction.note || transaction.type}
        </Text>
        <Text className="text-xs mt-0.5" style={{ color: colors.textMuted }}>
          {new Date(transaction.dateTime).toLocaleString("en-IN", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
        {transaction.description && (
          <Text
            className="text-xs mt-0.5"
            style={{ color: colors.textMuted }}
            numberOfLines={1}
          >
            {transaction.description}
          </Text>
        )}
      </View>
      <Text
        className="text-sm font-bold"
        style={{ color: isIncome ? colors.income : colors.expense }}
      >
        {isIncome ? "+" : "-"}₹{transaction.amount.toLocaleString("en-IN")}
      </Text>
    </View>
  );
}