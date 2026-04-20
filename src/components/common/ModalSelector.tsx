import { useState, useMemo } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  TextInput,
  StatusBar,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS, SHADOWS } from "../../constants";

export interface ModalOption {
  id: string;
  label: string;
  subtitle?: string;
  icon?: string;
  color?: string;
}

interface ModalSelectorProps {
  visible: boolean;
  title: string;
  options: ModalOption[];
  selectedId?: string;
  onSelect: (option: ModalOption) => void;
  onClose: () => void;
}

export default function ModalSelector({
  visible,
  title,
  options,
  selectedId,
  onSelect,
  onClose,
}: ModalSelectorProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return options;
    return options.filter((o) =>
      o.label.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, options]);

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
              {title}
            </Text>
            <TouchableOpacity onPress={onClose}>
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
                value={search}
                onChangeText={setSearch}
                placeholder={`Search ${title.toLowerCase()}...`}
                placeholderTextColor={COLORS.textMuted}
                className="flex-1 py-2.5 px-2 text-sm"
                style={{ color: COLORS.textPrimary }}
              />
              {search.length > 0 && (
                <TouchableOpacity onPress={() => setSearch("")}>
                  <MaterialCommunityIcons
                    name="close-circle"
                    size={18}
                    color={COLORS.gray400}
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Options List */}
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
            ListEmptyComponent={
              <View className="items-center py-10">
                <MaterialCommunityIcons
                  name="magnify-close"
                  size={40}
                  color={COLORS.gray300}
                />
                <Text
                  className="text-sm mt-2"
                  style={{ color: COLORS.textMuted }}
                >
                  No results found
                </Text>
              </View>
            }
            renderItem={({ item }) => {
              const isSelected = item.id === selectedId;
              return (
                <TouchableOpacity
                  onPress={() => {
                    onSelect(item);
                    setSearch("");
                    onClose();
                  }}
                  className="flex-row items-center py-3"
                  style={{
                    borderBottomWidth: 1,
                    borderBottomColor: COLORS.border,
                  }}
                >
                  {item.icon && (
                    <View
                      className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                      style={{
                        backgroundColor: (item.color || COLORS.primary) + "20",
                      }}
                    >
                      <MaterialCommunityIcons
                        name={item.icon as any}
                        size={20}
                        color={item.color || COLORS.primary}
                      />
                    </View>
                  )}
                  <View className="flex-1">
                    <Text
                      className="text-sm font-semibold"
                      style={{ color: COLORS.textPrimary }}
                    >
                      {item.label}
                    </Text>
                    {item.subtitle && (
                      <Text
                        className="text-xs mt-0.5"
                        style={{ color: COLORS.textMuted }}
                      >
                        {item.subtitle}
                      </Text>
                    )}
                  </View>
                  {isSelected && (
                    <MaterialCommunityIcons
                      name="check-circle"
                      size={20}
                      color={COLORS.primary}
                    />
                  )}
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </View>
    </Modal>
  );
}