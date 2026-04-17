import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StatusBar,
  Alert,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useCallback } from "react";
import { COLORS, SHADOWS } from "../../constants";
import { useUserStore } from "../../store/useUserStore";
import { deleteAccount } from "../../database/queries/accounts";
import { Account, HomeStackParamList } from "../../types";

type AccountsNavProp = StackNavigationProp<HomeStackParamList, "AccountsScreen">;

export default function AccountsScreen() {
  const navigation = useNavigation<AccountsNavProp>();
  const { accounts, loadAccounts } = useUserStore();

  // reload accounts every time screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadAccounts();
    }, [])
  );

  const totalBalance = accounts.reduce(
    (sum, acc) => sum + acc.currentBalance, 0
  );

  const handleDelete = (account: Account) => {
    Alert.alert(
      "Delete Account",
      `Are you sure you want to delete "${account.name}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteAccount(account.id);
            loadAccounts();
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1" style={{ backgroundColor: COLORS.background }}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* Header */}
      <View
        className="px-5 pt-14 pb-5"
        style={{ backgroundColor: COLORS.primary }}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="w-10 h-10 rounded-full items-center justify-center mr-3"
              style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
            >
              <MaterialCommunityIcons
                name="arrow-left"
                size={22}
                color="white"
              />
            </TouchableOpacity>
            <Text className="text-white text-xl font-bold">My Accounts</Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate("AddAccountScreen")}
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
          >
            <MaterialCommunityIcons name="plus" size={22} color="white" />
          </TouchableOpacity>
        </View>

        {/* Total Balance Summary */}
        <View
          className="mt-4 p-4 rounded-2xl"
          style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
        >
          <Text className="text-white text-sm opacity-80 mb-1">
            Total Balance
          </Text>
          <Text className="text-white text-3xl font-bold">
            ₹{totalBalance.toLocaleString("en-IN")}
          </Text>
          <Text className="text-white text-xs opacity-70 mt-1">
            Across {accounts.length} account{accounts.length !== 1 ? "s" : ""}
          </Text>
        </View>
      </View>

      {/* Accounts List */}
      <FlatList
        data={accounts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<EmptyAccounts />}
        renderItem={({ item }) => (
          <AccountListItem
            account={item}
            onEdit={() => navigation.navigate("EditAccountScreen", { accountId: item.id })}
            onDelete={() => handleDelete(item)}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />
    </View>
  );
}

// ─── Account List Item ────────────────────────────────────────────────────────

interface AccountListItemProps {
  account: Account;
  onEdit: () => void;
  onDelete: () => void;
}

function AccountListItem({ account, onEdit, onDelete }: AccountListItemProps) {
  const accountColors: Record<string, string> = {
    cash: "#2ECC71",
    wallet: "#F39C12",
    savings: "#3498DB",
    current: "#9B59B6",
    credit_card: "#E74C3C",
    gift_card: "#FF6584",
    other: "#95A5A6",
  };

  const accountIcons: Record<string, string> = {
    cash: "cash",
    wallet: "wallet",
    savings: "piggy-bank",
    current: "briefcase",
    credit_card: "credit-card",
    gift_card: "gift",
    other: "dots-horizontal",
  };

  const color = accountColors[account.type] || COLORS.primary;
  const icon = accountIcons[account.type] || "bank";

  const usedAmount = account.totalAmount - account.currentBalance;
  const usedPercent =
    account.totalAmount > 0
      ? Math.min((usedAmount / account.totalAmount) * 100, 100)
      : 0;

  return (
    <View
      className="rounded-2xl p-4"
      style={{ backgroundColor: COLORS.surface, ...SHADOWS.sm }}
    >
      <View className="flex-row items-center justify-between">
        {/* Left — icon + info */}
        <View className="flex-row items-center flex-1">
          <View
            className="w-12 h-12 rounded-2xl items-center justify-center mr-3"
            style={{ backgroundColor: color + "20" }}
          >
            <MaterialCommunityIcons
              name={icon as any}
              size={24}
              color={color}
            />
          </View>
          <View className="flex-1">
            <Text
              className="text-base font-bold"
              style={{ color: COLORS.textPrimary }}
            >
              {account.name}
            </Text>
            <Text
              className="text-xs mt-0.5 capitalize"
              style={{ color: COLORS.textMuted }}
            >
              {account.type.replace("_", " ")} · {account.currency}
            </Text>
          </View>
        </View>

        {/* Right — balance + actions */}
        <View className="items-end">
          <Text
            className="text-base font-bold"
            style={{ color: COLORS.textPrimary }}
          >
            ₹{account.currentBalance.toLocaleString("en-IN")}
          </Text>
          <View className="flex-row mt-1 gap-2">
            <TouchableOpacity
              onPress={onEdit}
              className="w-7 h-7 rounded-full items-center justify-center"
              style={{ backgroundColor: COLORS.primary + "20" }}
            >
              <MaterialCommunityIcons
                name="pencil"
                size={14}
                color={COLORS.primary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onDelete}
              className="w-7 h-7 rounded-full items-center justify-center"
              style={{ backgroundColor: COLORS.error + "20" }}
            >
              <MaterialCommunityIcons
                name="trash-can"
                size={14}
                color={COLORS.error}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Progress Bar — used vs total */}
      {account.totalAmount > 0 && (
        <View className="mt-3">
          <View className="flex-row justify-between mb-1">
            <Text className="text-xs" style={{ color: COLORS.textMuted }}>
              Used: ₹{usedAmount.toLocaleString("en-IN")}
            </Text>
            <Text className="text-xs" style={{ color: COLORS.textMuted }}>
              Total: ₹{account.totalAmount.toLocaleString("en-IN")}
            </Text>
          </View>
          <View
            className="h-1.5 rounded-full overflow-hidden"
            style={{ backgroundColor: COLORS.gray200 }}
          >
            <View
              className="h-full rounded-full"
              style={{
                width: `${usedPercent}%`,
                backgroundColor: usedPercent > 80 ? COLORS.error : color,
              }}
            />
          </View>
        </View>
      )}
    </View>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyAccounts() {
  return (
    <View className="items-center py-16">
      <MaterialCommunityIcons
        name="bank-off"
        size={56}
        color={COLORS.gray300}
      />
      <Text
        className="text-base font-semibold mt-4"
        style={{ color: COLORS.textSecondary }}
      >
        No accounts yet
      </Text>
      <Text
        className="text-sm text-center mt-1"
        style={{ color: COLORS.textMuted }}
      >
        Tap the + button to add your first account
      </Text>
    </View>
  );
}