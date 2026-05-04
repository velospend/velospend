import { useCallback } from "react";
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
import { useState } from "react";
import { COLORS, SHADOWS } from "../../constants";
import { getCategoriesByUser, deleteCategory } from "../../database/queries/categories";
import { useUserStore } from "../../store/useUserStore";
import { Category, HomeStackParamList } from "../../types";

type CategoriesNavProp = StackNavigationProp<HomeStackParamList, "CategoriesScreen">;

export default function CategoriesScreen() {
  const navigation = useNavigation<CategoriesNavProp>();
  const { user } = useUserStore();
  const [sections, setSections] = useState<{ title: string; data: Category[] }[]>([]);

  const loadCategories = useCallback(() => {
    if (!user) return;
    const all = getCategoriesByUser(user.id);

    const expense = all.filter((c) => c.type === "expense");
    const income = all.filter((c) => c.type === "income");
    const investment = all.filter((c) => c.type === "investment");

    setSections([
      { title: "Expense", data: expense },
      { title: "Income", data: income },
      { title: "Investment", data: investment },
    ]);
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadCategories();
    }, [loadCategories])
  );

  const handleDelete = (category: Category) => {
    if (category.isDefault) {
      Alert.alert("Cannot Delete", "Default categories cannot be deleted.");
      return;
    }
    Alert.alert(
      "Delete Category",
      `Are you sure you want to delete "${category.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteCategory(category.id);
            loadCategories();
          },
        },
      ]
    );
  };

  const TYPE_COLORS: Record<string, string> = {
    Expense: COLORS.expense,
    Income: COLORS.income,
    Investment: COLORS.investment,
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
              <MaterialCommunityIcons name="arrow-left" size={22} color="white" />
            </TouchableOpacity>
            <Text className="text-white text-xl font-bold">Categories</Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate("AddCategoryScreen")}
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
          >
            <MaterialCommunityIcons name="plus" size={22} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
        renderSectionHeader={({ section }) => (
          <View className="flex-row items-center mb-2 mt-2">
            <View
              className="px-3 py-1 rounded-full mr-2"
              style={{ backgroundColor: TYPE_COLORS[section.title] + "20" }}
            >
              <Text
                className="text-xs font-bold"
                style={{ color: TYPE_COLORS[section.title] }}
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
              {section.data.length} categories
            </Text>
          </View>
        )}
        renderSectionFooter={() => <View style={{ height: 12 }} />}
        renderItem={({ item, index, section }) => (
          <CategoryItem
            category={item}
            isLast={index === section.data.length - 1}
            onEdit={() =>
              navigation.navigate("EditCategoryScreen", { categoryId: item.id })
            }
            onDelete={() => handleDelete(item)}
          />
        )}
      />
    </View>
  );
}

// ─── Category Item ────────────────────────────────────────────────────────────

function CategoryItem({
  category,
  isLast,
  onEdit,
  onDelete,
}: {
  category: Category;
  isLast: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <View
      style={{
        backgroundColor: COLORS.surface,
        ...(!isLast
          ? { borderBottomWidth: 1, borderBottomColor: COLORS.border }
          : {}),
        ...(isLast ? { borderBottomLeftRadius: 16, borderBottomRightRadius: 16 } : {}),
        ...(!isLast ? {} : {}),
      }}
    >
      <View
        className="flex-row items-center px-4 py-3"
        style={{
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          ...SHADOWS.sm,
        }}
      >
        <View
          className="w-10 h-10 rounded-xl items-center justify-center mr-3"
          style={{ backgroundColor: category.color + "20" }}
        >
          <MaterialCommunityIcons
            name={category.icon as any}
            size={20}
            color={category.color}
          />
        </View>
        <View className="flex-1">
          <Text
            className="text-sm font-semibold"
            style={{ color: COLORS.textPrimary }}
          >
            {category.name}
          </Text>
          {category.isDefault && (
            <Text className="text-xs" style={{ color: COLORS.textMuted }}>
              Default
            </Text>
          )}
        </View>
        <View className="flex-row gap-2">
          {!category.isDefault && (
            <View className="flex-row gap-2">
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
          )}
        </View>
      </View>
    </View>
  );
}