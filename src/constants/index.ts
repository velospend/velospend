// ─── Colors ───────────────────────────────────────────────────────────────────

export const COLORS = {
  // Primary
  primary: "#6C63FF",        // main purple — VeloSpend brand color
  primaryLight: "#8B85FF",
  primaryDark: "#4B44CC",

  // Accent
  accent: "#FF6584",         // pink accent for highlights

  // Semantic
  income: "#2ECC71",         // green — income
  expense: "#E74C3C",        // red — expense
  investment: "#F39C12",     // orange — investment
  transfer: "#3498DB",       // blue — self transfer

  // Neutrals
  background: "#F8F9FE",     // app background
  surface: "#FFFFFF",        // card / modal background
  border: "#EBEBF0",         // borders and dividers

  // Text
  textPrimary: "#1A1A2E",    // headings, main text
  textSecondary: "#6B7280",  // subtitles, labels
  textMuted: "#9CA3AF",      // placeholder, hints
  textWhite: "#FFFFFF",

  // Status
  success: "#2ECC71",
  error: "#E74C3C",
  warning: "#F39C12",
  info: "#3498DB",

  // Grayscale
  gray100: "#F3F4F6",
  gray200: "#E5E7EB",
  gray300: "#D1D5DB",
  gray400: "#9CA3AF",
  gray500: "#6B7280",
  gray600: "#4B5563",
  gray700: "#374151",
  gray800: "#1F2937",
  gray900: "#111827",

  // Transparent
  transparent: "transparent",
  overlay: "rgba(0, 0, 0, 0.5)",
} as const;

// ─── Typography ───────────────────────────────────────────────────────────────

export const FONTS = {
  sizes: {
    xs: 10,
    sm: 12,
    md: 14,
    base: 16,
    lg: 18,
    xl: 20,
    "2xl": 24,
    "3xl": 28,
    "4xl": 32,
    "5xl": 40,
  },
  weights: {
    regular: "400" as const,
    medium: "500" as const,
    semibold: "600" as const,
    bold: "700" as const,
    extrabold: "800" as const,
  },
} as const;

// ─── Spacing ──────────────────────────────────────────────────────────────────

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  "2xl": 32,
  "3xl": 40,
  "4xl": 48,
  "5xl": 64,
} as const;

// ─── Border Radius ────────────────────────────────────────────────────────────

export const RADIUS = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  "2xl": 24,
  full: 9999,
} as const;

// ─── Shadows ──────────────────────────────────────────────────────────────────

export const SHADOWS = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

// ─── Account Types ────────────────────────────────────────────────────────────

export const ACCOUNT_TYPES = [
  { label: "Bank", value: "bank", icon: "bank" },
  { label: "Cash", value: "cash", icon: "cash" },
  { label: "Wallet", value: "wallet", icon: "wallet" },
  { label: "Savings Account", value: "savings", icon: "piggy-bank" },
  { label: "Current Account", value: "current", icon: "briefcase" },
  { label: "Credit Card", value: "credit_card", icon: "credit-card" },
  { label: "Other", value: "other", icon: "dots-horizontal" },
] as const;

// ─── Transaction Types ────────────────────────────────────────────────────────

export const TRANSACTION_TYPES = [
  { label: "Expense", value: "expense", color: COLORS.expense },
  { label: "Income", value: "income", color: COLORS.income },
  { label: "Investment", value: "investment", color: COLORS.investment },
  { label: "Self Transfer", value: "self_transfer", color: COLORS.transfer },
] as const;

// ─── Investment Types ─────────────────────────────────────────────────────────

export const INVESTMENT_TYPES = [
  { label: "SIP", value: "sip" },
  { label: "Stocks", value: "stocks" },
  { label: "Bonds", value: "bonds" },
  { label: "Fixed Deposit", value: "fd" },
  { label: "Recurring Deposit", value: "rd" },
  { label: "Crypto", value: "crypto" },
  { label: "Real Estate", value: "real_estate" },
  { label: "Other", value: "other" },
] as const;

// ─── Recurrence Periods ───────────────────────────────────────────────────────

export const RECURRENCE_PERIODS = [
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
  { label: "Quarterly", value: "quarterly" },
  { label: "Yearly", value: "yearly" },
] as const;

// ─── Default Categories ───────────────────────────────────────────────────────

export const DEFAULT_CATEGORIES = [
  // Expense
  { name: "Food & Dining", icon: "food", color: "#FF6584", type: "expense" },
  { name: "Transport", icon: "car", color: "#6C63FF", type: "expense" },
  { name: "Shopping", icon: "shopping", color: "#F39C12", type: "expense" },
  { name: "Household", icon: "home", color: "#3498DB", type: "expense" },
  { name: "Health", icon: "heart", color: "#E74C3C", type: "expense" },
  { name: "Entertainment", icon: "movie", color: "#9B59B6", type: "expense" },
  { name: "Education", icon: "school", color: "#1ABC9C", type: "expense" },
  { name: "Bills & Utilities", icon: "lightning-bolt", color: "#E67E22", type: "expense" },
  { name: "Gym & Fitness", icon: "dumbbell", color: "#2ECC71", type: "expense" },
  { name: "Travel", icon: "airplane", color: "#00BCD4", type: "expense" },
  { name: "Personal Care", icon: "face-man", color: "#FF9800", type: "expense" },
  { name: "Other Expense", icon: "dots-horizontal", color: "#9CA3AF", type: "expense" },

  // Income
  { name: "Salary", icon: "briefcase", color: "#2ECC71", type: "income" },
  { name: "Freelance", icon: "laptop", color: "#6C63FF", type: "income" },
  { name: "Business", icon: "store", color: "#F39C12", type: "income" },
  { name: "Rental", icon: "home-city", color: "#3498DB", type: "income" },
  { name: "Gift", icon: "gift", color: "#FF6584", type: "income" },
  { name: "Other Income", icon: "dots-horizontal", color: "#9CA3AF", type: "income" },

  // Investment
  { name: "SIP", icon: "chart-line", color: "#F39C12", type: "investment" },
  { name: "Stocks", icon: "trending-up", color: "#2ECC71", type: "investment" },
  { name: "Bonds", icon: "file-document", color: "#3498DB", type: "investment" },
  { name: "Fixed Deposit", icon: "bank", color: "#9B59B6", type: "investment" },
  { name: "Crypto", icon: "bitcoin", color: "#E67E22", type: "investment" },
  { name: "Other Investment", icon: "dots-horizontal", color: "#9CA3AF", type: "investment" },
] as const;

// ─── Currency ─────────────────────────────────────────────────────────────────

export const CURRENCIES = [
  { label: "Indian Rupee", value: "INR", symbol: "₹" },
  { label: "US Dollar", value: "USD", symbol: "$" },
  { label: "Euro", value: "EUR", symbol: "€" },
  { label: "British Pound", value: "GBP", symbol: "£" },
  { label: "Japanese Yen", value: "JPY", symbol: "¥" },
  { label: "Canadian Dollar", value: "CAD", symbol: "CA$" },
  { label: "Australian Dollar", value: "AUD", symbol: "A$" },
] as const;

export const DEFAULT_CURRENCY = "INR";
export const DEFAULT_CURRENCY_SYMBOL = "₹";