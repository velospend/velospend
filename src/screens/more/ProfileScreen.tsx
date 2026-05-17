import { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS, SHADOWS } from "../../constants";
import { useThemeStore } from "../../store/useThemeStore";
import { updateUser } from "../../database/queries/users";
import { useUserStore } from "../../store/useUserStore";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { colors: COLORS } = useThemeStore();
  const { user, loadUser } = useUserStore();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [showDobPicker, setShowDobPicker] = useState(false);
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (user) {
        setName(user.name || "");
        setEmail(user.email || "");
        setDob(user.dob || "");
        setCity(user.city || "");
        setCountry(user.country || "");
      }
    }, [user])
  );

  const getInitials = () => {
    if (!name) return "VS";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert("Missing Name", "Please enter your name.");
      return;
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);
      updateUser(user!.id, {
        name: name.trim(),
        email: email.trim(),
        dob: dob.trim(),
        city: city.trim(),
        country: country.trim(),
      });
      loadUser();
      setIsEditing(false);
    } catch (error) {
      Alert.alert("Error", "Could not update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setDob(user.dob || "");
      setCity(user.city || "");
      setCountry(user.country || "");
    }
    setIsEditing(false);
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
        className="px-5 pt-14 pb-6"
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
            <Text className="text-white text-xl font-bold">Profile</Text>
          </View>
          {!isEditing && (
            <TouchableOpacity
              onPress={() => setIsEditing(true)}
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
            >
              <MaterialCommunityIcons name="pencil" size={20} color="white" />
            </TouchableOpacity>
          )}
        </View>

        {/* Avatar */}
        <View className="items-center mt-4">
          <View
            className="w-20 h-20 rounded-full items-center justify-center mb-3"
            style={{ backgroundColor: "rgba(255,255,255,0.25)" }}
          >
            <Text className="text-white text-3xl font-bold">
              {getInitials()}
            </Text>
          </View>
          {!isEditing && (
            <>
              <Text className="text-white text-xl font-bold">
                {user?.name || "Guest"}
              </Text>
              {user?.email ? (
                <Text className="text-white text-sm opacity-70 mt-1">
                  {user.email}
                </Text>
              ) : null}
            </>
          )}
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        {isEditing ? (
          /* Edit Mode */
          <>
            <View
              className="rounded-2xl p-4 mb-4"
              style={{ backgroundColor: COLORS.surface, ...SHADOWS.sm }}
            >
              <ProfileInput
                label="Full Name"
                icon="account"
                value={name}
                onChangeText={setName}
                placeholder="e.g. Your Name"
                colors={COLORS}
              />
              <ProfileInput
                label="Email Address"
                icon="email"
                value={email}
                onChangeText={setEmail}
                placeholder="e.g. your@email.com"
                keyboardType="email-address"
                colors={COLORS}
              />
<View className="mb-3">
  <Text
    className="text-xs font-semibold mb-1 ml-1"
    style={{ color: COLORS.textSecondary }}
  >
    Date of Birth
  </Text>
  <TouchableOpacity
    onPress={() => setShowDobPicker(true)}
    className="flex-row items-center rounded-xl px-3 py-3"
    style={{
      backgroundColor: COLORS.gray100,
      borderWidth: 1,
      borderColor: COLORS.border,
    }}
  >
    <MaterialCommunityIcons
      name="calendar"
      size={18}
      color={COLORS.gray400}
    />
    <Text
      className="flex-1 px-2 text-sm"
      style={{ color: dob ? COLORS.textPrimary : COLORS.textMuted }}
    >
      {dob
        ? new Date(dob).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })
        : "Select date of birth"}
    </Text>
    <MaterialCommunityIcons
      name="chevron-down"
      size={18}
      color={COLORS.gray400}
    />
  </TouchableOpacity>
  {showDobPicker && (
    <DateTimePicker
      value={dob ? new Date(dob) : new Date(2000, 0, 1)}
      mode="date"
      display="default"
      maximumDate={new Date()}
      onChange={(_, date) => {
        setShowDobPicker(false);
        if (date) setDob(date.toISOString());
      }}
    />
  )}
</View>
              <ProfileInput
                label="City"
                icon="city"
                value={city}
                onChangeText={setCity}
                placeholder="e.g. Gurugram"
                colors={COLORS}
              />
              <ProfileInput
                label="Country"
                icon="earth"
                value={country}
                onChangeText={setCountry}
                colors={COLORS}
                placeholder="e.g. India"
                isLast
              />
            </View>

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={handleCancel}
                className="flex-1 py-4 rounded-2xl items-center"
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
                onPress={handleSave}
                disabled={loading}
                className="flex-1 py-4 rounded-2xl items-center"
                style={{
                  backgroundColor: loading ? COLORS.gray300 : COLORS.primary,
                  ...SHADOWS.md,
                }}
              >
                <Text className="text-white text-sm font-bold">
                  {loading ? "Saving..." : "Save Changes"}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          /* View Mode */
          <>
            <View
              className="rounded-2xl overflow-hidden mb-4"
              style={{ backgroundColor: COLORS.surface, ...SHADOWS.sm }}
            >
              <ProfileRow
                icon="account"
                label="Full Name"
                value={user?.name || "Not set"}
                colors={COLORS}
              />
              <ProfileRow
                icon="email"
                label="Email Address"
                value={user?.email || "Not set"}
                colors={COLORS}
              />
              <ProfileRow
  icon="calendar"
  label="Date of Birth"
  value={
    user?.dob
      ? new Date(user.dob).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "Not set"
  }
  colors={COLORS}
/>
              <ProfileRow
                icon="city"
                label="City"
                value={user?.city || "Not set"}
                colors={COLORS}
              />
              <ProfileRow
                icon="earth"
                label="Country"
                value={user?.country || "Not set"}
                isLast
                colors={COLORS}
              />
            </View>

            {/* App Info */}
            <View
              className="rounded-2xl overflow-hidden"
              style={{ backgroundColor: COLORS.surface, ...SHADOWS.sm }}
            >
              <ProfileRow
                icon="information"
                label="App Version"
                value="VeloSpend v1.0.0"
                colors={COLORS}
              />
              <ProfileRow
                icon="database"
                label="Storage"
                value="Local (on device)"
                isLast
                colors={COLORS}
              />
            </View>

            {/* Member Since */}
            {user?.createdAt && (
              <Text
                className="text-xs text-center mt-6"
                style={{ color: COLORS.textMuted }}
              >
                Member since{" "}
                {new Date(user.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </Text>
            )}
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Profile Row ──────────────────────────────────────────────────────────────

function ProfileRow({
  icon,
  label,
  value,
  isLast,
  colors
}: {
  icon: string;
  label: string;
  value: string;
  isLast?: boolean;
  colors: any;
}) {
  return (
    <View
      className="flex-row items-center px-4 py-3"
      style={{
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: colors.border,
      }}
    >
      <View
        className="w-8 h-8 rounded-full items-center justify-center mr-3"
        style={{ backgroundColor: colors.primary + "20" }}
      >
        <MaterialCommunityIcons
          name={icon as any}
          size={16}
          color={colors.primary}
        />
      </View>
      <View className="flex-1">
        <Text className="text-xs" style={{ color: colors.textMuted }}>
          {label}
        </Text>
        <Text
          className="text-sm font-semibold mt-0.5"
          style={{ color: colors.textPrimary }}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

// ─── Profile Input ────────────────────────────────────────────────────────────

function ProfileInput({
  label,
  icon,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  isLast,
  colors
}: {
  label: string;
  icon: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  keyboardType?: "default" | "email-address";
  isLast?: boolean;
  colors: any;
}) {
  return (
    <View className={isLast ? "" : "mb-3"}>
      <Text
        className="text-xs font-semibold mb-1 ml-1"
        style={{ color: colors.textSecondary }}
      >
        {label}
      </Text>
      <View
        className="flex-row items-center rounded-xl px-3"
        style={{
          backgroundColor: colors.gray100,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <MaterialCommunityIcons
          name={icon as any}
          size={18}
          color={colors.gray400}
        />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          keyboardType={keyboardType}
          autoCapitalize={keyboardType === "email-address" ? "none" : "words"}
          className="flex-1 py-3 px-2 text-sm"
          style={{ color: colors.textPrimary }}
        />
      </View>
    </View>
  );
}