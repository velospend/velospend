import { useState, useEffect } from "react";
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
import { useNavigation, useRoute } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS, SHADOWS, INVESTMENT_TYPES, RECURRENCE_PERIODS } from "../../constants";
import { useThemeStore } from "../../store/useThemeStore";
import { createInvestment, updateInvestment, getInvestmentById } from "../../database/queries/investments";
import { useUserStore } from "../../store/useUserStore";
import { InvestmentType, RecurringType, RecurrencePeriod } from "../../types";

export default function AddInvestmentScreen() {
  const navigation = useNavigation();
  const { colors: COLORS } = useThemeStore();
  const route = useRoute();
  const { user } = useUserStore();

  const investmentId = (route.params as any)?.investmentId;
  const isEditing = !!investmentId;

  const [investmentName, setInvestmentName] = useState("");
  const [type, setType] = useState<InvestmentType>("sip");
  const [currentValue, setCurrentValue] = useState("");
  const [recurringType, setRecurringType] = useState<RecurringType>("recurring");
  const [recurrencePeriod, setRecurrencePeriod] = useState<RecurrencePeriod>("monthly");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isEditing) return;
    const inv = getInvestmentById(investmentId);
    if (!inv) return;
    setInvestmentName(inv.investmentName);
    setType(inv.type);
    setCurrentValue(inv.currentValue.toString());
    setRecurringType(inv.recurringType);
    if (inv.recurrencePeriod) setRecurrencePeriod(inv.recurrencePeriod);
    setNote(inv.note || "");
  }, [investmentId]);

  const handleSave = () => {
    if (!investmentName.trim()) {
      Alert.alert("Missing Name", "Please enter an investment name.");
      return;
    }

    try {
      setLoading(true);
      if (isEditing) {
        updateInvestment(investmentId, {
          investmentName: investmentName.trim(),
          type,
          currentValue: parseFloat(currentValue) || 0,
          recurringType,
          recurrencePeriod: recurringType === "recurring" ? recurrencePeriod : undefined,
          note: note.trim() || undefined,
        });
      } else {
        createInvestment({
          userId: user!.id,
          investmentName: investmentName.trim(),
          type,
          totalInvested: 0,
          currentValue: parseFloat(currentValue) || 0,
          recurringType,
          recurrencePeriod: recurringType === "recurring" ? recurrencePeriod : undefined,
          note: note.trim() || undefined,
        });
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", "Could not save investment. Please try again.");
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
      <StatusBar barStyle="light-content" backgroundColor={COLORS.investment} />

      {/* Header */}
      <View
        className="px-5 pt-14 pb-5"
        style={{ backgroundColor: COLORS.investment }}
      >
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-10 h-10 rounded-full items-center justify-center mr-3"
            style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
          >
            <MaterialCommunityIcons name="arrow-left" size={22} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">
            {isEditing ? "Edit Investment" : "Add Investment"}
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Investment Name */}
        <SectionCard title="Investment Name">
          <View
            className="flex-row items-center rounded-xl px-3"
            style={{
              backgroundColor: COLORS.gray100,
              borderWidth: 1,
              borderColor: COLORS.border,
            }}
          >
            <MaterialCommunityIcons
              name="chart-line"
              size={20}
              color={COLORS.gray400}
            />
            <TextInput
              value={investmentName}
              onChangeText={setInvestmentName}
              placeholder="e.g. Axis Bluechip SIP"
              placeholderTextColor={COLORS.textMuted}
              className="flex-1 py-3 px-2 text-base"
              style={{ color: COLORS.textPrimary }}
            />
          </View>
        </SectionCard>

        {/* Investment Type */}
        <SectionCard title="Investment Type">
          <View className="flex-row flex-wrap gap-2">
            {INVESTMENT_TYPES.map((t) => {
              const isSelected = type === t.value;
              return (
                <TouchableOpacity
                  key={t.value}
                  onPress={() => setType(t.value as InvestmentType)}
                  className="px-3 py-2 rounded-xl"
                  style={{
                    backgroundColor: isSelected ? COLORS.investment : COLORS.gray100,
                    borderWidth: 1,
                    borderColor: isSelected ? COLORS.investment : COLORS.border,
                  }}
                >
                  <Text
                    className="text-sm font-semibold"
                    style={{ color: isSelected ? "white" : COLORS.textSecondary }}
                  >
                    {t.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </SectionCard>

        {/* Recurring Type */}
        <SectionCard title="Investment Frequency">
          <View className="flex-row gap-3">
            {[
              { label: "One-time", value: "one_time" },
              { label: "Recurring", value: "recurring" },
            ].map((t) => {
              const isSelected = recurringType === t.value;
              return (
                <TouchableOpacity
                  key={t.value}
                  onPress={() => setRecurringType(t.value as RecurringType)}
                  className="flex-1 py-3 rounded-xl items-center"
                  style={{
                    backgroundColor: isSelected ? COLORS.investment : COLORS.gray100,
                    borderWidth: 1,
                    borderColor: isSelected ? COLORS.investment : COLORS.border,
                  }}
                >
                  <Text
                    className="text-sm font-bold"
                    style={{ color: isSelected ? "white" : COLORS.textSecondary }}
                  >
                    {t.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Recurrence Period */}
          {recurringType === "recurring" && (
            <View className="flex-row flex-wrap gap-2 mt-3">
              {RECURRENCE_PERIODS.map((p) => {
                const isSelected = recurrencePeriod === p.value;
                return (
                  <TouchableOpacity
                    key={p.value}
                    onPress={() => setRecurrencePeriod(p.value as RecurrencePeriod)}
                    className="px-3 py-2 rounded-xl"
                    style={{
                      backgroundColor: isSelected ? COLORS.investment : COLORS.gray100,
                      borderWidth: 1,
                      borderColor: isSelected ? COLORS.investment : COLORS.border,
                    }}
                  >
                    <Text
                      className="text-sm font-semibold"
                      style={{ color: isSelected ? "white" : COLORS.textSecondary }}
                    >
                      {p.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </SectionCard>

        {/* Current Value */}
        <SectionCard title={isEditing ? "Current Market Value" : "Initial Value (Optional)"}>
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
              style={{ color: COLORS.investment }}
            >
              ₹
            </Text>
            <TextInput
              value={currentValue}
              onChangeText={setCurrentValue}
              placeholder="0.00"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="decimal-pad"
              className="flex-1 py-3 px-2 text-base"
              style={{ color: COLORS.textPrimary }}
            />
          </View>
          <Text
            className="text-xs mt-2 ml-1"
            style={{ color: COLORS.textMuted }}
          >
            {isEditing
              ? "Update the current market value to track returns"
              : "You can update this later as value changes"}
          </Text>
        </SectionCard>

        {/* Note */}
        <SectionCard title="Note (Optional)">
          <View
            className="flex-row items-center rounded-xl px-3"
            style={{
              backgroundColor: COLORS.gray100,
              borderWidth: 1,
              borderColor: COLORS.border,
            }}
          >
            <MaterialCommunityIcons
              name="note-text-outline"
              size={20}
              color={COLORS.gray400}
            />
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="Any notes about this investment"
              placeholderTextColor={COLORS.textMuted}
              className="flex-1 py-3 px-2 text-sm"
              style={{ color: COLORS.textPrimary }}
            />
          </View>
        </SectionCard>

        {/* Save Button */}
        <TouchableOpacity
          onPress={handleSave}
          disabled={loading}
          className="mt-2 rounded-2xl py-4 items-center"
          style={{
            backgroundColor: loading ? COLORS.gray300 : COLORS.investment,
            ...SHADOWS.md,
          }}
        >
          <Text className="text-white text-base font-bold">
            {loading ? "Saving..." : isEditing ? "Update Investment" : "Create Investment"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Section Card ─────────────────────────────────────────────────────────────

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
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