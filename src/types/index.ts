// ─── User ───────────────────────────────────────────────────────────────────

export interface User {
  id: string;                  // UUID
  name: string;
  email: string;
  dob: string;                 // stored as ISO date string e.g. "1995-04-15"
  city: string;
  country: string;
  createdAt: string;           // ISO datetime string
}

// ─── Account ────────────────────────────────────────────────────────────────

export type AccountType =
  | "gift_card"
  | "cash"
  | "wallet"
  | "savings"
  | "current"
  | "credit_card"
  | "other";

export interface Account {
  id: string;                  // UUID
  userId: string;              // references User.id
  name: string;                // e.g. "HDFC Savings"
  type: AccountType;
  totalAmount: number;         // initial / total amount
  currentBalance: number;      // remaining balance
  currency: string;            // e.g. "INR", "USD"
  isActive: boolean;
  createdAt: string;
}

// ─── Category ───────────────────────────────────────────────────────────────

export type CategoryType = "expense" | "income" | "investment";

export interface Category {
  id: string;                  // UUID
  userId: string;              // references User.id
  name: string;                // e.g. "Food", "Transport"
  icon: string;                // icon name from Expo Vector Icons
  color: string;               // hex color e.g. "#FF5733"
  type: CategoryType;
  isDefault: boolean;          // true = system default, false = user created
  createdAt: string;
}

// ─── Transaction ─────────────────────────────────────────────────────────────

export type TransactionType =
  | "expense"
  | "income"
  | "investment"
  | "self_transfer";

export interface Transaction {
  id: string;                  // UUID
  userId: string;              // references User.id
  type: TransactionType;
  accountId: string;           // references Account.id
  toAccountId?: string;        // references Account.id (only for self_transfer)
  categoryId: string;          // references Category.id
  plannerId?: string;          // references Planner.id (optional)
  amount: number;
  dateTime: string;            // ISO datetime string
  note?: string;               // short label
  description?: string;        // detailed breakdown
  isArchived: boolean;
  createdAt: string;
}

// ─── Planner ─────────────────────────────────────────────────────────────────

export type PlannerType = "expense" | "income";

export interface Planner {
  id: string;                  // UUID
  userId: string;              // references User.id
  title: string;               // e.g. "Gym Budget - January"
  type: PlannerType;
  totalPlanned: number;        // total budget amount
  startDate: string;           // ISO date string
  endDate: string;             // ISO date string
  createdAt: string;
}

// ─── Planner Record ──────────────────────────────────────────────────────────

export interface PlannerRecord {
  id: string;                  // UUID
  plannerId: string;           // references Planner.id
  categoryId: string;          // references Category.id
  plannedAmount: number;       // amount allocated for this category
  note?: string;               // short label
  description?: string;        // detailed breakdown e.g. "Whey 2000, Paneer 500"
  createdAt: string;
}

// ─── Investment ──────────────────────────────────────────────────────────────

export type InvestmentType =
  | "sip"
  | "stocks"
  | "bonds"
  | "fd"
  | "rd"
  | "crypto"
  | "real_estate"
  | "other";

export type RecurringType = "one_time" | "recurring";

export type RecurrencePeriod =
  | "daily"
  | "weekly"
  | "monthly"
  | "quarterly"
  | "yearly";

export interface Investment {
  id: string;                  // UUID
  userId: string;              // references User.id
  investmentName: string;      // e.g. "Axis Bluechip SIP"
  type: InvestmentType;
  totalInvested: number;       // sum of all transactions (calculated)
  currentValue: number;        // manually updated market value
  recurringType: RecurringType;
  recurrencePeriod?: RecurrencePeriod; // only if recurringType is "recurring"
  note?: string;
  createdAt: string;
}

// ─── Investment Transaction ───────────────────────────────────────────────────

export interface InvestmentTransaction {
  id: string;                  // UUID
  investmentId: string;        // references Investment.id
  amount: number;
  dateTime: string;            // ISO datetime string
  accountName: string;         // plain text, not a foreign key
  note?: string;
  description?: string;
  createdAt: string;
}

// ─── Recurring Rule ───────────────────────────────────────────────────────────

export interface RecurringRule {
  id: string;                  // UUID
  userId: string;              // references User.id
  title: string;               // e.g. "Monthly Rent"
  amount: number;
  categoryId: string;          // references Category.id
  accountId: string;           // references Account.id
  frequency: RecurrencePeriod;
  nextDueDate: string;         // ISO date string
  note?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

// ─── Navigation Types ─────────────────────────────────────────────────────────

export type RootTabParamList = {
  Home: undefined;
  Planners: undefined;
  Reports: undefined;
  Calculators: undefined;
};

export type HomeStackParamList = {
  HomeScreen: undefined;
  TransactionsScreen: undefined;
  TransactionDetailScreen: { transactionId: string };
  AddTransactionScreen: undefined;
  EditTransactionScreen: { transactionId: string };
  AddAccountScreen: undefined;
  EditAccountScreen: { accountId: string };
  AccountsScreen: undefined;
  CategoriesScreen: undefined;
  AddCategoryScreen: undefined;
  EditCategoryScreen: { categoryId: string };
  MoreScreen: undefined;
};

export type PlannerStackParamList = {
  PlannersScreen: undefined;
  PlannerDetailScreen: { plannerId: string };
  PlannerRecordDetailScreen: { plannerRecordId: string; plannerId: string };
  AddPlannerScreen: undefined;
  EditPlannerScreen: { plannerId: string };
  AddPlannerRecordScreen: { plannerId: string };
  EditPlannerRecordScreen: { plannerRecordId: string };
};

export type MoreStackParamList = {
  MoreScreen: undefined;
  ProfileScreen: undefined;
  AccountsScreen: undefined;
  AddAccountScreen: undefined;
  EditAccountScreen: { accountId: string };
  CategoriesScreen: undefined;
  AddCategoryScreen: undefined;
  EditCategoryScreen: { categoryId: string };
  InvestmentsScreen: undefined;
  InvestmentDetailScreen: { investmentId: string };
  AddInvestmentScreen: undefined;
  EditInvestmentScreen: { investmentId: string };
  AddInvestmentTransactionScreen: { investmentId: string };
  RecurringRemindersScreen: undefined;
  AddRecurringReminderScreen: undefined;
  EditRecurringReminderScreen: { reminderId: string };
  SettingsScreen: undefined;
};

export type CalculatorStackParamList = {
  CalculatorsScreen: undefined;
  SimpleInterestScreen: undefined;
  CompoundInterestScreen: undefined;
  LoanCalculatorScreen: undefined;
  SIPCalculatorScreen: undefined;
  FDCalculatorScreen: undefined;
};

export type ReportsStackParamList = {
  ReportsScreen: undefined;
};

export type RootStackParamList = {
  MainApp: undefined;
};