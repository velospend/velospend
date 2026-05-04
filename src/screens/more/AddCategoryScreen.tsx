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
  FlatList,
  Modal,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS, SHADOWS, CATEGORY_ICONS, CATEGORY_COLORS } from "../../constants";
import { createCategory, updateCategory } from "../../database/queries/categories";
import { useUserStore } from "../../store/useUserStore";
import { CategoryType } from "../../types";
import { getDatabase } from "../../database/db";

const CATEGORY_TYPES: { label: string; value: CategoryType; color: string }[] = [
  { label: "Expense", value: "expense", color: COLORS.expense },
  { label: "Income", value: "income", color: COLORS.income },
  { label: "Investment", value: "investment", color: COLORS.investment },
];

export default function AddCategoryScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useUserStore();

  const categoryId = (route.params as any)?.categoryId;
  const isEditing = !!categoryId;

  const [name, setName] = useState("");
  const [selectedType, setSelectedType] = useState<CategoryType>("expense");
  const [selectedIcon, setSelectedIcon] = useState("dots-horizontal");
  const [selectedColor, setSelectedColor] = useState<string>(COLORS.primary);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [iconSearch, setIconSearch] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isEditing) return;
    try {
      const db = getDatabase();
      const row = db.getFirstSync<any>(
        `SELECT * FROM categories WHERE id = ?`,
        [categoryId]
      );
      if (row) {
        setName(row.name);
        setSelectedType(row.type);
        setSelectedIcon(row.icon);
        setSelectedColor(row.color);
      }
    } catch (error) {
      Alert.alert("Error", "Could not load category details.");
    }
  }, [categoryId]);

  const filteredIcons = iconSearch.trim()
    ? CATEGORY_ICONS.filter((i) =>
        i.label.toLowerCase().includes(iconSearch.toLowerCase()) ||
        i.name.toLowerCase().includes(iconSearch.toLowerCase())
      )
    : CATEGORY_ICONS;

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert("Missing Name", "Please enter a category name.");
      return;
    }

    try {
      setLoading(true);
      if (isEditing) {
        updateCategory(categoryId, {
          name: name.trim(),
          icon: selectedIcon,
          color: selectedColor,
        });
      } else {
        createCategory({
          userId: user!.id,
          name: name.trim(),
          type: selectedType,
          icon: selectedIcon,
          color: selectedColor,
          isDefault: false,
        });
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", "Could not save category. Please try again.");
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
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* Header */}
      <View
        className="px-5 pt-14 pb-5"
        style={{ backgroundColor: COLORS.primary }}
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
            {isEditing ? "Edit Category" : "Add Category"}
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Preview */}
        <View
          className="items-center py-6 rounded-2xl mb-4"
          style={{ backgroundColor: COLORS.surface, ...SHADOWS.sm }}
        >
          <View
            className="w-16 h-16 rounded-2xl items-center justify-center mb-2"
            style={{ backgroundColor: selectedColor + "20" }}
          >
            <MaterialCommunityIcons
              name={selectedIcon as any}
              size={32}
              color={selectedColor}
            />
          </View>
          <Text
            className="text-base font-bold"
            style={{ color: COLORS.textPrimary }}
          >
            {name || "Category Name"}
          </Text>
        </View>

        {/* Name */}
        <SectionCard title="Category Name">
          <View
            className="flex-row items-center rounded-xl px-3"
            style={{
              backgroundColor: COLORS.gray100,
              borderWidth: 1,
              borderColor: COLORS.border,
            }}
          >
            <MaterialCommunityIcons
              name="tag-outline"
              size={20}
              color={COLORS.gray400}
            />
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. Groceries"
              placeholderTextColor={COLORS.textMuted}
              className="flex-1 py-3 px-2 text-base"
              style={{ color: COLORS.textPrimary }}
            />
          </View>
        </SectionCard>

        {/* Type — only for new categories */}
        {!isEditing && (
          <SectionCard title="Type">
            <View className="flex-row gap-2">
              {CATEGORY_TYPES.map((t) => {
                const isSelected = selectedType === t.value;
                return (
                  <TouchableOpacity
                    key={t.value}
                    onPress={() => setSelectedType(t.value)}
                    className="flex-1 py-2.5 rounded-xl items-center"
                    style={{
                      backgroundColor: isSelected ? t.color : COLORS.gray100,
                      borderWidth: 1,
                      borderColor: isSelected ? t.color : COLORS.border,
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
          </SectionCard>
        )}

        {/* Icon Picker */}
        <SectionCard title="Icon">
          <TouchableOpacity
            onPress={() => setShowIconPicker(true)}
            className="flex-row items-center rounded-xl px-3 py-3"
            style={{
              backgroundColor: COLORS.gray100,
              borderWidth: 1,
              borderColor: COLORS.border,
            }}
          >
            <View
              className="w-8 h-8 rounded-lg items-center justify-center mr-3"
              style={{ backgroundColor: selectedColor + "20" }}
            >
              <MaterialCommunityIcons
                name={selectedIcon as any}
                size={18}
                color={selectedColor}
              />
            </View>
            <Text
              className="flex-1 text-sm font-semibold"
              style={{ color: COLORS.textPrimary }}
            >
              {CATEGORY_ICONS.find((i) => i.name === selectedIcon)?.label || selectedIcon}
            </Text>
            <MaterialCommunityIcons
              name="chevron-down"
              size={20}
              color={COLORS.gray400}
            />
          </TouchableOpacity>
        </SectionCard>

        {/* Color Picker */}
        <SectionCard title="Color">
          <View className="flex-row flex-wrap gap-3">
            {CATEGORY_COLORS.map((color) => {
              const isSelected = selectedColor === color;
              return (
                <TouchableOpacity
                  key={color}
                  onPress={() => setSelectedColor(color)}
                  className="w-9 h-9 rounded-full items-center justify-center"
                  style={{
                    backgroundColor: color,
                    borderWidth: isSelected ? 3 : 0,
                    borderColor: "white",
                    shadowColor: color,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: isSelected ? 0.6 : 0,
                    shadowRadius: 4,
                    elevation: isSelected ? 4 : 0,
                  }}
                >
                  {isSelected && (
                    <MaterialCommunityIcons name="check" size={16} color="white" />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </SectionCard>

        {/* Save Button */}
        <TouchableOpacity
          onPress={handleSave}
          disabled={loading}
          className="mt-2 rounded-2xl py-4 items-center"
          style={{
            backgroundColor: loading ? COLORS.gray300 : COLORS.primary,
            ...SHADOWS.md,
          }}
        >
          <Text className="text-white text-base font-bold">
            {loading ? "Saving..." : isEditing ? "Update Category" : "Save Category"}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Icon Picker Modal */}
      <Modal
        visible={showIconPicker}
        animationType="slide"
        transparent
        onRequestClose={() => setShowIconPicker(false)}
      >
        <View
          className="flex-1 justify-end"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <View
            className="rounded-t-3xl"
            style={{ backgroundColor: COLORS.surface, maxHeight: "75%" }}
          >
            {/* Handle */}
            <View className="items-center pt-3 pb-1">
              <View
                className="w-10 h-1 rounded-full"
                style={{ backgroundColor: COLORS.gray300 }}
              />
            </View>

            {/* Header */}
            <View className="flex-row items-center justify-between px-5 py-3">
              <Text
                className="text-lg font-bold"
                style={{ color: COLORS.textPrimary }}
              >
                Pick an Icon
              </Text>
              <TouchableOpacity onPress={() => setShowIconPicker(false)}>
                <MaterialCommunityIcons
                  name="close"
                  size={24}
                  color={COLORS.gray400}
                />
              </TouchableOpacity>
            </View>

            {/* Search */}
            <View className="px-5 mb-3">
              <View
                className="flex-row items-center rounded-xl px-3"
                style={{
                  backgroundColor: COLORS.gray100,
                  borderWidth: 1,
                  borderColor: COLORS.border,
                }}
              >
                <MaterialCommunityIcons
                  name="magnify"
                  size={20}
                  color={COLORS.gray400}
                />
                <TextInput
                  value={iconSearch}
                  onChangeText={setIconSearch}
                  placeholder="Search icons..."
                  placeholderTextColor={COLORS.textMuted}
                  className="flex-1 py-2.5 px-2 text-sm"
                  style={{ color: COLORS.textPrimary }}
                />
              </View>
            </View>

            {/* Icon Grid */}
            <FlatList
              data={filteredIcons}
              keyExtractor={(item) => item.name}
              numColumns={5}
              contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const isSelected = selectedIcon === item.name;
                return (
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedIcon(item.name);
                      setShowIconPicker(false);
                      setIconSearch("");
                    }}
                    className="flex-1 items-center py-3 m-1 rounded-xl"
                    style={{
                      backgroundColor: isSelected
                        ? selectedColor + "20"
                        : COLORS.gray100,
                      borderWidth: isSelected ? 1.5 : 0,
                      borderColor: selectedColor,
                    }}
                  >
                    <MaterialCommunityIcons
                      name={item.name as any}
                      size={24}
                      color={isSelected ? selectedColor : COLORS.gray500}
                    />
                    <Text
                      className="text-xs mt-1 text-center"
                      style={{
                        color: isSelected ? selectedColor : COLORS.textMuted,
                      }}
                      numberOfLines={1}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>
      </Modal>
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