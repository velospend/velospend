import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StatusBar,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { COLORS, SHADOWS } from "../../constants";
import { getTransactionById, updateTransaction, getPreviousNotes, createTransaction } from "../../database/queries/transactions";
import { getCategoriesByUser } from "../../database/queries/categories";
import { getAccountsByUser } from "../../database/queries/accounts";
import { getPlannersByUser } from "../../database/queries/planners";
import { useUserStore } from "../../store/useUserStore";
import { TransactionType, Account, Category, Planner } from "../../types";
import ModalSelector, { ModalOption } from "../../components/common/ModalSelector";
import NoteInput from "../../components/common/NoteInput";
import { getDatabase } from "../../database/db";
import uuid from "react-native-uuid";
import { useRoute, RouteProp } from "@react-navigation/native";

const TRANSACTION_TYPES: {
  value: TransactionType;
  label: string;
  color: string;
  icon: string;
}[] = [
  { value: "expense", label: "Expense", color: COLORS.expense, icon: "arrow-up-circle" },
  { value: "income", label: "Income", color: COLORS.income, icon: "arrow-down-circle" },
  { value: "investment", label: "Investment", color: COLORS.investment, icon: "trending-up" },
  { value: "self_transfer", label: "Transfer", color: COLORS.transfer, icon: "swap-horizontal" },
];

export default function AddTransactionScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const transactionId = (route.params as any)?.transactionId;
  const isEditing = !!transactionId;
  const { user, loadAccounts } = useUserStore();

  // ─── Type ──────────────────────────────────────────────────────────────────
  const [type, setType] = useState<TransactionType>("expense");

  // ─── Date & Time ───────────────────────────────────────────────────────────
  const [dateTime, setDateTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // ─── Amount ────────────────────────────────────────────────────────────────
  const [amount, setAmount] = useState("");

  // ─── Account ───────────────────────────────────────────────────────────────
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [selectedToAccount, setSelectedToAccount] = useState<Account | null>(null);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showToAccountModal, setShowToAccountModal] = useState(false);

  // ─── Category ──────────────────────────────────────────────────────────────
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  // ─── Planner ───────────────────────────────────────────────────────────────
  const [planners, setPlanners] = useState<Planner[]>([]);
  const [selectedPlanner, setSelectedPlanner] = useState<Planner | null>(null);
  const [showPlannerModal, setShowPlannerModal] = useState(false);

  // ─── Note & Description ────────────────────────────────────────────────────
  const [note, setNote] = useState("");
  const [description, setDescription] = useState("");
  const [previousNotes, setPreviousNotes] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);

  // ─── Active theme color based on type ─────────────────────────────────────
  const activeColor = TRANSACTION_TYPES.find((t) => t.value === type)?.color || COLORS.primary;

  useEffect(() => {
    if (!user) return;
    setAccounts(getAccountsByUser(user.id));
    setPreviousNotes(getPreviousNotes(user.id));
    setPlanners(getPlannersByUser(user.id));
  }, [user]);

  useEffect(() => {
    // reload categories when type changes
    if (!user) return;
    if (type === "self_transfer") return;
    const catType = type === "investment" ? "investment" : type === "income" ? "income" : "expense";
    setCategories(getCategoriesByUser(user.id, catType));
    if (!isEditing) {
    setSelectedCategory(null);
    setSelectedPlanner(null);
  }
  }, [type, user]);

  // pre-fill data if editing
useEffect(() => {
  if (!isEditing || !user) return;

  const txn = getTransactionById(transactionId);
  if (!txn) return;

  setType(txn.type);
  setAmount(txn.amount.toString());
  setDateTime(new Date(txn.dateTime));
  setNote(txn.note || "");
  setDescription(txn.description || "");

  // set account
  const allAccounts = getAccountsByUser(user.id);
  const acc = allAccounts.find((a) => a.id === txn.accountId);
  if (acc) setSelectedAccount(acc);

  // set to account for transfer
  if (txn.toAccountId) {
    const toAcc = allAccounts.find((a) => a.id === txn.toAccountId);
    if (toAcc) setSelectedToAccount(toAcc);
  }

  // set category
  const catType = txn.type === "investment" ? "investment" : txn.type === "income" ? "income" : "expense";
  const allCategories = getCategoriesByUser(user.id, catType);
  setCategories(allCategories);
  const cat = allCategories.find((c) => c.id === txn.categoryId);
  if (cat) setSelectedCategory(cat);

  // set planner
  const allPlanners = getPlannersByUser(user.id);
  setPlanners(allPlanners);
  const planner = allPlanners.find((p) => p.id === txn.plannerId);
  if (planner) setSelectedPlanner(planner);

}, [isEditing, transactionId, user]);

  // ─── Modal Options ─────────────────────────────────────────────────────────

  const accountOptions: ModalOption[] = accounts.map((acc) => ({
    id: acc.id,
    label: acc.name,
    subtitle: `₹${acc.currentBalance.toLocaleString("en-IN")} · ${acc.type.replace("_", " ")}`,
    icon: "bank",
    color: COLORS.primary,
  }));

  const categoryOptions: ModalOption[] = categories.map((cat) => ({
    id: cat.id,
    label: cat.name,
    icon: cat.icon,
    color: cat.color,
  }));

  const plannerOptions: ModalOption[] = planners.map((p) => ({
    id: p.id,
    label: p.title,
    subtitle: `${p.type} · ₹${p.totalPlanned.toLocaleString("en-IN")}`,
    icon: "clipboard-list",
    color: COLORS.primary,
  }));

  // ─── Auto add category to planner if not exists ────────────────────────────

  const ensurePlannerRecord = (plannerId: string, categoryId: string) => {
    const db = getDatabase();
    const existing = db.getFirstSync<any>(
      `SELECT id FROM planner_records WHERE planner_id = ? AND category_id = ?`,
      [plannerId, categoryId]
    );
    if (!existing) {
      const now = new Date().toISOString();
      db.runSync(
        `INSERT INTO planner_records (id, planner_id, category_id, planned_amount, created_at)
         VALUES (?, ?, ?, 0, ?)`,
        [uuid.v4() as string, plannerId, categoryId, now]
      );
    }
  };

  // ─── Save ──────────────────────────────────────────────────────────────────

  const handleSave = () => {
  if (!amount || parseFloat(amount) <= 0) {
    Alert.alert("Invalid Amount", "Please enter a valid amount.");
    return;
  }
  if (!selectedAccount) {
    Alert.alert("No Account", "Please select an account.");
    return;
  }
  if (type === "self_transfer" && !selectedToAccount) {
    Alert.alert("No Destination", "Please select a destination account.");
    return;
  }
  if (type !== "self_transfer" && !selectedCategory) {
    Alert.alert("No Category", "Please select a category.");
    return;
  }
  if (type === "self_transfer" && selectedAccount.id === selectedToAccount?.id) {
    Alert.alert("Same Account", "From and To accounts cannot be the same.");
    return;
  }

  try {
    setLoading(true);

    if (isEditing) {
      updateTransaction(transactionId, {
        type,
        accountId: selectedAccount.id,
        toAccountId: selectedToAccount?.id,
        categoryId: selectedCategory?.id || "",
        plannerId: selectedPlanner?.id,
        amount: parseFloat(amount),
        dateTime: dateTime.toISOString(),
        note: note.trim() || undefined,
        description: description.trim() || undefined,
        isArchived: false,
        userId: user!.id,
      });
    } else {
      if (selectedPlanner && selectedCategory) {
        ensurePlannerRecord(selectedPlanner.id, selectedCategory.id);
      }
      createTransaction({
        userId: user!.id,
        type,
        accountId: selectedAccount.id,
        toAccountId: selectedToAccount?.id,
        categoryId: selectedCategory?.id || "",
        plannerId: selectedPlanner?.id,
        amount: parseFloat(amount),
        dateTime: dateTime.toISOString(),
        note: note.trim() || undefined,
        description: description.trim() || undefined,
        isArchived: false,
      });
    }

    loadAccounts();
    navigation.goBack();
  } catch (error) {
    Alert.alert("Error", "Could not save transaction. Please try again.");
  } finally {
    setLoading(false);
  }
};

  return (
    <KeyboardAvoidingView
      className="flex-1"
      style={{ backgroundColor: COLORS.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar barStyle="light-content" backgroundColor={activeColor} />

      {/* Header */}
      <View
        className="px-5 pt-14 pb-5"
        style={{ backgroundColor: activeColor }}
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
            <Text className="text-white text-xl font-bold">
  {isEditing ? "Edit Transaction" : "Add Transaction"}
</Text>
          </View>
        </View>

        {/* Type Selector */}
        <View className="flex-row gap-1" style={{ marginTop: 6 }}>
          {TRANSACTION_TYPES.map((t) => {
            const isSelected = type === t.value;
            return (
              <TouchableOpacity
                key={t.value}
                onPress={() => setType(t.value)}
                className="flex-1 py-2 rounded-xl items-center"
                style={{
                  backgroundColor: isSelected
                    ? "rgba(255,255,255,0.3)"
                    : "rgba(255,255,255,0.1)",
                  borderWidth: isSelected ? 1.5 : 0,
                  borderColor: "rgba(255,255,255,0.8)",
                }}
              >
                <MaterialCommunityIcons
                  name={t.icon as any}
                  size={18}
                  color="white"
                />
                <Text className="text-white text-xs font-semibold mt-0.5">
                  {t.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 60 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Date & Time */}
        <SectionCard title="Date & Time">
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              className="flex-1 flex-row items-center rounded-xl px-3 py-3"
              style={{
                backgroundColor: COLORS.gray100,
                borderWidth: 1,
                borderColor: COLORS.border,
              }}
            >
              <MaterialCommunityIcons
                name="calendar"
                size={18}
                color={activeColor}
              />
              <Text
                className="text-sm ml-2 font-semibold"
                style={{ color: COLORS.textPrimary }}
              >
                {dateTime.toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowTimePicker(true)}
              className="flex-1 flex-row items-center rounded-xl px-3 py-3"
              style={{
                backgroundColor: COLORS.gray100,
                borderWidth: 1,
                borderColor: COLORS.border,
              }}
            >
              <MaterialCommunityIcons
                name="clock-outline"
                size={18}
                color={activeColor}
              />
              <Text
                className="text-sm ml-2 font-semibold"
                style={{ color: COLORS.textPrimary }}
              >
                {dateTime.toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={dateTime}
              mode="date"
              display="default"
              maximumDate={new Date()}
              onChange={(_, selected) => {
                setShowDatePicker(false);
                if (selected) {
                  const updated = new Date(dateTime);
                  updated.setFullYear(selected.getFullYear(), selected.getMonth(), selected.getDate());
                  setDateTime(updated);
                }
              }}
            />
          )}

          {showTimePicker && (
            <DateTimePicker
              value={dateTime}
              mode="time"
              display="default"
              onChange={(_, selected) => {
                setShowTimePicker(false);
                if (selected) {
                  const updated = new Date(dateTime);
                  updated.setHours(selected.getHours(), selected.getMinutes());
                  setDateTime(updated);
                }
              }}
            />
          )}
        </SectionCard>

        {/* Amount */}
        <SectionCard title="Amount">
          <View
            className="flex-row items-center rounded-xl px-3"
            style={{
              backgroundColor: COLORS.gray100,
              borderWidth: 1,
              borderColor: COLORS.border,
            }}
          >
            <Text
              className="text-xl font-bold mr-1"
              style={{ color: activeColor }}
            >
              ₹
            </Text>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="decimal-pad"
              className="flex-1 py-3 px-2 text-xl font-bold"
              style={{ color: COLORS.textPrimary }}
            />
          </View>
        </SectionCard>

        {/* From Account */}
        <SectionCard title={type === "self_transfer" ? "From Account" : "Account"}>
          <TouchableOpacity
            onPress={() => setShowAccountModal(true)}
            className="flex-row items-center rounded-xl px-3 py-3"
            style={{
              backgroundColor: COLORS.gray100,
              borderWidth: 1,
              borderColor: selectedAccount ? activeColor : COLORS.border,
            }}
          >
            <MaterialCommunityIcons
              name="bank-outline"
              size={20}
              color={selectedAccount ? activeColor : COLORS.gray400}
            />
            <Text
              className="flex-1 text-sm ml-2 font-semibold"
              style={{
                color: selectedAccount ? COLORS.textPrimary : COLORS.textMuted,
              }}
            >
              {selectedAccount ? selectedAccount.name : "Select account..."}
            </Text>
            <MaterialCommunityIcons
              name="chevron-down"
              size={20}
              color={COLORS.gray400}
            />
          </TouchableOpacity>
        </SectionCard>

        {/* To Account — only for self transfer */}
        {type === "self_transfer" && (
          <SectionCard title="To Account">
            <TouchableOpacity
              onPress={() => setShowToAccountModal(true)}
              className="flex-row items-center rounded-xl px-3 py-3"
              style={{
                backgroundColor: COLORS.gray100,
                borderWidth: 1,
                borderColor: selectedToAccount ? activeColor : COLORS.border,
              }}
            >
              <MaterialCommunityIcons
                name="bank-outline"
                size={20}
                color={selectedToAccount ? activeColor : COLORS.gray400}
              />
              <Text
                className="flex-1 text-sm ml-2 font-semibold"
                style={{
                  color: selectedToAccount
                    ? COLORS.textPrimary
                    : COLORS.textMuted,
                }}
              >
                {selectedToAccount
                  ? selectedToAccount.name
                  : "Select account..."}
              </Text>
              <MaterialCommunityIcons
                name="chevron-down"
                size={20}
                color={COLORS.gray400}
              />
            </TouchableOpacity>
          </SectionCard>
        )}

        {/* Category — hidden for self transfer */}
        {type !== "self_transfer" && (
          <SectionCard title="Category">
            <TouchableOpacity
              onPress={() => setShowCategoryModal(true)}
              className="flex-row items-center rounded-xl px-3 py-3"
              style={{
                backgroundColor: COLORS.gray100,
                borderWidth: 1,
                borderColor: selectedCategory ? activeColor : COLORS.border,
              }}
            >
              {selectedCategory ? (
                <View
                  className="w-6 h-6 rounded-full items-center justify-center mr-2"
                  style={{ backgroundColor: selectedCategory.color + "30" }}
                >
                  <MaterialCommunityIcons
                    name={selectedCategory.icon as any}
                    size={14}
                    color={selectedCategory.color}
                  />
                </View>
              ) : (
                <MaterialCommunityIcons
                  name="tag-outline"
                  size={20}
                  color={COLORS.gray400}
                />
              )}
              <Text
                className="flex-1 text-sm ml-1 font-semibold"
                style={{
                  color: selectedCategory
                    ? COLORS.textPrimary
                    : COLORS.textMuted,
                }}
              >
                {selectedCategory ? selectedCategory.name : "Select category..."}
              </Text>
              <MaterialCommunityIcons
                name="chevron-down"
                size={20}
                color={COLORS.gray400}
              />
            </TouchableOpacity>
          </SectionCard>
        )}

        {/* Planner — only for expense and income */}
        {(type === "expense" || type === "income") && (
          <SectionCard title="Link to Planner (Optional)">
            <TouchableOpacity
              onPress={() => setShowPlannerModal(true)}
              className="flex-row items-center rounded-xl px-3 py-3"
              style={{
                backgroundColor: COLORS.gray100,
                borderWidth: 1,
                borderColor: selectedPlanner ? activeColor : COLORS.border,
              }}
            >
              <MaterialCommunityIcons
                name="clipboard-list-outline"
                size={20}
                color={selectedPlanner ? activeColor : COLORS.gray400}
              />
              <Text
                className="flex-1 text-sm ml-2 font-semibold"
                style={{
                  color: selectedPlanner
                    ? COLORS.textPrimary
                    : COLORS.textMuted,
                }}
              >
                {selectedPlanner ? selectedPlanner.title : "Select planner..."}
              </Text>
              <View className="flex-row items-center gap-2">
                {selectedPlanner && (
                  <TouchableOpacity
                    onPress={() => setSelectedPlanner(null)}
                  >
                    <MaterialCommunityIcons
                      name="close-circle"
                      size={18}
                      color={COLORS.gray400}
                    />
                  </TouchableOpacity>
                )}
                <MaterialCommunityIcons
                  name="chevron-down"
                  size={20}
                  color={COLORS.gray400}
                />
              </View>
            </TouchableOpacity>
          </SectionCard>
        )}

        {/* Note */}
        <SectionCard title="Note (Optional)">
          <NoteInput
            value={note}
            onChangeText={setNote}
            previousNotes={previousNotes}
          />
        </SectionCard>

        {/* Description */}
        <SectionCard title="Description (Optional)">
          <View
            className="rounded-xl px-3"
            style={{
              backgroundColor: COLORS.gray100,
              borderWidth: 1,
              borderColor: COLORS.border,
            }}
          >
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Add more details about this transaction..."
              placeholderTextColor={COLORS.textMuted}
              multiline
              numberOfLines={3}
              className="py-3 text-sm"
              style={{
                color: COLORS.textPrimary,
                textAlignVertical: "top",
                minHeight: 80,
              }}
            />
          </View>
        </SectionCard>

        {/* Save Button */}
        <TouchableOpacity
          onPress={handleSave}
          disabled={loading}
          className="mt-2 rounded-2xl py-4 items-center"
          style={{
            backgroundColor: loading ? COLORS.gray300 : activeColor,
            ...SHADOWS.md,
          }}
        >
          <Text className="text-white text-base font-bold">
  {loading ? "Saving..." : isEditing ? "Update Transaction" : "Save Transaction"}
</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modals */}
      <ModalSelector
        visible={showAccountModal}
        title="Select Account"
        options={accountOptions}
        selectedId={selectedAccount?.id}
        onSelect={(opt) => setSelectedAccount(accounts.find((a) => a.id === opt.id) || null)}
        onClose={() => setShowAccountModal(false)}
      />

      <ModalSelector
        visible={showToAccountModal}
        title="Select Destination Account"
        options={accountOptions.filter((a) => a.id !== selectedAccount?.id)}
        selectedId={selectedToAccount?.id}
        onSelect={(opt) => setSelectedToAccount(accounts.find((a) => a.id === opt.id) || null)}
        onClose={() => setShowToAccountModal(false)}
      />

      <ModalSelector
        visible={showCategoryModal}
        title="Select Category"
        options={categoryOptions}
        selectedId={selectedCategory?.id}
        onSelect={(opt) => setSelectedCategory(categories.find((c) => c.id === opt.id) || null)}
        onClose={() => setShowCategoryModal(false)}
      />

      <ModalSelector
        visible={showPlannerModal}
        title="Select Planner"
        options={plannerOptions}
        selectedId={selectedPlanner?.id}
        onSelect={(opt) => setSelectedPlanner(planners.find((p) => p.id === opt.id) || null)}
        onClose={() => setShowPlannerModal(false)}
      />
    </KeyboardAvoidingView>
  );
}

// ─── Section Card ─────────────────────────────────────────────────────────────

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View
      className="rounded-2xl p-4 mb-4"
      style={{ backgroundColor: COLORS.surface, ...SHADOWS.sm }}
    >
      <Text
        className="text-sm font-bold mb-3"
        style={{ color: COLORS.textSecondary }}
      >
        {title}
      </Text>
      {children}
    </View>
  );
}