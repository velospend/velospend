import { useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS } from "../../constants";

interface NoteInputProps {
  value: string;
  onChangeText: (text: string) => void;
  previousNotes: string[];
}

export default function NoteInput({
  value,
  onChangeText,
  previousNotes,
}: NoteInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const suggestions = useMemo(() => {
    if (!value.trim() || !isFocused) return [];
    return previousNotes
      .filter((note) =>
        note.toLowerCase().includes(value.toLowerCase()) &&
        note.toLowerCase() !== value.toLowerCase()
      )
      .slice(0, 5);
  }, [value, isFocused, previousNotes]);

  return (
    <View>
      <View
        className="flex-row items-center rounded-xl px-3"
        style={{
          backgroundColor: COLORS.gray100,
          borderWidth: 1,
          borderColor: isFocused ? COLORS.primary : COLORS.border,
        }}
      >
        <MaterialCommunityIcons
          name="note-text-outline"
          size={20}
          color={COLORS.gray400}
        />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 150)}
          placeholder="Short note (e.g. Grocery run)"
          placeholderTextColor={COLORS.textMuted}
          className="flex-1 py-3 px-2 text-sm"
          style={{ color: COLORS.textPrimary }}
        />
        {value.length > 0 && (
          <TouchableOpacity onPress={() => onChangeText("")}>
            <MaterialCommunityIcons
              name="close-circle"
              size={18}
              color={COLORS.gray400}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <View
          className="rounded-xl mt-1 overflow-hidden"
          style={{
            backgroundColor: COLORS.surface,
            borderWidth: 1,
            borderColor: COLORS.border,
          }}
        >
          {suggestions.map((note, index) => (
            <TouchableOpacity
              key={note}
              onPress={() => {
                onChangeText(note);
                setIsFocused(false);
              }}
              className="flex-row items-center px-3 py-2.5"
              style={{
                borderBottomWidth: index < suggestions.length - 1 ? 1 : 0,
                borderBottomColor: COLORS.border,
              }}
            >
              <MaterialCommunityIcons
                name="history"
                size={16}
                color={COLORS.gray400}
              />
              <Text
                className="text-sm ml-2"
                style={{ color: COLORS.textPrimary }}
              >
                {note}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}