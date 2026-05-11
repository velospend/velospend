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
import DateTimePicker from "@react-native-community/datetimepicker";
import { COLORS, SHADOWS } from "../../constants";
import {
  getInvestmentById,
  getInvestmentTransactions,
  createInvestmentTransaction,
  deleteInvestmentTransaction,
  updateInvestmentValue,
} from "../../database/queries/investments";
import { getAccountsByUser } from "../../database/queries/accounts";
import { useUserStore } from "../../store/useUserStore";
import { Investment, InvestmentTransaction, MoreStackParamList } from "../../types";
import ModalSelector, { ModalOption } from "../../components/common/ModalSelector";

type DetailNavProp = StackNavigationProp<MoreStackParamList, "InvestmentDetailScreen">;
type DetailRouteProp = RouteProp<MoreStackParamList, "InvestmentDetailScreen">;

export default function InvestmentDetailScreen() {
  const navigation = useNavigation<DetailNavProp>();
  const route = useRoute<DetailRouteProp>();
  const { investmentId } = route.params;
  const { user } = useUserStore();

  const [investment, setInvestment] = useState<Investment | null>(null);
  const [transactions, setTransactions] = useState<InvestmentTransaction[]>([]);
  const [accountOptions, setAccountOptions] = useState<ModalOption[]>([]);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showUpdateValue, setShowUpdateValue] = useState(false);

  // form state
  const [amount, setAmount] = useState("");
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [selectedAccountName, setSelectedAccountName] = useState("");
  const [dateTime, setDateTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [txnNote, setTxnNote] = useState("");
  const [newCurrentValue, setNewCurrentValue] = useState("");
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(() => {
    if (!user) return;
    const inv = getInvestmentById(investmentId);
    if (!inv) return;
    setInvestment(inv);
    setNewCurrentValue(inv.currentValue.toString());

    const txns = getInvestmentTransactions(investmentId);
    setTransactions(txns);

    const accounts = getAccountsByUser(user.id);
    setAccountOptions(
      accounts.map((a) => ({
        id: a.id,
        label: a.name,
        subtitle: `₹${a.currentBalance.toLocaleString("en-IN")}`,
        icon: "bank",
        color: COLORS.primary,
      }))
    );
  }, [investmentId, user]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const returns = (investment?.currentValue || 0) - (investment?.totalInvested || 0);
  const returnsPercent = (investment?.totalInvested || 0) > 0
    ? ((returns / investment!.totalInvested) * 100).toFixed(2)
    : "0.00";
  const isPositive = returns >= 0;

  const resetForm = () => {
    setAmount("");
    setSelectedAccountId("");
    setSelectedAccountName("");
    setDateTime(new Date());
    setTxnNote("");
  };

  const handleSaveTransaction = () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid amount.");
      return;
    }
    if (!selectedAccountName) {
      Alert.alert("No Account", "Please select an account.");
      return;
    }

    try {
      setSaving(true);
      createInvestmentTransaction({
        investmentId,
        amount: parseFloat(amount),
        dateTime: dateTime.toISOString(),
        accountName: selectedAccountName,
        note: txnNote.trim() || undefined,
      });
      resetForm();
      setShowAddTransaction(false);
      loadData();
    } catch (error) {
      Alert.alert("Error", "Could not save transaction.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateValue = () => {
    if (!newCurrentValue || parseFloat(newCurrentValue) < 0) {
      Alert.alert("Invalid Value", "Please enter a valid current value.");
      return;
    }
    updateInvestmentValue(investmentId, parseFloat(newCurrentValue));
    setShowUpdateValue(false);
    loadData();
  };

  const handleDeleteTransaction = (txn: InvestmentTransaction) => {
    Alert.alert(
      "Delete Transaction",
      "Are you sure you want to delete this transaction?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteInvestmentTransaction(txn.id, investmentId, txn.amount);
            loadData();
          },
        },
      ]
    );
  };

  if (!investment) return null;

  return (
    <View className="flex-1" style={{ backgroundColor: COLORS.background }}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.investment} />

      {/* Header */}
      <View
        className="px-5 pt-14 pb-5"
        style={{ backgroundColor: COLORS.investment }}
      >
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
          >
            <MaterialCommunityIcons name="arrow-left" size={22} color="white" />
          </TouchableOpacity>
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={() => setShowUpdateValue(true)}
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
            >
              <MaterialCommunityIcons name="pencil" size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowAddTransaction(true)}
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
            >
              <MaterialCommunityIcons name="plus" size={22} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Investment Info */}
        <View className="mt-3">
          <Text className="text-white text-2xl font-bold">
            {investment.investmentName}
          </Text>
          <Text className="text-white text-xs opacity-70 mt-1 capitalize">
            {investment.type} ·{" "}
            {investment.recurringType === "recurring"
              ? `${investment.recurrencePeriod} recurring`
              : "one-time"}
          </Text>
        </View>

        {/* Stats */}
        <View className="flex-row mt-4 gap-3">
          <StatCard
            label="Invested"
            value={`₹${investment.totalInvested.toLocaleString("en-IN")}`}
          />
          <StatCard
            label="Current Value"
            value={`₹${investment.currentValue.toLocaleString("en-IN")}`}
          />
          <StatCard
            label="Returns"
            value={`${isPositive ? "+" : ""}${returnsPercent}%`}
            valueColor={isPositive ? "#2ECC71" : "#E74C3C"}
          />
        </View>
      </View>

      {/* Transactions */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      >
        <Text
          className="text-sm font-bold mb-3"
          style={{ color: COLORS.textSecondary }}
        >
          Transaction History
        </Text>

        {transactions.length === 0 ? (
          <View className="items-center py-12">
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
              Tap + to add your first investment transaction
            </Text>
          </View>
        ) : (
          <View
            className="rounded-2xl overflow-hidden"
            style={{ backgroundColor: COLORS.surface, ...SHADOWS.sm }}
          >
            {transactions.map((txn, index) => (
              <TouchableOpacity
                key={txn.id}
                onLongPress={() => handleDeleteTransaction(txn)}
                className="flex-row items-center px-4 py-3"
                style={{
                  borderBottomWidth: index < transactions.length - 1 ? 1 : 0,
                  borderBottomColor: COLORS.border,
                }}
              >
                <View
                  className="w-10 h-10 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: COLORS.investment + "20" }}
                >
                  <MaterialCommunityIcons
                    name="trending-up"
                    size={20}
                    color={COLORS.investment}
                  />
                </View>
                <View className="flex-1">
                  <Text
                    className="text-sm font-semibold"
                    style={{ color: COLORS.textPrimary }}
                  >
                    {txn.accountName}
                  </Text>
                  <Text
                    className="text-xs mt-0.5"
                    style={{ color: COLORS.textMuted }}
                  >
                    {new Date(txn.dateTime).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                    {txn.note ? ` · ${txn.note}` : ""}
                  </Text>
                </View>
                <Text
                  className="text-sm font-bold"
                  style={{ color: COLORS.investment }}
                >
                  ₹{txn.amount.toLocaleString("en-IN")}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {transactions.length > 0 && (
          <Text
            className="text-xs text-center mt-3"
            style={{ color: COLORS.textMuted }}
          >
            Long press a transaction to delete it
          </Text>
        )}
      </ScrollView>

      {/* Add Transaction Modal */}
      <Modal
        visible={showAddTransaction}
        animationType="slide"
        transparent
        onRequestClose={() => { setShowAddTransaction(false); resetForm(); }}
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
              Add Transaction
            </Text>

            {/* Amount */}
            <View
              className="flex-row items-center rounded-xl px-3 mb-3"
              style={{ backgroundColor: COLORS.gray100, borderWidth: 1, borderColor: COLORS.border }}
            >
              <Text className="text-xl font-bold mr-1" style={{ color: COLORS.investment }}>₹</Text>
              <TextInput
                value={amount}
                onChangeText={setAmount}
                placeholder="Amount invested"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="decimal-pad"
                className="flex-1 py-3 px-2 text-base"
                style={{ color: COLORS.textPrimary }}
              />
            </View>

            {/* Account */}
            <TouchableOpacity
              onPress={() => setShowAccountModal(true)}
              className="flex-row items-center rounded-xl px-3 py-3 mb-3"
              style={{
                backgroundColor: COLORS.gray100,
                borderWidth: 1,
                borderColor: selectedAccountId ? COLORS.investment : COLORS.border,
              }}
            >
              <MaterialCommunityIcons name="bank-outline" size={20} color={COLORS.gray400} />
              <Text
                className="flex-1 text-sm ml-2 font-semibold"
                style={{ color: selectedAccountId ? COLORS.textPrimary : COLORS.textMuted }}
              >
                {selectedAccountName || "Select account..."}
              </Text>
              <MaterialCommunityIcons name="chevron-down" size={20} color={COLORS.gray400} />
            </TouchableOpacity>

            {/* Date */}
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              className="flex-row items-center rounded-xl px-3 py-3 mb-3"
              style={{ backgroundColor: COLORS.gray100, borderWidth: 1, borderColor: COLORS.border }}
            >
              <MaterialCommunityIcons name="calendar" size={20} color={COLORS.investment} />
              <Text className="text-sm ml-2 font-semibold" style={{ color: COLORS.textPrimary }}>
                {dateTime.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={dateTime}
                mode="date"
                display="default"
                onChange={(_, date) => { setShowDatePicker(false); if (date) setDateTime(date); }}
              />
            )}

            {/* Note */}
            <View
              className="flex-row items-center rounded-xl px-3 mb-4"
              style={{ backgroundColor: COLORS.gray100, borderWidth: 1, borderColor: COLORS.border }}
            >
              <MaterialCommunityIcons name="note-outline" size={20} color={COLORS.gray400} />
              <TextInput
                value={txnNote}
                onChangeText={setTxnNote}
                placeholder="Note (optional)"
                placeholderTextColor={COLORS.textMuted}
                className="flex-1 py-3 px-2 text-sm"
                style={{ color: COLORS.textPrimary }}
              />
            </View>

            {/* Buttons */}
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => { setShowAddTransaction(false); resetForm(); }}
                className="flex-1 py-3 rounded-xl items-center"
                style={{ backgroundColor: COLORS.gray100, borderWidth: 1, borderColor: COLORS.border }}
              >
                <Text className="text-sm font-bold" style={{ color: COLORS.textSecondary }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveTransaction}
                disabled={saving}
                className="flex-1 py-3 rounded-xl items-center"
                style={{ backgroundColor: COLORS.investment }}
              >
                <Text className="text-white text-sm font-bold">
                  {saving ? "Saving..." : "Add"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Update Current Value Modal */}
      <Modal
        visible={showUpdateValue}
        animationType="slide"
        transparent
        onRequestClose={() => setShowUpdateValue(false)}
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

            <Text className="text-lg font-bold mb-2" style={{ color: COLORS.textPrimary }}>
              Update Current Value
            </Text>
            <Text className="text-sm mb-4" style={{ color: COLORS.textMuted }}>
              Enter the current market value of this investment
            </Text>

            <View
              className="flex-row items-center rounded-xl px-3 mb-4"
              style={{ backgroundColor: COLORS.gray100, borderWidth: 1, borderColor: COLORS.border }}
            >
              <Text className="text-xl font-bold mr-1" style={{ color: COLORS.investment }}>₹</Text>
              <TextInput
                value={newCurrentValue}
                onChangeText={setNewCurrentValue}
                keyboardType="decimal-pad"
                className="flex-1 py-3 px-2 text-base"
                style={{ color: COLORS.textPrimary }}
              />
            </View>

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setShowUpdateValue(false)}
                className="flex-1 py-3 rounded-xl items-center"
                style={{ backgroundColor: COLORS.gray100, borderWidth: 1, borderColor: COLORS.border }}
              >
                <Text className="text-sm font-bold" style={{ color: COLORS.textSecondary }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleUpdateValue}
                className="flex-1 py-3 rounded-xl items-center"
                style={{ backgroundColor: COLORS.investment }}
              >
                <Text className="text-white text-sm font-bold">Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Account Selector */}
      <ModalSelector
        visible={showAccountModal}
        title="Select Account"
        options={accountOptions}
        selectedId={selectedAccountId}
        onSelect={(opt) => {
          setSelectedAccountId(opt.id);
          setSelectedAccountName(opt.label);
        }}
        onClose={() => setShowAccountModal(false)}
      />
    </View>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <View
      className="flex-1 rounded-xl p-3"
      style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
    >
      <Text className="text-white text-xs opacity-70">{label}</Text>
      <Text
        className="text-sm font-bold mt-1"
        style={{ color: valueColor || "white" }}
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );
}