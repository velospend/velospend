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
import DateTimePicker from "@react-native-community/datetimepicker";
import { COLORS, SHADOWS } from "../../constants";
import { createPlanner, updatePlanner, getPlannerById } from "../../database/queries/planners";
import { useUserStore } from "../../store/useUserStore";
import { PlannerType } from "../../types";

const PLANNER_TYPES: { label: string; value: PlannerType; color: string; icon: string }[] = [
  { label: "Expense", value: "expense", color: COLORS.expense, icon: "arrow-up-circle" },
  { label: "Income", value: "income", color: COLORS.income, icon: "arrow-down-circle" },
];

export default function AddPlannerScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useUserStore();

  const plannerId = (route.params as any)?.plannerId;
  const isEditing = !!plannerId;

  const [title, setTitle] = useState("");
  const [type, setType] = useState<PlannerType>("expense");
  const [totalPlanned, setTotalPlanned] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return d;
  });
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const activeColor = PLANNER_TYPES.find((t) => t.value === type)?.color || COLORS.primary;

  useEffect(() => {
    if (!isEditing) return;
    const planner = getPlannerById(plannerId);
    if (!planner) return;
    setTitle(planner.title);
    setType(planner.type);
    setTotalPlanned(planner.totalPlanned.toString());
    setStartDate(new Date(planner.startDate));
    setEndDate(new Date(planner.endDate));
  }, [plannerId]);

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert("Missing Title", "Please enter a planner title.");
      return;
    }
    if (!totalPlanned || parseFloat(totalPlanned) <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid planned amount.");
      return;
    }
    if (endDate <= startDate) {
      Alert.alert("Invalid Dates", "End date must be after start date.");
      return;
    }

    try {
      setLoading(true);
      if (isEditing) {
        updatePlanner(plannerId, {
          title: title.trim(),
          type,
          totalPlanned: parseFloat(totalPlanned),
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        });
      } else {
        createPlanner({
          userId: user!.id,
          title: title.trim(),
          type,
          totalPlanned: parseFloat(totalPlanned),
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        });
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", "Could not save planner. Please try again.");
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
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-10 h-10 rounded-full items-center justify-center mr-3"
            style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
          >
            <MaterialCommunityIcons name="arrow-left" size={22} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">
            {isEditing ? "Edit Planner" : "Add Planner"}
          </Text>
        </View>

        {/* Type Selector */}
        <View className="flex-row mt-4 gap-3">
          {PLANNER_TYPES.map((t) => {
            const isSelected = type === t.value;
            return (
              <TouchableOpacity
                key={t.value}
                onPress={() => setType(t.value)}
                className="flex-1 flex-row items-center justify-center py-2.5 rounded-xl gap-2"
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
                <Text className="text-white text-sm font-bold">{t.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Title */}
        <SectionCard title="Planner Title">
          <View
            className="flex-row items-center rounded-xl px-3"
            style={{
              backgroundColor: COLORS.gray100,
              borderWidth: 1,
              borderColor: COLORS.border,
            }}
          >
            <MaterialCommunityIcons
              name="clipboard-text-outline"
              size={20}
              color={COLORS.gray400}
            />
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. January Gym Budget"
              placeholderTextColor={COLORS.textMuted}
              className="flex-1 py-3 px-2 text-base"
              style={{ color: COLORS.textPrimary }}
            />
          </View>
        </SectionCard>

        {/* Total Planned Amount */}
        <SectionCard title="Total Planned Amount">
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
              value={totalPlanned}
              onChangeText={setTotalPlanned}
              placeholder="0.00"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="decimal-pad"
              className="flex-1 py-3 px-2 text-xl font-bold"
              style={{ color: COLORS.textPrimary }}
            />
          </View>
        </SectionCard>

        {/* Date Range */}
        <SectionCard title="Date Range">
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => setShowStartPicker(true)}
              className="flex-1 flex-row items-center rounded-xl px-3 py-3"
              style={{
                backgroundColor: COLORS.gray100,
                borderWidth: 1,
                borderColor: COLORS.border,
              }}
            >
              <MaterialCommunityIcons
                name="calendar-start"
                size={18}
                color={activeColor}
              />
              <Text
                className="text-sm ml-2 font-semibold"
                style={{ color: COLORS.textPrimary }}
              >
                {startDate.toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowEndPicker(true)}
              className="flex-1 flex-row items-center rounded-xl px-3 py-3"
              style={{
                backgroundColor: COLORS.gray100,
                borderWidth: 1,
                borderColor: COLORS.border,
              }}
            >
              <MaterialCommunityIcons
                name="calendar-end"
                size={18}
                color={activeColor}
              />
              <Text
                className="text-sm ml-2 font-semibold"
                style={{ color: COLORS.textPrimary }}
              >
                {endDate.toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </Text>
            </TouchableOpacity>
          </View>

          {showStartPicker && (
            <DateTimePicker
              value={startDate}
              mode="date"
              display="default"
              onChange={(_, date) => {
                setShowStartPicker(false);
                if (date) setStartDate(date);
              }}
            />
          )}
          {showEndPicker && (
            <DateTimePicker
              value={endDate}
              mode="date"
              display="default"
              onChange={(_, date) => {
                setShowEndPicker(false);
                if (date) setEndDate(date);
              }}
            />
          )}
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
            {loading ? "Saving..." : isEditing ? "Update Planner" : "Create Planner"}
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