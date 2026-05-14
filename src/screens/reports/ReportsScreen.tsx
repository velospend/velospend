import { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Dimensions,
  Modal,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { BarChart } from "react-native-chart-kit";
import DateTimePicker from "@react-native-community/datetimepicker";
import { COLORS, SHADOWS } from "../../constants";
import {
  getReportSummary,
  getMonthlySummary,
  getCategorySummary,
  getDateRange,
  ReportSummary,
  MonthlySummary,
  CategorySummary,
} from "../../database/queries/reports";
import { useUserStore } from "../../store/useUserStore";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const PERIODS = [
  { label: "Month", value: "this_month" },
  { label: "3M", value: "3_months" },
  { label: "6M", value: "6_months" },
  { label: "Year", value: "this_year" },
  { label: "Custom", value: "custom" },
];

export default function ReportsScreen() {
  const { user } = useUserStore();

  const [period, setPeriod] = useState("this_month");
  const [customStart, setCustomStart] = useState(new Date());
  const [customEnd, setCustomEnd] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);

  const [summary, setSummary] = useState<ReportSummary>({
    totalIncome: 0,
    totalExpense: 0,
    totalInvestment: 0,
    savings: 0,
  });
  const [monthlySummary, setMonthlySummary] = useState<MonthlySummary[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<CategorySummary[]>([]);
  const [incomeCategories, setIncomeCategories] = useState<CategorySummary[]>([]);
  const [categoryChartType, setCategoryChartType] = useState<"donut" | "bar">("bar");
  const [activeCategoryTab, setActiveCategoryTab] = useState<"expense" | "income">("expense");

  const loadReports = useCallback(() => {
    if (!user) return;

    let startDate: Date;
    let endDate: Date;

    if (period === "custom") {
      startDate = customStart;
      endDate = customEnd;
    } else {
      const range = getDateRange(period);
      startDate = range.startDate;
      endDate = range.endDate;
    }

    const start = startDate.toISOString();
    const end = endDate.toISOString();

    setSummary(getReportSummary(user.id, start, end));
    setMonthlySummary(getMonthlySummary(user.id, start, end));
    setExpenseCategories(getCategorySummary(user.id, start, end, "expense"));
    setIncomeCategories(getCategorySummary(user.id, start, end, "income"));
  }, [user, period, customStart, customEnd]);

  useFocusEffect(
    useCallback(() => {
      loadReports();
    }, [loadReports])
  );

  // ─── Bar Chart Data ───────────────────────────────────────────────────────

  const barChartData = {
    labels: monthlySummary.length > 0
      ? monthlySummary.map((m) => {
          const [year, month] = m.month.split("-");
          return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString("en-IN", { month: "short" });
        })
      : ["No Data"],
    datasets: [
      {
        data: monthlySummary.length > 0
          ? monthlySummary.map((m) => m.income)
          : [0],
        color: () => COLORS.income,
      },
      {
        data: monthlySummary.length > 0
          ? monthlySummary.map((m) => m.expense)
          : [0],
        color: () => COLORS.expense,
      },
    ],
    legend: ["Income", "Expense"],
  };

  const activeCategories = activeCategoryTab === "expense"
    ? expenseCategories
    : incomeCategories;

  return (
    <View className="flex-1" style={{ backgroundColor: COLORS.background }}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* Header */}
      <View
        className="px-5 pt-14 pb-4"
        style={{ backgroundColor: COLORS.primary }}
      >
        <Text className="text-white text-2xl font-bold">Reports</Text>

        {/* Period Selector */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-3"
          contentContainerStyle={{ gap: 8 }}
        >
          {PERIODS.map((p) => {
            const isSelected = period === p.value;
            return (
              <TouchableOpacity
                key={p.value}
                onPress={() => {
                  if (p.value === "custom") {
                    setShowCustomModal(true);
                  } else {
                    setPeriod(p.value);
                  }
                }}
                className="px-4 py-1.5 rounded-full"
                style={{
                  backgroundColor: isSelected
                    ? "rgba(255,255,255,0.9)"
                    : "rgba(255,255,255,0.2)",
                }}
              >
                <Text
                  className="text-xs font-bold"
                  style={{ color: isSelected ? COLORS.primary : "white" }}
                >
                  {p.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Custom date range display */}
        {period === "custom" && (
          <Text className="text-white text-xs opacity-70 mt-2">
            {customStart.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            {" → "}
            {customEnd.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </Text>
        )}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      >
        {/* Summary Cards */}
        <View className="flex flex-row flex-wrap justify-between items-center mb-4">
          <SummaryCard
            label="Income"
            amount={summary.totalIncome}
            color={COLORS.income}
            icon="arrow-down-circle"
          />
          <SummaryCard
            label="Expense"
            amount={summary.totalExpense}
            color={COLORS.expense}
            icon="arrow-up-circle"
          />
          <SummaryCard
            label="Investment"
            amount={summary.totalInvestment}
            color={COLORS.investment}
            icon="trending-up"
          />
          <SummaryCard
            label="Savings"
            amount={summary.savings}
            color={summary.savings >= 0 ? COLORS.income : COLORS.expense}
            icon="piggy-bank"
          />
        </View>

        {/* Income vs Expense Bar Chart */}
        {monthlySummary.length > 0 && (
          <View
            className="rounded-2xl p-4 mb-4"
            style={{ backgroundColor: COLORS.surface, ...SHADOWS.sm }}
          >
            <Text
              className="text-sm font-bold mb-3"
              style={{ color: COLORS.textPrimary }}
            >
              Income vs Expense
            </Text>
            <BarChart
              data={barChartData}
              width={SCREEN_WIDTH - 64}
              height={200}
              yAxisLabel="₹"
              yAxisSuffix=""
              chartConfig={{
                backgroundColor: COLORS.surface,
                backgroundGradientFrom: COLORS.surface,
                backgroundGradientTo: COLORS.surface,
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(108, 99, 255, ${opacity})`,
                labelColor: () => COLORS.textMuted,
                style: { borderRadius: 16 },
                barPercentage: 0.5,
              }}
              style={{ borderRadius: 12 }}
              showValuesOnTopOfBars={false}
              withInnerLines={false}
            />

            {/* Legend */}
            <View className="flex-row justify-center gap-4 mt-2">
              <View className="flex-row items-center gap-1">
                <View className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.income }} />
                <Text className="text-xs" style={{ color: COLORS.textMuted }}>Income</Text>
              </View>
              <View className="flex-row items-center gap-1">
                <View className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.expense }} />
                <Text className="text-xs" style={{ color: COLORS.textMuted }}>Expense</Text>
              </View>
            </View>
          </View>
        )}

        {/* Category Breakdown */}
        <View
          className="rounded-2xl p-4 mb-4"
          style={{ backgroundColor: COLORS.surface, ...SHADOWS.sm }}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-sm font-bold" style={{ color: COLORS.textPrimary }}>
              Category Breakdown
            </Text>
            {/* Chart Type Toggle */}
            <View
              className="flex-row rounded-xl overflow-hidden"
              style={{ backgroundColor: COLORS.gray100 }}
            >
              <TouchableOpacity
                onPress={() => setCategoryChartType("bar")}
                className="px-3 py-1.5"
                style={{
                  backgroundColor: categoryChartType === "bar"
                    ? COLORS.primary
                    : "transparent",
                }}
              >
                <MaterialCommunityIcons
                  name="chart-bar"
                  size={16}
                  color={categoryChartType === "bar" ? "white" : COLORS.gray400}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setCategoryChartType("donut")}
                className="px-3 py-1.5"
                style={{
                  backgroundColor: categoryChartType === "donut"
                    ? COLORS.primary
                    : "transparent",
                }}
              >
                <MaterialCommunityIcons
                  name="chart-donut"
                  size={16}
                  color={categoryChartType === "donut" ? "white" : COLORS.gray400}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Expense / Income Tab */}
          <View
            className="flex-row rounded-xl overflow-hidden mb-4"
            style={{ backgroundColor: COLORS.gray100 }}
          >
            <TouchableOpacity
              onPress={() => setActiveCategoryTab("expense")}
              className="flex-1 py-2 items-center"
              style={{
                backgroundColor: activeCategoryTab === "expense"
                  ? COLORS.expense
                  : "transparent",
              }}
            >
              <Text
                className="text-xs font-bold"
                style={{
                  color: activeCategoryTab === "expense" ? "white" : COLORS.textSecondary,
                }}
              >
                Expense
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveCategoryTab("income")}
              className="flex-1 py-2 items-center"
              style={{
                backgroundColor: activeCategoryTab === "income"
                  ? COLORS.income
                  : "transparent",
              }}
            >
              <Text
                className="text-xs font-bold"
                style={{
                  color: activeCategoryTab === "income" ? "white" : COLORS.textSecondary,
                }}
              >
                Income
              </Text>
            </TouchableOpacity>
          </View>

          {activeCategories.length === 0 ? (
            <View className="items-center py-8">
              <MaterialCommunityIcons
                name="chart-pie"
                size={40}
                color={COLORS.gray300}
              />
              <Text
                className="text-sm mt-2"
                style={{ color: COLORS.textMuted }}
              >
                No {activeCategoryTab} data for this period
              </Text>
            </View>
          ) : categoryChartType === "donut" ? (
            <DonutChart categories={activeCategories} />
          ) : (
            <HorizontalBarChart categories={activeCategories} />
          )}
        </View>

        {/* Top Spending Categories */}
        {expenseCategories.length > 0 && (
          <View
            className="rounded-2xl p-4"
            style={{ backgroundColor: COLORS.surface, ...SHADOWS.sm }}
          >
            <Text
              className="text-sm font-bold mb-3"
              style={{ color: COLORS.textPrimary }}
            >
              Top Spending Categories
            </Text>
            {expenseCategories.slice(0, 5).map((cat, index) => (
              <View
                key={cat.categoryId}
                className="flex-row items-center py-2"
                style={{
                  borderBottomWidth: index < Math.min(expenseCategories.length, 5) - 1 ? 1 : 0,
                  borderBottomColor: COLORS.border,
                }}
              >
                <Text
                  className="text-sm font-bold mr-3 w-5"
                  style={{ color: COLORS.textMuted }}
                >
                  #{index + 1}
                </Text>
                <View
                  className="w-8 h-8 rounded-xl items-center justify-center mr-3"
                  style={{ backgroundColor: cat.categoryColor + "20" }}
                >
                  <MaterialCommunityIcons
                    name={cat.categoryIcon as any}
                    size={16}
                    color={cat.categoryColor}
                  />
                </View>
                <Text
                  className="flex-1 text-sm font-semibold"
                  style={{ color: COLORS.textPrimary }}
                >
                  {cat.categoryName}
                </Text>
                <View className="items-end">
                  <Text
                    className="text-sm font-bold"
                    style={{ color: COLORS.expense }}
                  >
                    ₹{cat.total.toLocaleString("en-IN")}
                  </Text>
                  <Text className="text-xs" style={{ color: COLORS.textMuted }}>
                    {cat.percentage.toFixed(1)}%
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Custom Date Range Modal */}
      <Modal
        visible={showCustomModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowCustomModal(false)}
      >
        <View
          className="flex-1 justify-end"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <View
            className="rounded-t-3xl p-5"
            style={{ backgroundColor: COLORS.surface }}
          >
            <View className="items-center mb-4">
              <View className="w-10 h-1 rounded-full" style={{ backgroundColor: COLORS.gray300 }} />
            </View>

            <Text className="text-lg font-bold mb-4" style={{ color: COLORS.textPrimary }}>
              Custom Date Range
            </Text>

            {/* Start Date */}
            <Text className="text-sm font-semibold mb-2" style={{ color: COLORS.textSecondary }}>
              From
            </Text>
            <TouchableOpacity
              onPress={() => setShowStartPicker(true)}
              className="flex-row items-center rounded-xl px-3 py-3 mb-3"
              style={{ backgroundColor: COLORS.gray100, borderWidth: 1, borderColor: COLORS.border }}
            >
              <MaterialCommunityIcons name="calendar-start" size={18} color={COLORS.primary} />
              <Text className="text-sm ml-2 font-semibold" style={{ color: COLORS.textPrimary }}>
                {customStart.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
              </Text>
            </TouchableOpacity>

            {/* End Date */}
            <Text className="text-sm font-semibold mb-2" style={{ color: COLORS.textSecondary }}>
              To
            </Text>
            <TouchableOpacity
              onPress={() => setShowEndPicker(true)}
              className="flex-row items-center rounded-xl px-3 py-3 mb-4"
              style={{ backgroundColor: COLORS.gray100, borderWidth: 1, borderColor: COLORS.border }}
            >
              <MaterialCommunityIcons name="calendar-end" size={18} color={COLORS.primary} />
              <Text className="text-sm ml-2 font-semibold" style={{ color: COLORS.textPrimary }}>
                {customEnd.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
              </Text>
            </TouchableOpacity>

            {showStartPicker && (
              <DateTimePicker
                value={customStart}
                mode="date"
                display="default"
                onChange={(_, date) => {
                  setShowStartPicker(false);
                  if (date) setCustomStart(date);
                }}
              />
            )}

            {showEndPicker && (
              <DateTimePicker
                value={customEnd}
                mode="date"
                display="default"
                onChange={(_, date) => {
                  setShowEndPicker(false);
                  if (date) setCustomEnd(date);
                }}
              />
            )}

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setShowCustomModal(false)}
                className="flex-1 py-3 rounded-xl items-center"
                style={{ backgroundColor: COLORS.gray100, borderWidth: 1, borderColor: COLORS.border }}
              >
                <Text className="text-sm font-bold" style={{ color: COLORS.textSecondary }}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  if (customEnd < customStart) {
                    setCustomEnd(customStart);
                  }
                  setPeriod("custom");
                  setShowCustomModal(false);
                }}
                className="flex-1 py-3 rounded-xl items-center"
                style={{ backgroundColor: COLORS.primary }}
              >
                <Text className="text-white text-sm font-bold">Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ─── Summary Card ─────────────────────────────────────────────────────────────

function SummaryCard({
  label,
  amount,
  color,
  icon,
}: {
  label: string;
  amount: number;
  color: string;
  icon: string;
}) {
  return (
    <View
      className="rounded-2xl p-3 mb-4"
      style={{
        backgroundColor: COLORS.surface,
        width: (SCREEN_WIDTH - 48) / 2,
        ...SHADOWS.sm,
      }}
    >
      <View className="flex-row items-center mb-2">
        <View
          className="w-8 h-8 rounded-xl items-center justify-center mr-2"
          style={{ backgroundColor: color + "20" }}
        >
          <MaterialCommunityIcons name={icon as any} size={16} color={color} />
        </View>
        <Text className="text-xs font-semibold" style={{ color: COLORS.textSecondary }}>
          {label}
        </Text>
      </View>
      <Text
        className="text-base font-bold"
        style={{ color: COLORS.textPrimary }}
        numberOfLines={1}
      >
        ₹{Math.abs(amount).toLocaleString("en-IN")}
      </Text>
      {label === "Savings" && amount < 0 && (
        <Text className="text-xs mt-0.5" style={{ color: COLORS.expense }}>
          Over budget
        </Text>
      )}
    </View>
  );
}

// ─── Donut Chart ──────────────────────────────────────────────────────────────

function DonutChart({ categories }: { categories: CategorySummary[] }) {
  const total = categories.reduce((sum, c) => sum + c.total, 0);
  const top5 = categories.slice(0, 5);

  return (
    <View>
      {/* Simple donut using SVG-like approach with segments */}
      <View className="items-center mb-4">
        <View
          className="w-40 h-40 rounded-full items-center justify-center"
          style={{ backgroundColor: COLORS.gray100 }}
        >
          {/* Center text */}
          <Text className="text-xs" style={{ color: COLORS.textMuted }}>Total</Text>
          <Text
            className="text-base font-bold"
            style={{ color: COLORS.textPrimary }}
            numberOfLines={1}
          >
            ₹{total.toLocaleString("en-IN")}
          </Text>
        </View>
      </View>

      {/* Legend */}
      {top5.map((cat) => (
        <View
          key={cat.categoryId}
          className="flex-row items-center mb-2"
        >
          <View
            className="w-3 h-3 rounded-full mr-2"
            style={{ backgroundColor: cat.categoryColor }}
          />
          <Text
            className="flex-1 text-sm"
            style={{ color: COLORS.textPrimary }}
          >
            {cat.categoryName}
          </Text>
          <Text className="text-sm font-bold" style={{ color: COLORS.textPrimary }}>
            {cat.percentage.toFixed(1)}%
          </Text>
        </View>
      ))}
    </View>
  );
}

// ─── Horizontal Bar Chart ─────────────────────────────────────────────────────

function HorizontalBarChart({ categories }: { categories: CategorySummary[] }) {
  const top5 = categories.slice(0, 5);

  return (
    <View>
      {top5.map((cat) => (
        <View key={cat.categoryId} className="mb-3">
          <View className="flex-row items-center justify-between mb-1">
            <View className="flex-row items-center gap-2">
              <View
                className="w-6 h-6 rounded-lg items-center justify-center"
                style={{ backgroundColor: cat.categoryColor + "20" }}
              >
                <MaterialCommunityIcons
                  name={cat.categoryIcon as any}
                  size={12}
                  color={cat.categoryColor}
                />
              </View>
              <Text
                className="text-sm font-semibold"
                style={{ color: COLORS.textPrimary }}
              >
                {cat.categoryName}
              </Text>
            </View>
            <Text className="text-sm font-bold" style={{ color: COLORS.textPrimary }}>
              ₹{cat.total.toLocaleString("en-IN")}
            </Text>
          </View>
          <View
            className="h-2 rounded-full overflow-hidden"
            style={{ backgroundColor: COLORS.gray200 }}
          >
            <View
              className="h-full rounded-full"
              style={{
                width: `${cat.percentage}%`,
                backgroundColor: cat.categoryColor,
              }}
            />
          </View>
          <Text
            className="text-xs mt-0.5 text-right"
            style={{ color: COLORS.textMuted }}
          >
            {cat.percentage.toFixed(1)}%
          </Text>
        </View>
      ))}
    </View>
  );
}