import { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SectionList,
  StatusBar,
  Alert,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS, SHADOWS } from "../../constants";
import { getPlannersByUser, deletePlanner, getUsedAmountForRecord, getPlannerRecords } from "../../database/queries/planners";
import { useUserStore } from "../../store/useUserStore";
import { Planner, PlannerStackParamList } from "../../types";

type PlannersNavProp = StackNavigationProp<PlannerStackParamList, "PlannersScreen">;

export default function PlannersScreen() {
  const navigation = useNavigation<PlannersNavProp>();
  const { user } = useUserStore();
  const [sections, setSections] = useState<{ title: string; data: Planner[] }[]>([]);

  const loadPlanners = useCallback(() => {
    if (!user) return;
    const all = getPlannersByUser(user.id);
    const now = new Date();

    const active = all.filter((p) => new Date(p.endDate) >= now);
    const expired = all.filter((p) => new Date(p.endDate) < now);

    setSections([
      ...(active.length > 0 ? [{ title: "Active", data: active }] : []),
      ...(expired.length > 0 ? [{ title: "Expired", data: expired }] : []),
    ]);
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadPlanners();
    }, [loadPlanners])
  );

  const handleDelete = (planner: Planner) => {
    Alert.alert(
      "Delete Planner",
      `Are you sure you want to delete "${planner.title}"? All records will be deleted too.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deletePlanner(planner.id);
            loadPlanners();
          },
        },
      ]
    );
  };

  const getPlannerProgress = (planner: Planner) => {
    const records = getPlannerRecords(planner.id);
    const totalUsed = records.reduce((sum, record) => {
      return sum + getUsedAmountForRecord(planner.id, record.categoryId);
    }, 0);
    return { totalUsed, totalPlanned: planner.totalPlanned };
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
          <Text className="text-white text-2xl font-bold">Planners</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("AddPlannerScreen")}
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
          >
            <MaterialCommunityIcons name="plus" size={22} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {sections.length === 0 ? (
        <EmptyPlanners onAdd={() => navigation.navigate("AddPlannerScreen")} />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
          renderSectionHeader={({ section }) => (
            <View className="flex-row items-center mb-3 mt-2">
              <View
                className="px-3 py-1 rounded-full mr-2"
                style={{
                  backgroundColor:
                    section.title === "Active"
                      ? COLORS.income + "20"
                      : COLORS.gray300,
                }}
              >
                <Text
                  className="text-xs font-bold"
                  style={{
                    color:
                      section.title === "Active"
                        ? COLORS.income
                        : COLORS.gray600,
                  }}
                >
                  {section.title}
                </Text>
              </View>
              <View
                className="flex-1 h-px"
                style={{ backgroundColor: COLORS.border }}
              />
              <Text
                className="text-xs ml-2"
                style={{ color: COLORS.textMuted }}
              >
                {section.data.length} planner{section.data.length > 1 ? "s" : ""}
              </Text>
            </View>
          )}
          renderSectionFooter={() => <View style={{ height: 12 }} />}
          renderItem={({ item }) => {
            const { totalUsed, totalPlanned } = getPlannerProgress(item);
            const percent = totalPlanned > 0
              ? Math.min((totalUsed / totalPlanned) * 100, 100)
              : 0;
            const isExpired = new Date(item.endDate) < new Date();

            return (
              <PlannerCard
                planner={item}
                totalUsed={totalUsed}
                totalPlanned={totalPlanned}
                percent={percent}
                isExpired={isExpired}
                onPress={() => navigation.navigate("PlannerDetailScreen", { plannerId: item.id })}
                onEdit={() => navigation.navigate("EditPlannerScreen", { plannerId: item.id })}
                onDelete={() => handleDelete(item)}
              />
            );
          }}
        />
      )}
    </View>
  );
}

// ─── Planner Card ─────────────────────────────────────────────────────────────

function PlannerCard({
  planner,
  totalUsed,
  totalPlanned,
  percent,
  isExpired,
  onPress,
  onEdit,
  onDelete,
}: {
  planner: Planner;
  totalUsed: number;
  totalPlanned: number;
  percent: number;
  isExpired: boolean;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const typeColor = planner.type === "expense" ? COLORS.expense : COLORS.income;
  const progressColor = percent >= 100
    ? COLORS.error
    : percent >= 80
    ? COLORS.warning
    : COLORS.income;

  return (
    <TouchableOpacity
      onPress={onPress}
      className="rounded-2xl p-4 mb-3"
      style={{
        backgroundColor: COLORS.surface,
        ...SHADOWS.sm,
        opacity: isExpired ? 0.7 : 1,
      }}
    >
      {/* Top Row */}
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-1 mr-3">
          <Text
            className="text-base font-bold"
            style={{ color: COLORS.textPrimary }}
            numberOfLines={1}
          >
            {planner.title}
          </Text>
          <View className="flex-row items-center mt-1 gap-2">
            <View
              className="px-2 py-0.5 rounded-full"
              style={{ backgroundColor: typeColor + "20" }}
            >
              <Text
                className="text-xs font-semibold capitalize"
                style={{ color: typeColor }}
              >
                {planner.type}
              </Text>
            </View>
            <Text className="text-xs" style={{ color: COLORS.textMuted }}>
              {new Date(planner.startDate).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
              })}
              {" → "}
              {new Date(planner.endDate).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </Text>
          </View>
        </View>
        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={onEdit}
            className="w-7 h-7 rounded-full items-center justify-center"
            style={{ backgroundColor: COLORS.primary + "20" }}
          >
            <MaterialCommunityIcons name="pencil" size={14} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onDelete}
            className="w-7 h-7 rounded-full items-center justify-center"
            style={{ backgroundColor: COLORS.error + "20" }}
          >
            <MaterialCommunityIcons name="trash-can" size={14} color={COLORS.error} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Amount Row */}
      <View className="flex-row justify-between mb-2">
        <Text className="text-xs" style={{ color: COLORS.textMuted }}>
          {planner.type === "expense" ? "Spent" : "Earned"}:{" "}
          <Text className="font-bold" style={{ color: COLORS.textPrimary }}>
            ₹{totalUsed.toLocaleString("en-IN")}
          </Text>
        </Text>
        <Text className="text-xs" style={{ color: COLORS.textMuted }}>
          Planned:{" "}
          <Text className="font-bold" style={{ color: COLORS.textPrimary }}>
            ₹{totalPlanned.toLocaleString("en-IN")}
          </Text>
        </Text>
      </View>

      {/* Progress Bar */}
      <View
        className="h-2 rounded-full overflow-hidden"
        style={{ backgroundColor: COLORS.gray200 }}
      >
        <View
          className="h-full rounded-full"
          style={{
            width: `${percent}%`,
            backgroundColor: progressColor,
          }}
        />
      </View>
      <Text
        className="text-xs mt-1 text-right font-semibold"
        style={{ color: progressColor }}
      >
        {percent.toFixed(1)}% {planner.type === "expense" ? "used" : "achieved"}
      </Text>
    </TouchableOpacity>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyPlanners({ onAdd }: { onAdd: () => void }) {
  return (
    <View className="flex-1 items-center justify-center px-8">
      <MaterialCommunityIcons
        name="clipboard-list"
        size={64}
        color={COLORS.gray300}
      />
      <Text
        className="text-lg font-bold mt-4"
        style={{ color: COLORS.textSecondary }}
      >
        No Planners Yet
      </Text>
      <Text
        className="text-sm text-center mt-2 mb-6"
        style={{ color: COLORS.textMuted }}
      >
        Create a budget planner to track your spending and income goals
      </Text>
      <TouchableOpacity
        onPress={onAdd}
        className="px-6 py-3 rounded-2xl"
        style={{ backgroundColor: COLORS.primary }}
      >
        <Text className="text-white font-bold">Create Planner</Text>
      </TouchableOpacity>
    </View>
  );
}