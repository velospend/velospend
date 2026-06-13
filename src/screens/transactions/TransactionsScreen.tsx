import { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StatusBar,
  Modal,
  ScrollView,
  TextInput,
  RefreshControl
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { COLORS, SHADOWS } from "../../constants";
import { useThemeStore } from "../../store/useThemeStore";
import { getFilteredTransactions, getFilteredTransactionsWithMeta, searchTransactions } from "../../database/queries/transactions";
import { getCategoriesByUser } from "../../database/queries/categories";
import { getAccountsByUser } from "../../database/queries/accounts";
import { useUserStore } from "../../store/useUserStore";
import { Transaction, HomeStackParamList, TransactionWithMeta } from "../../types";

type TransactionsNavProp = StackNavigationProp<HomeStackParamList, "TransactionsScreen">;

const TYPE_FILTERS = [
  { label: "All", value: "" },
  { label: "Expense", value: "expense", color: COLORS.expense },
  { label: "Income", value: "income", color: COLORS.income },
  { label: "Investment", value: "investment", color: COLORS.investment },
  { label: "Transfer", value: "self_transfer", color: COLORS.transfer },
];

interface GroupedTransactions {
  title: string;
  data: TransactionWithMeta[];
}

export default function TransactionsScreen() {
  const navigation = useNavigation<TransactionsNavProp>();
  const { user, accounts } = useUserStore();
  const { colors: COLORS } = useThemeStore();

  const [transactions, setTransactions] = useState<TransactionWithMeta[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedType, setSelectedType] = useState("");
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const loadTransactions = useCallback(() => {
  if (!user) return;

  if (searchQuery.trim()) {
    const results = searchTransactions(user.id, searchQuery.trim());
    setTransactions(results);
    return;
  }

  const results = getFilteredTransactionsWithMeta(user.id, {
    type: selectedType || undefined,
    accountId: selectedAccountId || undefined,
    categoryId: selectedCategoryId || undefined,
    startDate: startDate?.toISOString(),
    endDate: endDate?.toISOString(),
  });
  setTransactions(results);
}, [user, selectedType, selectedAccountId, selectedCategoryId, startDate, endDate, searchQuery]);

  useFocusEffect(
    useCallback(() => {
      if (user) {
        setCategories(getCategoriesByUser(user.id));
        loadTransactions();
      }
    }, [user, loadTransactions])
  );

  // ─── Group transactions by date ───────────────────────────────────────────

  const grouped: GroupedTransactions[] = useMemo(() => {
    const map = new Map<string, TransactionWithMeta[]>();
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
  }, [transactions]);

  // ─── Summary ──────────────────────────────────────────────────────────────

  const summary = useMemo(() => {
    return transactions.reduce(
      (acc, txn) => {
        if (txn.type === "income") acc.income += txn.amount;
        else if (txn.type === "expense") acc.expense += txn.amount;
        else if (txn.type === "investment") acc.investment += txn.amount;
        return acc;
      },
      { income: 0, expense: 0, investment: 0 }
    );
  }, [transactions]);

  const activeFiltersCount = [
    selectedType,
    selectedAccountId,
    selectedCategoryId,
    startDate,
    endDate,
  ].filter(Boolean).length;

  const clearFilters = () => {
    setSelectedType("");
    setSelectedAccountId("");
    setSelectedCategoryId("");
    setStartDate(null);
    setEndDate(null);
  };

  const getCategoryById = (id: string) =>
    categories.find((c) => c.id === id);

  const [refreshing, setRefreshing] = useState(false);

const onRefresh = useCallback(() => {
  setRefreshing(true);
  loadTransactions();
  setTimeout(() => setRefreshing(false), 800);
}, [loadTransactions]);

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
              <MaterialCommunityIcons name="arrow-left" size={22} color="white" />
            </TouchableOpacity>
            <Text className="text-white text-xl font-bold">Transactions</Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowFilterModal(true)}
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
          >
            <MaterialCommunityIcons name="filter-variant" size={22} color="white" />
            {activeFiltersCount > 0 && (
              <View
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full items-center justify-center"
                style={{ backgroundColor: COLORS.accent }}
              >
                <Text className="text-white text-xs font-bold">
                  {activeFiltersCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Summary Row */}
        <View className="flex-row mt-4">
          <SummaryChip
            label="Income"
            amount={summary.income}
            colors={COLORS}
          />
          <SummaryChip
            label="Expense"
            amount={summary.expense}
            colors={COLORS}
          />
          <SummaryChip
            label="Invest"
            amount={summary.investment}
            colors={COLORS}
          />
        </View>

        {/* Type Filter Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-3"
          contentContainerStyle={{ gap: 8 }}
        >
          {TYPE_FILTERS.map((f) => {
            const isSelected = selectedType === f.value;
            return (
              <TouchableOpacity
                key={f.value}
                onPress={() => setSelectedType(f.value)}
                className="px-4 py-1.5 rounded-full"
                style={{
                  backgroundColor: isSelected
                    ? "rgba(255,255,255,0.9)"
                    : "rgba(255,255,255,0.2)",
                }}
              >
                <Text
                  className="text-xs font-bold"
                  style={{
                    color: isSelected
                      ? f.color || COLORS.primary
                      : "rgba(255,255,255,0.9)",
                  }}
                >
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Active Filters Bar */}
      {activeFiltersCount > 0 && (
        <View
          className="flex-row items-center px-4 py-2"
          style={{ backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border }}
        >
          <MaterialCommunityIcons name="filter" size={16} color={COLORS.primary} />
          <Text className="text-xs ml-1 flex-1" style={{ color: COLORS.textSecondary }}>
            {activeFiltersCount} filter{activeFiltersCount > 1 ? "s" : ""} applied
          </Text>
          <TouchableOpacity onPress={clearFilters}>
            <Text className="text-xs font-bold" style={{ color: COLORS.expense }}>
              Clear All
            </Text>
          </TouchableOpacity>
        </View>
      )}

{/* Search Bar */}
<View className="mt-3">
  <View
    className="flex-row items-center rounded-xl px-3"
    style={{
      backgroundColor: "rgba(255,255,255,0.15)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.2)",
    }}
  >
    <MaterialCommunityIcons name="magnify" size={18} color="white" />
    <TextInput
      value={searchQuery}
      onChangeText={(text) => {
        setSearchQuery(text);
        setIsSearching(text.length > 0);
      }}
      placeholder="Search transactions..."
      placeholderTextColor="rgba(255,255,255,0.5)"
      className="flex-1 py-2.5 px-2 text-sm"
      style={{ color: "white" }}
    />
    {searchQuery.length > 0 && (
      <TouchableOpacity
        onPress={() => {
          setSearchQuery("");
          setIsSearching(false);
        }}
      >
        <MaterialCommunityIcons
          name="close-circle"
          size={18}
          color="rgba(255,255,255,0.7)"
        />
      </TouchableOpacity>
    )}
  </View>
</View>

      {/* Grouped Transaction List */}
      {grouped.length === 0 ? (
        <EmptyTransactions colors={COLORS} />
      ) : (
        <FlatList
          data={grouped}
          keyExtractor={(item) => item.title}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
  <RefreshControl
    refreshing={refreshing}
    onRefresh={onRefresh}
    tintColor={COLORS.primary}
    colors={[COLORS.primary]}
  />
}
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
                {group.data.map((txn, index) => {
                  const category = getCategoryById(txn.categoryId);
                  return (
                    <TransactionRow
                      key={txn.id}
                      transaction={txn}
                      isLast={index === group.data.length - 1}
                      onPress={() =>
                        navigation.navigate("TransactionDetailScreen", {
                          transactionId: txn.id,
                        })
                      }
                      colors={COLORS}
                    />
                  );
                })}
              </View>
            </View>
          )}
        />
      )}

      {/* Filter Modal */}
      <FilterModal
        colors={COLORS}
        visible={showFilterModal}
        accounts={accounts}
        categories={categories}
        selectedAccountId={selectedAccountId}
        selectedCategoryId={selectedCategoryId}
        startDate={startDate}
        endDate={endDate}
        showStartPicker={showStartPicker}
        showEndPicker={showEndPicker}
        onSelectAccount={setSelectedAccountId}
        onSelectCategory={setSelectedCategoryId}
        onStartDatePress={() => setShowStartPicker(true)}
        onEndDatePress={() => setShowEndPicker(true)}
        onStartDateChange={(date: Date | undefined) => {
  setShowStartPicker(false);
  if (date) setStartDate(date);
}}
        onEndDateChange={(date: Date | undefined) => {
  setShowEndPicker(false);
  if (date) setEndDate(date);
}}
        onClear={clearFilters}
        onClose={() => setShowFilterModal(false)}
      />
    </View>
  );
}

// ─── Summary Chip ─────────────────────────────────────────────────────────────

function SummaryChip({ label, amount, colors }: { label: string; amount: number; colors: any }) {
  return (
    <View
      className="rounded-xl px-3 py-2"
      style={{
        backgroundColor: "rgba(255,255,255,0.15)",
        marginRight: 8,
        minWidth: 110,
      }}
    >
      <Text className="text-white text-xs opacity-80">{label}</Text>
      <Text className="text-white text-sm font-bold">
        ₹{amount.toLocaleString("en-IN")}
      </Text>
    </View>
  );
}

// ─── Transaction Row ──────────────────────────────────────────────────────────

function TransactionRow({
  transaction,
  isLast,
  onPress,
  colors
}: {
  transaction: TransactionWithMeta;
  isLast: boolean;
  onPress: () => void;
  colors: any;
}) {
  const { colors: COLORS } = useThemeStore();

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

  const color = transaction.categoryColor || typeColors[transaction.type] || COLORS.primary;
  const icon = transaction.categoryIcon || typeIcons[transaction.type] || "circle";
  const isIncome = transaction.type === "income";

  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center px-4 py-3"
      style={{
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: COLORS.border,
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
    style={{ color: COLORS.textPrimary }}
    numberOfLines={1}
  >
    {transaction.categoryName || transaction.type}
  </Text>
  {transaction.note && (
    <Text
      className="text-xs"
      style={{ color: COLORS.textSecondary }}
      numberOfLines={1}
    >
      {transaction.note}
    </Text>
  )}
  <Text className="text-xs mt-0.5" style={{ color: COLORS.textMuted }}>
    {transaction.accountName} · {new Date(transaction.dateTime).toLocaleDateString("en-IN", {
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
    </TouchableOpacity>
  );
}

// ─── Filter Modal ─────────────────────────────────────────────────────────────

function FilterModal({
  visible,
  accounts,
  categories,
  selectedAccountId,
  selectedCategoryId,
  startDate,
  endDate,
  showStartPicker,
  showEndPicker,
  onSelectAccount,
  onSelectCategory,
  onStartDatePress,
  onEndDatePress,
  onStartDateChange,
  onEndDateChange,
  onClear,
  onClose,
  colors
}: any) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View
        className="flex-1 justify-end"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      >
        <View
          className="rounded-t-3xl"
          style={{ backgroundColor: colors.surface, maxHeight: "80%" }}
        >
          {/* Handle */}
          <View className="items-center pt-3 pb-1">
            <View className="w-10 h-1 rounded-full" style={{ backgroundColor: colors.gray300 }} />
          </View>

          {/* Header */}
          <View className="flex-row items-center justify-between px-5 py-3">
            <Text className="text-lg font-bold" style={{ color: colors.textPrimary }}>
              Filters
            </Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialCommunityIcons name="close" size={24} color={colors.gray400} />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Account Filter */}
            <Text className="text-sm font-bold mb-2" style={{ color: colors.textSecondary }}>
              Account
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
              <View className="flex-row">
                <FilterChip
                  label="All"
                  isSelected={!selectedAccountId}
                  onPress={() => onSelectAccount("")}
                  colors={COLORS}
                />
                {accounts.map((acc: any) => (
                  <FilterChip
                    key={acc.id}
                    label={acc.name}
                    isSelected={selectedAccountId === acc.id}
                    onPress={() => onSelectAccount(acc.id)}
                    colors={COLORS}
                  />
                ))}
              </View>
            </ScrollView>

            {/* Category Filter */}
            <Text className="text-sm font-bold mb-2" style={{ color: colors.textSecondary }}>
              Category
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
              <View className="flex-row">
                <FilterChip
                  label="All"
                  isSelected={!selectedCategoryId}
                  onPress={() => onSelectCategory("")}
                  colors={COLORS}
                />
                {categories.map((cat: any) => (
                  <FilterChip
                    key={cat.id}
                    label={cat.name}
                    isSelected={selectedCategoryId === cat.id}
                    onPress={() => onSelectCategory(cat.id)}
                    colors={COLORS}
                  />
                ))}
              </View>
            </ScrollView>

            {/* Date Range */}
            <Text className="text-sm font-bold mb-2" style={{ color: colors.textSecondary }}>
              Date Range
            </Text>
            <View className="flex-row gap-3 mb-4">
              <TouchableOpacity
                onPress={onStartDatePress}
                className="flex-1 flex-row items-center rounded-xl px-3 py-3"
                style={{
                  backgroundColor: colors.gray100,
                  borderWidth: 1,
                  borderColor: startDate ? colors.primary : colors.border,
                }}
              >
                <MaterialCommunityIcons name="calendar-start" size={18} color={colors.gray400} />
                <Text className="text-sm ml-2" style={{ color: startDate ? colors.textPrimary : colors.textMuted }}>
                  {startDate
                    ? startDate.toLocaleDateString("en-IN", { day: "numeric", month: "short" })
                    : "From"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onEndDatePress}
                className="flex-1 flex-row items-center rounded-xl px-3 py-3"
                style={{
                  backgroundColor: colors.gray100,
                  borderWidth: 1,
                  borderColor: endDate ? colors.primary : colors.border,
                }}
              >
                <MaterialCommunityIcons name="calendar-end" size={18} color={colors.gray400} />
                <Text className="text-sm ml-2" style={{ color: endDate ? colors.textPrimary : colors.textMuted }}>
                  {endDate
                    ? endDate.toLocaleDateString("en-IN", { day: "numeric", month: "short" })
                    : "To"}
                </Text>
              </TouchableOpacity>
            </View>

            {showStartPicker && (
              <DateTimePicker
                value={startDate || new Date()}
                mode="date"
                display="default"
                onChange={(_, date: Date | undefined) => onStartDateChange(date)}
              />
            )}

            {showEndPicker && (
              <DateTimePicker
                value={endDate || new Date()}
                mode="date"
                display="default"
                onChange={(_, date: Date | undefined) => onEndDateChange(date)}
              />
            )}

            {/* Clear Button */}
            <TouchableOpacity
              onPress={() => { onClear(); onClose(); }}
              className="rounded-2xl py-4 items-center mt-2"
              style={{ backgroundColor: colors.gray100, borderWidth: 1, borderColor: colors.border }}
            >
              <Text className="text-sm font-bold" style={{ color: colors.textSecondary }}>
                Clear All Filters
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ─── Filter Chip ──────────────────────────────────────────────────────────────

function FilterChip({ label, isSelected, onPress, colors }: { label: string; isSelected: boolean; onPress: () => void; colors: any }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="px-4 py-2 mr-1 rounded-full"
      style={{
        backgroundColor: isSelected ? colors.primary : colors.gray100,
        borderWidth: 1,
        borderColor: isSelected ? colors.primary : colors.border,
      }}
    >
      <Text
        className="text-xs font-semibold"
        style={{color: isSelected ? "white" : colors.textSecondary}}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyTransactions({ colors }: { colors: any }) {
  return (
    <View className="flex-1 items-center justify-center py-20">
      <MaterialCommunityIcons name="receipt" size={56} color={colors.gray300} />
      <Text className="text-base font-semibold mt-4" style={{ color: colors.textSecondary }}>
        No transactions found
      </Text>
      <Text className="text-sm text-center mt-1" style={{ color: colors.textMuted }}>
        Try adjusting your filters or add a new transaction
      </Text>
    </View>
  );
}