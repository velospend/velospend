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
import { updateUser } from "../../database/queries/users";
import { useUserStore } from "../../store/useUserStore";

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { user, loadUser } = useUserStore();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
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
                placeholder="e.g. Yash Gupta"
              />
              <ProfileInput
                label="Email Address"
                icon="email"
                value={email}
                onChangeText={setEmail}
                placeholder="e.g. yash@email.com"
                keyboardType="email-address"
              />
              <ProfileInput
                label="Date of Birth"
                icon="calendar"
                value={dob}
                onChangeText={setDob}
                placeholder="e.g. 1995-04-15"
              />
              <ProfileInput
                label="City"
                icon="city"
                value={city}
                onChangeText={setCity}
                placeholder="e.g. Gurugram"
              />
              <ProfileInput
                label="Country"
                icon="earth"
                value={country}
                onChangeText={setCountry}
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
              />
              <ProfileRow
                icon="email"
                label="Email Address"
                value={user?.email || "Not set"}
              />
              <ProfileRow
                icon="calendar"
                label="Date of Birth"
                value={user?.dob || "Not set"}
              />
              <ProfileRow
                icon="city"
                label="City"
                value={user?.city || "Not set"}
              />
              <ProfileRow
                icon="earth"
                label="Country"
                value={user?.country || "Not set"}
                isLast
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
              />
              <ProfileRow
                icon="database"
                label="Storage"
                value="Local (on device)"
                isLast
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
}: {
  icon: string;
  label: string;
  value: string;
  isLast?: boolean;
}) {
  return (
    <View
      className="flex-row items-center px-4 py-3"
      style={{
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: COLORS.border,
      }}
    >
      <View
        className="w-8 h-8 rounded-full items-center justify-center mr-3"
        style={{ backgroundColor: COLORS.primary + "20" }}
      >
        <MaterialCommunityIcons
          name={icon as any}
          size={16}
          color={COLORS.primary}
        />
      </View>
      <View className="flex-1">
        <Text className="text-xs" style={{ color: COLORS.textMuted }}>
          {label}
        </Text>
        <Text
          className="text-sm font-semibold mt-0.5"
          style={{ color: COLORS.textPrimary }}
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
}: {
  label: string;
  icon: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  keyboardType?: "default" | "email-address";
  isLast?: boolean;
}) {
  return (
    <View className={isLast ? "" : "mb-3"}>
      <Text
        className="text-xs font-semibold mb-1 ml-1"
        style={{ color: COLORS.textSecondary }}
      >
        {label}
      </Text>
      <View
        className="flex-row items-center rounded-xl px-3"
        style={{
          backgroundColor: COLORS.gray100,
          borderWidth: 1,
          borderColor: COLORS.border,
        }}
      >
        <MaterialCommunityIcons
          name={icon as any}
          size={18}
          color={COLORS.gray400}
        />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textMuted}
          keyboardType={keyboardType}
          autoCapitalize={keyboardType === "email-address" ? "none" : "words"}
          className="flex-1 py-3 px-2 text-sm"
          style={{ color: COLORS.textPrimary }}
        />
      </View>
    </View>
  );
}