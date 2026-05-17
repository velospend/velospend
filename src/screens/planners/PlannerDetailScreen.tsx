import { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import { useNavigation, useRoute, RouteProp, useFocusEffect } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS, SHADOWS } from "../../constants";
import { useThemeStore } from "../../store/useThemeStore";
import {
  getPlannerById,
  getPlannerRecords,
  getUsedAmountForRecord,
  createPlannerRecord,
  updatePlannerRecord,
  deletePlannerRecord,
} from "../../database/queries/planners";
import { getTransactionsByPlanner } from "../../database/queries/transactions";
import { getCategoriesByUser } from "../../database/queries/categories";
import { useUserStore } from "../../store/useUserStore";
import { Planner, PlannerRecord, PlannerStackParamList } from "../../types";
import ModalSelector, { ModalOption } from "../../components/common/ModalSelector";
import uuid from "react-native-uuid";

type DetailNavProp = StackNavigationProp<PlannerStackParamList, "PlannerDetailScreen">;
type DetailRouteProp = RouteProp<PlannerStackParamList, "PlannerDetailScreen">;

interface RecordWithMeta extends PlannerRecord {
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  usedAmount: number;
}

export default function PlannerDetailScreen() {
  const navigation = useNavigation<DetailNavProp>();
  const route = useRoute<DetailRouteProp>();
  const { plannerId } = route.params;
  const { user } = useUserStore();
  const { colors: COLORS } = useThemeStore();

  const [planner, setPlanner] = useState<Planner | null>(null);
  const [records, setRecords] = useState<RecordWithMeta[]>([]);
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState<ModalOption[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [plannedAmount, setPlannedAmount] = useState("");
  const [recordNote, setRecordNote] = useState("");
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [savingRecord, setSavingRecord] = useState(false);

  const loadData = useCallback(() => {
  if (!user) return;
  const p = getPlannerById(plannerId);
  if (!p) return;
  setPlanner(p);

  // load ALL categories not just filtered by type
  const allCategories = getCategoriesByUser(user.id);

  setCategoryOptions(
    allCategories
      .filter((c) => c.type === (p.type === "expense" ? "expense" : "income"))
      .map((c) => ({
        id: c.id,
        label: c.name,
        icon: c.icon,
        color: c.color,
      }))
  );

  const rawRecords = getPlannerRecords(plannerId);
  const enriched: RecordWithMeta[] = rawRecords.map((r) => {
    // search in ALL categories so nothing shows as Unknown
    const cat = allCategories.find((c) => c.id === r.categoryId);
    const usedAmount = getUsedAmountForRecord(plannerId, r.categoryId, p.type);
    return {
      ...r,
      categoryName: cat?.name || "Unknown",
      categoryIcon: cat?.icon || "tag",
      categoryColor: cat?.color || COLORS.primary,
      usedAmount,
    };
  });
  setRecords(enriched);
}, [plannerId, user]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const totalUsed = records.reduce((sum, r) => sum + r.usedAmount, 0);
  const totalPlanned = planner?.totalPlanned || 0;
  const overallPercent = totalPlanned > 0
    ? Math.min((totalUsed / totalPlanned) * 100, 100)
    : 0;
  const progressColor = overallPercent >= 100
    ? COLORS.error
    : overallPercent >= 80
    ? COLORS.warning
    : COLORS.income;
  const typeColor = planner?.type === "expense" ? COLORS.expense : COLORS.income;

  const resetForm = () => {
    setSelectedCategoryId("");
    setPlannedAmount("");
    setRecordNote("");
    setEditingRecordId(null);
  };

  const handleSaveRecord = () => {
    if (!selectedCategoryId) {
      Alert.alert("No Category", "Please select a category.");
      return;
    }
    if (!plannedAmount || parseFloat(plannedAmount) <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid amount.");
      return;
    }

    try {
      setSavingRecord(true);
      if (editingRecordId) {
        updatePlannerRecord(editingRecordId, {
          plannedAmount: parseFloat(plannedAmount),
          note: recordNote.trim() || undefined,
        });
      } else {
        const existing = records.find((r) => r.categoryId === selectedCategoryId);
        if (existing) {
          Alert.alert("Already Exists", "This category already has a record in this planner.");
          return;
        }
        createPlannerRecord({
          plannerId,
          categoryId: selectedCategoryId,
          plannedAmount: parseFloat(plannedAmount),
          note: recordNote.trim() || undefined,
        });
      }
      resetForm();
      setShowAddRecord(false);
      loadData();
    } catch (error) {
      Alert.alert("Error", "Could not save record.");
    } finally {
      setSavingRecord(false);
    }
  };

  const handleEditRecord = (record: RecordWithMeta) => {
    setEditingRecordId(record.id);
    setSelectedCategoryId(record.categoryId);
    setPlannedAmount(record.plannedAmount.toString());
    setRecordNote(record.note || "");
    setShowAddRecord(true);
  };

  const handleDeleteRecord = (record: RecordWithMeta) => {
    Alert.alert(
      "Delete Record",
      `Delete "${record.categoryName}" record from this planner?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deletePlannerRecord(record.id);
            loadData();
          },
        },
      ]
    );
  };

  if (!planner) return null;

  return (
    <View className="flex-1" style={{ backgroundColor: COLORS.background }}>
      <StatusBar barStyle="light-content" backgroundColor={typeColor} />

      {/* Header */}
      <View
        className="px-5 pt-14 pb-5"
        style={{ backgroundColor: typeColor }}
      >
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
          >
            <MaterialCommunityIcons name="arrow-left" size={22} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowAddRecord(true)}
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
          >
            <MaterialCommunityIcons name="plus" size={22} color="white" />
          </TouchableOpacity>
        </View>

        {/* Planner Info */}
        <View className="mt-3">
          <Text className="text-white text-2xl font-bold">{planner.title}</Text>
          <Text className="text-white text-xs opacity-70 mt-1">
            {new Date(planner.startDate).toLocaleDateString("en-IN", {
              day: "numeric", month: "short",
            })}
            {" → "}
            {new Date(planner.endDate).toLocaleDateString("en-IN", {
              day: "numeric", month: "short", year: "numeric",
            })}
          </Text>
        </View>

        {/* Overall Progress */}
        <View
          className="mt-4 p-4 rounded-2xl"
          style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
        >
          <View className="flex-row justify-between mb-2">
            <Text className="text-white text-sm opacity-80">
              {planner.type === "expense" ? "Total Spent" : "Total Earned"}
            </Text>
            <Text className="text-white text-sm opacity-80">
              Planned: ₹{totalPlanned.toLocaleString("en-IN")}
            </Text>
          </View>
          <Text className="text-white text-3xl font-bold mb-2">
            ₹{totalUsed.toLocaleString("en-IN")}
          </Text>
          <View
            className="h-2 rounded-full overflow-hidden"
            style={{ backgroundColor: "rgba(255,255,255,0.3)" }}
          >
            <View
              className="h-full rounded-full"
              style={{
                width: `${overallPercent}%`,
                backgroundColor: "white",
              }}
            />
          </View>
          <Text className="text-white text-xs opacity-80 mt-1 text-right">
            {overallPercent.toFixed(1)}% {planner.type === "expense" ? "used" : "achieved"}
          </Text>
        </View>
      </View>

      {/* Records List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      >
        {records.length === 0 ? (
          <View className="items-center py-16">
            <MaterialCommunityIcons
              name="clipboard-list-outline"
              size={56}
              color={COLORS.gray300}
            />
            <Text
              className="text-base font-semibold mt-4"
              style={{ color: COLORS.textSecondary }}
            >
              No categories added yet
            </Text>
            <Text
              className="text-sm text-center mt-1"
              style={{ color: COLORS.textMuted }}
            >
              Tap the + button to add category budgets
            </Text>
          </View>
        ) : (
          records.map((record) => (
            <PlannerRecordCard
              key={record.id}
              record={record}
              plannerType={planner.type}
              onEdit={() => handleEditRecord(record)}
              onDelete={() => handleDeleteRecord(record)}
              onViewTransactions={() =>
  navigation.navigate("PlannerTransactionsScreen", {
    plannerId,
    categoryId: record.categoryId,
    categoryName: record.categoryName,
    plannerTitle: planner.title,
  })
}
colors={COLORS}
            />
          ))
        )}
      </ScrollView>

      {/* Add/Edit Record Modal */}
      <Modal
        visible={showAddRecord}
        animationType="slide"
        transparent
        onRequestClose={() => {
          setShowAddRecord(false);
          resetForm();
        }}
      >
        <View
          className="flex-1 justify-end"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <View
            className="rounded-t-3xl p-5"
            style={{ backgroundColor: COLORS.surface }}
          >
            {/* Handle */}
            <View className="items-center mb-4">
              <View
                className="w-10 h-1 rounded-full"
                style={{ backgroundColor: COLORS.gray300 }}
              />
            </View>

            <Text
              className="text-lg font-bold mb-4"
              style={{ color: COLORS.textPrimary }}
            >
              {editingRecordId ? "Edit Budget Record" : "Add Budget Record"}
            </Text>

            {/* Category */}
            {!editingRecordId && (
              <TouchableOpacity
                onPress={() => setShowCategoryModal(true)}
                className="flex-row items-center rounded-xl px-3 py-3 mb-3"
                style={{
                  backgroundColor: COLORS.gray100,
                  borderWidth: 1,
                  borderColor: selectedCategoryId ? typeColor : COLORS.border,
                }}
              >
                <MaterialCommunityIcons
                  name="tag-outline"
                  size={20}
                  color={selectedCategoryId ? typeColor : COLORS.gray400}
                />
                <Text
                  className="flex-1 text-sm ml-2 font-semibold"
                  style={{
                    color: selectedCategoryId ? COLORS.textPrimary : COLORS.textMuted,
                  }}
                >
                  {selectedCategoryId
                    ? categoryOptions.find((c) => c.id === selectedCategoryId)?.label
                    : "Select category..."}
                </Text>
                <MaterialCommunityIcons
                  name="chevron-down"
                  size={20}
                  color={COLORS.gray400}
                />
              </TouchableOpacity>
            )}

            {/* Planned Amount */}
            <View
              className="flex-row items-center rounded-xl px-3 mb-3"
              style={{
                backgroundColor: COLORS.gray100,
                borderWidth: 1,
                borderColor: COLORS.border,
              }}
            >
              <Text
                className="text-xl font-bold mr-1"
                style={{ color: typeColor }}
              >
                ₹
              </Text>
              <TextInput
                value={plannedAmount}
                onChangeText={setPlannedAmount}
                placeholder="Planned amount"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="decimal-pad"
                className="flex-1 py-3 px-2 text-base"
                style={{ color: COLORS.textPrimary }}
              />
            </View>

            {/* Note */}
            <View
              className="flex-row items-center rounded-xl px-3 mb-4"
              style={{
                backgroundColor: COLORS.gray100,
                borderWidth: 1,
                borderColor: COLORS.border,
              }}
            >
              <MaterialCommunityIcons
                name="note-outline"
                size={20}
                color={COLORS.gray400}
              />
              <TextInput
                value={recordNote}
                onChangeText={setRecordNote}
                placeholder="Note (optional)"
                placeholderTextColor={COLORS.textMuted}
                className="flex-1 py-3 px-2 text-sm"
                style={{ color: COLORS.textPrimary }}
              />
            </View>

            {/* Buttons */}
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => {
                  setShowAddRecord(false);
                  resetForm();
                }}
                className="flex-1 py-3 rounded-xl items-center"
                style={{
                  backgroundColor: COLORS.gray100,
                  borderWidth: 1,
                  borderColor: COLORS.border,
                }}
              >
                <Text
                  className="text-sm font-bold"
                  style={{ color: COLORS.textSecondary }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveRecord}
                disabled={savingRecord}
                className="flex-1 py-3 rounded-xl items-center"
                style={{ backgroundColor: typeColor }}
              >
                <Text className="text-white text-sm font-bold">
                  {savingRecord ? "Saving..." : editingRecordId ? "Update" : "Add"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Category Selector Modal */}
      <ModalSelector
        visible={showCategoryModal}
        title="Select Category"
        options={categoryOptions}
        selectedId={selectedCategoryId}
        onSelect={(opt) => setSelectedCategoryId(opt.id)}
        onClose={() => setShowCategoryModal(false)}
      />
    </View>
  );
}

// ─── Planner Record Card ──────────────────────────────────────────────────────

function PlannerRecordCard({
  record,
  plannerType,
  onEdit,
  onDelete,
  onViewTransactions,
  colors
}: {
  record: RecordWithMeta;
  plannerType: string;
  onEdit: () => void;
  onDelete: () => void;
  onViewTransactions: () => void;
  colors: any;
}) {
  const percent = record.plannedAmount > 0
    ? Math.min((record.usedAmount / record.plannedAmount) * 100, 100)
    : 0;
  const progressColor = percent >= 100
    ? colors.error
    : percent >= 80
    ? colors.warning
    : colors.income;
  const remaining = record.plannedAmount - record.usedAmount;

  return (
    <TouchableOpacity
      onPress={onViewTransactions}
      className="rounded-2xl p-4 mb-3"
      style={{ backgroundColor: colors.surface, ...SHADOWS.sm }}
    >
      {/* Top Row */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center flex-1">
          <View
            className="w-10 h-10 rounded-xl items-center justify-center mr-3"
            style={{ backgroundColor: record.categoryColor + "20" }}
          >
            <MaterialCommunityIcons
              name={record.categoryIcon as any}
              size={20}
              color={record.categoryColor}
            />
          </View>
          <View className="flex-1">
            <Text
              className="text-sm font-bold"
              style={{ color: colors.textPrimary }}
            >
              {record.categoryName}
            </Text>
            {record.note && (
              <Text
                className="text-xs mt-0.5"
                style={{ color: colors.textMuted }}
                numberOfLines={1}
              >
                {record.note}
              </Text>
            )}
          </View>
        </View>
        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={onEdit}
            className="w-7 h-7 rounded-full items-center justify-center"
            style={{ backgroundColor: colors.primary + "20" }}
          >
            <MaterialCommunityIcons name="pencil" size={14} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onDelete}
            className="w-7 h-7 rounded-full items-center justify-center"
            style={{ backgroundColor: colors.error + "20" }}
          >
            <MaterialCommunityIcons name="trash-can" size={14} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Amount Row */}
      <View className="flex-row justify-between mb-2">
        <Text className="text-xs" style={{ color: colors.textMuted }}>
          {plannerType === "expense" ? "Spent" : "Earned"}:{" "}
          <Text className="font-bold" style={{ color: colors.textPrimary }}>
            ₹{record.usedAmount.toLocaleString("en-IN")}
          </Text>
        </Text>
        <Text className="text-xs" style={{ color: colors.textMuted }}>
          Planned:{" "}
          <Text className="font-bold" style={{ color: colors.textPrimary }}>
            ₹{record.plannedAmount.toLocaleString("en-IN")}
          </Text>
        </Text>
      </View>

      {/* Progress Bar */}
      <View
        className="h-1.5 rounded-full overflow-hidden mb-1"
        style={{ backgroundColor: colors.gray200 }}
      >
        <View
          className="h-full rounded-full"
          style={{ width: `${percent}%`, backgroundColor: progressColor }}
        />
      </View>

      {/* Bottom Row */}
      <View className="flex-row justify-between">
        <Text className="text-xs font-semibold" style={{ color: progressColor }}>
          {percent.toFixed(1)}%
        </Text>
        <Text className="text-xs" style={{ color: remaining >= 0 ? colors.income : colors.expense }}>
          {remaining >= 0
            ? `₹${remaining.toLocaleString("en-IN")} remaining`
            : `₹${Math.abs(remaining).toLocaleString("en-IN")} over budget`}
        </Text>
      </View>
    </TouchableOpacity>
  );
}