import { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
} from "react-native";
import { useNavigation, useRoute, RouteProp, useFocusEffect } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS, SHADOWS } from "../../constants";
import { getTransactionById, deleteTransaction } from "../../database/queries/transactions";
import { getCategoriesByUser } from "../../database/queries/categories";
import { getAccountsByUser } from "../../database/queries/accounts";
import { getPlannersByUser } from "../../database/queries/planners";
import { useUserStore } from "../../store/useUserStore";
import { Transaction, HomeStackParamList } from "../../types";

type DetailNavProp = StackNavigationProp<HomeStackParamList, "TransactionDetailScreen">;
type DetailRouteProp = RouteProp<HomeStackParamList, "TransactionDetailScreen">;

const TYPE_CONFIG: Record<string, { color: string; icon: string; label: string }> = {
  expense: { color: COLORS.expense, icon: "arrow-up-circle", label: "Expense" },
  income: { color: COLORS.income, icon: "arrow-down-circle", label: "Income" },
  investment: { color: COLORS.investment, icon: "trending-up", label: "Investment" },
  self_transfer: { color: COLORS.transfer, icon: "swap-horizontal", label: "Transfer" },
};

export default function TransactionDetailScreen() {
  const navigation = useNavigation<DetailNavProp>();
  const route = useRoute<DetailRouteProp>();
  const { transactionId } = route.params;
  const { user, loadAccounts } = useUserStore();

  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [categoryIcon, setCategoryIcon] = useState("");
  const [categoryColor, setCategoryColor] = useState<string>(COLORS.primary);
  const [accountName, setAccountName] = useState("");
  const [toAccountName, setToAccountName] = useState("");
  const [plannerTitle, setPlannerTitle] = useState("");

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      const txn = getTransactionById(transactionId);
      if (!txn) return;
      setTransaction(txn);

      const categories = getCategoriesByUser(user.id);
      const accounts = getAccountsByUser(user.id);
      const planners = getPlannersByUser(user.id);

      const category = categories.find((c) => c.id === txn.categoryId);
      const account = accounts.find((a) => a.id === txn.accountId);
      const toAccount = accounts.find((a) => a.id === txn.toAccountId);
      const planner = planners.find((p) => p.id === txn.plannerId);

      setCategoryName(category?.name || "");
      setCategoryIcon(category?.icon || "");
      setCategoryColor(category?.color || COLORS.primary);
      setAccountName(account?.name || "Unknown Account");
      setToAccountName(toAccount?.name || "");
      setPlannerTitle(planner?.title || "");
    }, [transactionId, user])
  );

  const handleDelete = () => {
    Alert.alert(
      "Delete Transaction",
      "Are you sure you want to delete this transaction? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            if (transaction) {
              deleteTransaction(transaction.id);
              loadAccounts();
              navigation.goBack();
            }
          },
        },
      ]
    );
  };

  if (!transaction) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: COLORS.background }}>
        <Text style={{ color: COLORS.textMuted }}>Transaction not found.</Text>
      </View>
    );
  }

  const config = TYPE_CONFIG[transaction.type] || TYPE_CONFIG.expense;
  const isIncome = transaction.type === "income";

  return (
    <View className="flex-1" style={{ backgroundColor: COLORS.background }}>
      <StatusBar barStyle="light-content" backgroundColor={config.color} />

      {/* Header */}
      <View
        className="px-5 pt-14 pb-6"
        style={{ backgroundColor: config.color }}
      >
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
          >
            <MaterialCommunityIcons name="arrow-left" size={22} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">Transaction Detail</Text>
          <TouchableOpacity
            onPress={handleDelete}
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
          >
            <MaterialCommunityIcons name="trash-can" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Amount */}
        <View className="items-center mt-5">
          <View
            className="w-16 h-16 rounded-full items-center justify-center mb-3"
            style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
          >
            <MaterialCommunityIcons
              name={config.icon as any}
              size={32}
              color="white"
            />
          </View>
          <Text className="text-white text-4xl font-bold">
            {isIncome ? "+" : "-"}₹{transaction.amount.toLocaleString("en-IN")}
          </Text>
          <Text className="text-white text-sm opacity-80 mt-1">
            {config.label}
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      >
        {/* Main Details Card */}
        <View
          className="rounded-2xl overflow-hidden mb-4"
          style={{ backgroundColor: COLORS.surface, ...SHADOWS.sm }}
        >
          <DetailRow
            icon="calendar"
            label="Date & Time"
            value={new Date(transaction.dateTime).toLocaleString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          />
          <DetailRow
            icon="bank"
            label={transaction.type === "self_transfer" ? "From Account" : "Account"}
            value={accountName}
          />
          {transaction.type === "self_transfer" && toAccountName && (
            <DetailRow
              icon="bank-transfer"
              label="To Account"
              value={toAccountName}
            />
          )}
          {transaction.type !== "self_transfer" && categoryName && (
            <DetailRow
              icon={categoryIcon || "tag"}
              label="Category"
              value={categoryName}
              iconColor={categoryColor}
              isLast={!plannerTitle}
            />
          )}
          {plannerTitle && (
            <DetailRow
              icon="clipboard-list"
              label="Planner"
              value={plannerTitle}
              isLast
            />
          )}
        </View>

        {/* Note */}
        {transaction.note && (
          <View
            className="rounded-2xl p-4 mb-4"
            style={{ backgroundColor: COLORS.surface, ...SHADOWS.sm }}
          >
            <Text
              className="text-xs font-bold uppercase mb-2"
              style={{ color: COLORS.textMuted, letterSpacing: 0.5 }}
            >
              Note
            </Text>
            <Text
              className="text-sm font-semibold"
              style={{ color: COLORS.textPrimary }}
            >
              {transaction.note}
            </Text>
          </View>
        )}

        {/* Description */}
        {transaction.description && (
          <View
            className="rounded-2xl p-4 mb-4"
            style={{ backgroundColor: COLORS.surface, ...SHADOWS.sm }}
          >
            <Text
              className="text-xs font-bold uppercase mb-2"
              style={{ color: COLORS.textMuted, letterSpacing: 0.5 }}
            >
              Description
            </Text>
            <Text
              className="text-sm"
              style={{ color: COLORS.textSecondary, lineHeight: 20 }}
            >
              {transaction.description}
            </Text>
          </View>
        )}

        {/* Edit Button */}
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("EditTransactionScreen", {
              transactionId: transaction.id,
            })
          }
          className="rounded-2xl py-4 items-center flex-row justify-center gap-2"
          style={{ backgroundColor: config.color, ...SHADOWS.md }}
        >
          <MaterialCommunityIcons name="pencil" size={18} color="white" />
          <Text className="text-white text-base font-bold">Edit Transaction</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

// ─── Detail Row ───────────────────────────────────────────────────────────────

function DetailRow({
  icon,
  label,
  value,
  iconColor,
  isLast,
}: {
  icon: string;
  label: string;
  value: string;
  iconColor?: string;
  isLast?: boolean;
}) {
  return (
    <View
      className="flex-row items-center px-4 py-3"
      style={{
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: COLORS.border,
      }}
    >
      <View
        className="w-8 h-8 rounded-full items-center justify-center mr-3"
        style={{ backgroundColor: (iconColor || COLORS.primary) + "20" }}
      >
        <MaterialCommunityIcons
          name={icon as any}
          size={16}
          color={iconColor || COLORS.primary}
        />
      </View>
      <View className="flex-1">
        <Text className="text-xs" style={{ color: COLORS.textMuted }}>
          {label}
        </Text>
        <Text
          className="text-sm font-semibold mt-0.5"
          style={{ color: COLORS.textPrimary }}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}