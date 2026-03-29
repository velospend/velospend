import { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS } from "../constants";
import { getFirstUser } from "../database/queries/users";

// ─── Screens ──────────────────────────────────────────────────────────────────
import HomeScreen from "../screens/home/HomeScreen";
import TransactionsScreen from "../screens/transactions/TransactionsScreen";
import TransactionDetailScreen from "../screens/transactions/TransactionDetailScreen";
import AddTransactionScreen from "../screens/transactions/AddTransactionScreen";
import PlannersScreen from "../screens/planners/PlannersScreen";
import PlannerDetailScreen from "../screens/planners/PlannerDetailScreen";
import AddPlannerScreen from "../screens/planners/AddPlannerScreen";
import ReportsScreen from "../screens/reports/ReportsScreen";
import CalculatorsScreen from "../screens/calculators/CalculatorsScreen";
import SimpleInterestScreen from "../screens/calculators/SimpleInterestScreen";
import CompoundInterestScreen from "../screens/calculators/CompoundInterestScreen";
import LoanCalculatorScreen from "../screens/calculators/LoanCalculatorScreen";
import SIPCalculatorScreen from "../screens/calculators/SIPCalculatorScreen";
import FDCalculatorScreen from "../screens/calculators/FDCalculatorScreen";
import MoreScreen from "../screens/more/MoreScreen";
import ProfileScreen from "../screens/more/ProfileScreen";
import AccountsScreen from "../screens/more/AccountsScreen";
import AddAccountScreen from "../screens/more/AddAccountScreen";
import CategoriesScreen from "../screens/more/CategoriesScreen";
import InvestmentsScreen from "../screens/more/InvestmentsScreen";
import InvestmentDetailScreen from "../screens/more/InvestmentDetailScreen";
import AddInvestmentScreen from "../screens/more/AddInvestmentScreen";
import RecurringRemindersScreen from "../screens/more/RecurringRemindersScreen";
import SettingsScreen from "../screens/more/SettingsScreen";

// ─── Types ────────────────────────────────────────────────────────────────────
import {
  RootStackParamList,
  RootTabParamList,
  HomeStackParamList,
  PlannerStackParamList,
  MoreStackParamList,
} from "../types";

const RootStack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<RootTabParamList>();
const HomeStack = createStackNavigator<HomeStackParamList>();
const PlannerStack = createStackNavigator<PlannerStackParamList>();
const MoreStack = createStackNavigator<MoreStackParamList>();
const CalculatorStack = createStackNavigator();
const ReportsStack = createStackNavigator();

// ─── Stack Navigators ─────────────────────────────────────────────────────────

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeScreen" component={HomeScreen} />
      <HomeStack.Screen name="TransactionsScreen" component={TransactionsScreen} />
      <HomeStack.Screen name="TransactionDetailScreen" component={TransactionDetailScreen} />
      <HomeStack.Screen name="AddTransactionScreen" component={AddTransactionScreen} />
      <HomeStack.Screen name="EditTransactionScreen" component={AddTransactionScreen} />
      <HomeStack.Screen name="AddAccountScreen" component={AddAccountScreen} />
      <HomeStack.Screen name="EditAccountScreen" component={AddAccountScreen} />
    </HomeStack.Navigator>
  );
}

function PlannerStackNavigator() {
  return (
    <PlannerStack.Navigator screenOptions={{ headerShown: false }}>
      <PlannerStack.Screen name="PlannersScreen" component={PlannersScreen} />
      <PlannerStack.Screen name="PlannerDetailScreen" component={PlannerDetailScreen} />
      <PlannerStack.Screen name="AddPlannerScreen" component={AddPlannerScreen} />
    </PlannerStack.Navigator>
  );
}

function MoreStackNavigator() {
  return (
    <MoreStack.Navigator screenOptions={{ headerShown: false }}>
      <MoreStack.Screen name="MoreScreen" component={MoreScreen} />
      <MoreStack.Screen name="ProfileScreen" component={ProfileScreen} />
      <MoreStack.Screen name="AccountsScreen" component={AccountsScreen} />
      <MoreStack.Screen name="AddAccountScreen" component={AddAccountScreen} />
      <MoreStack.Screen name="CategoriesScreen" component={CategoriesScreen} />
      <MoreStack.Screen name="InvestmentsScreen" component={InvestmentsScreen} />
      <MoreStack.Screen name="InvestmentDetailScreen" component={InvestmentDetailScreen} />
      <MoreStack.Screen name="AddInvestmentScreen" component={AddInvestmentScreen} />
      <MoreStack.Screen name="RecurringRemindersScreen" component={RecurringRemindersScreen} />
      <MoreStack.Screen name="SettingsScreen" component={SettingsScreen} />
    </MoreStack.Navigator>
  );
}

function CalculatorStackNavigator() {
  return (
    <CalculatorStack.Navigator screenOptions={{ headerShown: false }}>
      <CalculatorStack.Screen name="CalculatorsScreen" component={CalculatorsScreen} />
      <CalculatorStack.Screen name="SimpleInterestScreen" component={SimpleInterestScreen} />
      <CalculatorStack.Screen name="CompoundInterestScreen" component={CompoundInterestScreen} />
      <CalculatorStack.Screen name="LoanCalculatorScreen" component={LoanCalculatorScreen} />
      <CalculatorStack.Screen name="SIPCalculatorScreen" component={SIPCalculatorScreen} />
      <CalculatorStack.Screen name="FDCalculatorScreen" component={FDCalculatorScreen} />
    </CalculatorStack.Navigator>
  );
}

function ReportsStackNavigator() {
  return (
    <ReportsStack.Navigator screenOptions={{ headerShown: false }}>
      <ReportsStack.Screen name="ReportsScreen" component={ReportsScreen} />
    </ReportsStack.Navigator>
  );
}

// ─── Bottom Tab Navigator ─────────────────────────────────────────────────────

function MainApp() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray400,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
        tabBarIcon: ({ color, size }) => {
          const icons: Record<string, string> = {
            Home: "home",
            Planners: "clipboard-list",
            Reports: "chart-bar",
            Calculators: "calculator",
          };
          return (
            <MaterialCommunityIcons
              name={icons[route.name] as any}
              size={size}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeStackNavigator} />
      <Tab.Screen name="Planners" component={PlannerStackNavigator} />
      <Tab.Screen name="Reports" component={ReportsStackNavigator} />
      <Tab.Screen name="Calculators" component={CalculatorStackNavigator} />
    </Tab.Navigator>
  );
}

// ─── Root Navigator ───────────────────────────────────────────────────────────

export default function RootNavigator() {
  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      <RootStack.Screen name="MainApp" component={MainApp} />
    </RootStack.Navigator>
  );
}