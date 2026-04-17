import { useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  StatusBar,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS, SHADOWS, SPACING, RADIUS } from "../../constants";
import { useUserStore } from "../../store/useUserStore";
import { useTransactionStore } from "../../store/useTransactionStore";
import { Account, Transaction } from "../../types";
import { HomeStackParamList } from "../../types";

type HomeNavProp = StackNavigationProp<HomeStackParamList, "HomeScreen">;

export default function HomeScreen() {
  const navigation = useNavigation<HomeNavProp>();
  const { user, accounts, loadUser, loadAccounts } = useUserStore();
  const { recentTransactions, loadRecentTransactions } = useTransactionStore();

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (user) loadRecentTransactions(user.id);
  }, [user]);

  // const totalBalance = accounts.reduce(
  //   (sum, acc) => sum + acc.currentBalance, 0
  // );

  return (
    <View className="flex-1" style={{ backgroundColor: COLORS.background }}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* Header */}
      <View
  className="px-5 pt-14 pb-5"
  style={{ backgroundColor: COLORS.primary }}
>
  <View className="flex-row items-center justify-between">
    <View>
      <Text className="text-white text-sm opacity-80">Welcome back,</Text>
      <Text className="text-white text-2xl font-bold">
        {user?.name || "Guest"} 👋
      </Text>
    </View>
    <TouchableOpacity
  onPress={() => navigation.navigate("MoreScreen")}
  className="w-10 h-10 rounded-full items-center justify-center"
  style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
>
  <MaterialCommunityIcons name="menu" size={22} color="white" />
</TouchableOpacity>
  </View>
</View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Account Cards Carousel */}
        <View className="mt-5">
          <View className="flex-row items-center justify-between px-5 mb-3">
            <Text
              className="text-base font-bold"
              style={{ color: COLORS.textPrimary }}
            >
              My Accounts
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate("AccountsScreen")}>
              <Text
                className="text-sm font-semibold"
                style={{ color: COLORS.primary }}
              >
                See All
              </Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={[...accounts, { id: "add", name: "add" } as any]}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: SPACING.base }}
            ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
            renderItem={({ item }) => {
              if (item.id === "add") {
                return (
                  <TouchableOpacity
                    onPress={() => navigation.navigate("AddAccountScreen")}
                    className="items-center justify-center rounded-2xl"
                    style={{
                      width: 60,
                      height: 130,
                      backgroundColor: COLORS.gray100,
                      borderWidth: 2,
                      borderColor: COLORS.border,
                      borderStyle: "dashed",
                    }}
                  >
                    <MaterialCommunityIcons
                      name="plus"
                      size={28}
                      color={COLORS.gray400}
                    />
                  </TouchableOpacity>
                );
              }
              return <AccountCard account={item} />;
            }}
          />
        </View>

        {/* Recent Transactions */}
        <View className="mt-6 px-5">
          <View className="flex-row items-center justify-between mb-3">
            <Text
              className="text-base font-bold"
              style={{ color: COLORS.textPrimary }}
            >
              Recent Transactions
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("TransactionsScreen")}
            >
              <Text
                className="text-sm font-semibold"
                style={{ color: COLORS.primary }}
              >
                View All
              </Text>
            </TouchableOpacity>
          </View>

          {recentTransactions.length === 0 ? (
            <EmptyTransactions />
          ) : (
            recentTransactions.map((txn) => (
              <TransactionItem key={txn.id} transaction={txn} />
            ))
          )}
        </View>
      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity
        onPress={() => navigation.navigate("AddTransactionScreen")}
        className="absolute bottom-6 right-6 w-14 h-14 rounded-full items-center justify-center"
        style={{
          backgroundColor: COLORS.primary,
          ...SHADOWS.lg,
        }}
      >
        <MaterialCommunityIcons name="plus" size={28} color="white" />
      </TouchableOpacity>
    </View>
  );
}

// ─── Account Card ─────────────────────────────────────────────────────────────

function AccountCard({ account }: { account: Account }) {
  const accountColors: Record<string, string> = {
    gift_card: "#6C63FF",
    cash: "#2ECC71",
    wallet: "#F39C12",
    savings: "#3498DB",
    current: "#9B59B6",
    credit_card: "#E74C3C",
    other: "#95A5A6",
  };

  const accountIcons: Record<string, string> = {
    gift_card: "gift",
    cash: "cash",
    wallet: "wallet",
    savings: "piggy-bank",
    current: "briefcase",
    credit_card: "credit-card",
    other: "dots-horizontal",
  };

  const color = accountColors[account.type] || COLORS.primary;
  const icon = accountIcons[account.type] || "bank";

  return (
    <View
      className="rounded-2xl p-4"
      style={{
        width: 160,
        height: 130,
        backgroundColor: color,
        ...SHADOWS.md,
      }}
    >
      <View className="flex-row items-center justify-between mb-3">
        <MaterialCommunityIcons name={icon as any} size={22} color="white" />
        <Text
          className="text-xs font-semibold text-white opacity-80 capitalize"
        >
          {account.type.replace("_", " ")}
        </Text>
      </View>
      <Text
        className="text-white font-bold text-base mb-1"
        numberOfLines={1}
      >
        {account.name}
      </Text>
      <Text className="text-white text-lg font-bold">
        ₹{account.currentBalance.toLocaleString("en-IN")}
      </Text>
    </View>
  );
}

// ─── Transaction Item ─────────────────────────────────────────────────────────

function TransactionItem({ transaction }: { transaction: Transaction }) {
  const typeColors: Record<string, string> = {
    income: COLORS.income,
    expense: COLORS.expense,
    investment: COLORS.investment,
    self_transfer: COLORS.transfer,
  };

  const typeIcons: Record<string, string> = {
    income: "arrow-down-circle",
    expense: "arrow-up-circle",
    investment: "trending-up",
    self_transfer: "swap-horizontal",
  };

  const color = typeColors[transaction.type] || COLORS.primary;
  const icon = typeIcons[transaction.type] || "circle";
  const isIncome = transaction.type === "income";

  return (
    <View
      className="flex-row items-center rounded-2xl p-4 mb-3"
      style={{ backgroundColor: COLORS.surface, ...SHADOWS.sm }}
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
          style={{ color: COLORS.textPrimary }}
          numberOfLines={1}
        >
          {transaction.note || transaction.type}
        </Text>
        <Text className="text-xs mt-0.5" style={{ color: COLORS.textMuted }}>
          {new Date(transaction.dateTime).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </Text>
      </View>
      <Text
        className="text-sm font-bold"
        style={{ color: isIncome ? COLORS.income : COLORS.expense }}
      >
        {isIncome ? "+" : "-"}₹{transaction.amount.toLocaleString("en-IN")}
      </Text>
    </View>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyTransactions() {
  return (
    <View className="items-center py-10">
      <MaterialCommunityIcons
        name="receipt"
        size={48}
        color={COLORS.gray300}
      />
      <Text
        className="text-base font-semibold mt-3"
        style={{ color: COLORS.textSecondary }}
      >
        No transactions yet
      </Text>
      <Text
        className="text-sm text-center mt-1"
        style={{ color: COLORS.textMuted }}
      >
        Tap the + button to add your first transaction
      </Text>
    </View>
  );
}