import { useState } from "react";
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
import { useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS, SHADOWS, ACCOUNT_TYPES, CURRENCIES } from "../../constants";
import { createAccount } from "../../database/queries/accounts";
import { useUserStore } from "../../store/useUserStore";

export default function AddAccountScreen() {
  const navigation = useNavigation();
  const { user, loadAccounts } = useUserStore();

  const [name, setName] = useState("");
  const [selectedType, setSelectedType] = useState("savings");
  const [openingBalance, setOpeningBalance] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState("INR");
  const [loading, setLoading] = useState(false);

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert("Missing Name", "Please enter an account name.");
      return;
    }

    const balance = parseFloat(openingBalance) || 0;

    try {
      setLoading(true);
      createAccount({
        userId: user!.id,
        name: name.trim(),
        type: selectedType as any,
        totalAmount: balance,
        currentBalance: balance,
        currency: selectedCurrency,
        isActive: true,
      });
      loadAccounts();
      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", "Could not save account. Please try again.");
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
          <Text className="text-white text-xl font-bold">Add Account</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Account Name */}
        <SectionCard title="Account Name">
          <View
            className="flex-row items-center rounded-xl px-3"
            style={{
              backgroundColor: COLORS.gray100,
              borderWidth: 1,
              borderColor: COLORS.border,
            }}
          >
            <MaterialCommunityIcons
              name="bank-outline"
              size={20}
              color={COLORS.gray400}
            />
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. HDFC Savings"
              placeholderTextColor={COLORS.textMuted}
              className="flex-1 py-3 px-2 text-base"
              style={{ color: COLORS.textPrimary }}
            />
          </View>
        </SectionCard>

        {/* Account Type */}
        <SectionCard title="Account Type">
          <View className="flex-row flex-wrap gap-2">
            {ACCOUNT_TYPES.map((type) => {
              const isSelected = selectedType === type.value;
              return (
                <TouchableOpacity
                  key={type.value}
                  onPress={() => setSelectedType(type.value)}
                  className="flex-row items-center px-3 py-2 rounded-xl"
                  style={{
                    backgroundColor: isSelected
                      ? COLORS.primary
                      : COLORS.gray100,
                    borderWidth: 1,
                    borderColor: isSelected ? COLORS.primary : COLORS.border,
                  }}
                >
                  <MaterialCommunityIcons
                    name={type.icon as any}
                    size={16}
                    color={isSelected ? "white" : COLORS.gray500}
                  />
                  <Text
                    className="text-sm font-semibold ml-1"
                    style={{
                      color: isSelected ? "white" : COLORS.textSecondary,
                    }}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </SectionCard>

        {/* Opening Balance */}
        <SectionCard title="Opening Balance">
          <View
            className="flex-row items-center rounded-xl px-3"
            style={{
              backgroundColor: COLORS.gray100,
              borderWidth: 1,
              borderColor: COLORS.border,
            }}
          >
            <Text
              className="text-base font-bold mr-1"
              style={{ color: COLORS.gray400 }}
            >
              ₹
            </Text>
            <TextInput
              value={openingBalance}
              onChangeText={setOpeningBalance}
              placeholder="0.00"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="decimal-pad"
              className="flex-1 py-3 px-2 text-base"
              style={{ color: COLORS.textPrimary }}
            />
          </View>
        </SectionCard>

        {/* Currency */}
        <SectionCard title="Currency">
          <View className="flex-row flex-wrap gap-2">
            {CURRENCIES.map((currency) => {
              const isSelected = selectedCurrency === currency.value;
              return (
                <TouchableOpacity
                  key={currency.value}
                  onPress={() => setSelectedCurrency(currency.value)}
                  className="flex-row items-center px-3 py-2 rounded-xl"
                  style={{
                    backgroundColor: isSelected
                      ? COLORS.primary
                      : COLORS.gray100,
                    borderWidth: 1,
                    borderColor: isSelected ? COLORS.primary : COLORS.border,
                  }}
                >
                  <Text
                    className="text-sm font-semibold"
                    style={{
                      color: isSelected ? "white" : COLORS.textSecondary,
                    }}
                  >
                    {currency.symbol} {currency.value}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </SectionCard>

        {/* Save Button */}
        <TouchableOpacity
          onPress={handleSave}
          disabled={loading}
          className="mt-4 rounded-2xl py-4 items-center"
          style={{
            backgroundColor: loading ? COLORS.gray300 : COLORS.primary,
            ...SHADOWS.md,
          }}
        >
          <Text className="text-white text-base font-bold">
            {loading ? "Saving..." : "Save Account"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
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