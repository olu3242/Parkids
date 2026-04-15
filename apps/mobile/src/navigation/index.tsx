// ============================================================
// PAR-KIDS — Navigation (Mobile)
// Routes differ based on user role (parent vs child)
// ============================================================
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '@/lib/AuthContext';
import { colors, fontSize } from '@parkids/ui-tokens';

// Auth Screens
import LoginScreen from '@/screens/auth/LoginScreen';
import RegisterScreen from '@/screens/auth/RegisterScreen';
import OnboardingScreen from '@/screens/auth/OnboardingScreen';

// Parent Screens
import ParentHomeScreen from '@/screens/parent/HomeScreen';
import ChildrenListScreen from '@/screens/parent/ChildrenListScreen';
import ChildProfileScreen from '@/screens/parent/ChildProfileScreen';
import AddChildScreen from '@/screens/parent/AddChildScreen';
import CheckInsListScreen from '@/screens/parent/CheckInsListScreen';
import CheckInFlowScreen from '@/screens/parent/CheckInFlowScreen';
import CheckInCompleteScreen from '@/screens/parent/CheckInCompleteScreen';
import GrowthDashboardScreen from '@/screens/parent/GrowthDashboardScreen';
import GoalsListScreen from '@/screens/parent/GoalsListScreen';
import ParentSettingsScreen from '@/screens/parent/SettingsScreen';

// Child Screens
import ChildHomeScreen from '@/screens/child/ChildHomeScreen';
import ChildCheckInScreen from '@/screens/child/ChildCheckInScreen';
import ChildGoalsScreen from '@/screens/child/ChildGoalsScreen';
import ChildMoodScreen from '@/screens/child/ChildMoodScreen';

// Shared
import NotificationsScreen from '@/screens/shared/NotificationsScreen';

const AuthStack = createStackNavigator();
const ParentTab = createBottomTabNavigator();
const ChildTab = createBottomTabNavigator();
const ParentStack = createStackNavigator();
const ChildStack = createStackNavigator();

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
      <AuthStack.Screen name="Onboarding" component={OnboardingScreen} />
    </AuthStack.Navigator>
  );
}

function ParentTabNavigator() {
  return (
    <ParentTab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.sand[200],
          borderTopWidth: 1,
          height: 80,
          paddingBottom: 16,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.green[500],
        tabBarInactiveTintColor: colors.charcoal[400],
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <ParentTab.Screen
        name="Home"
        component={ParentHomeScreen}
        options={{ tabBarIcon: ({ color, size }) => <Feather name="home" size={size} color={color} /> }}
      />
      <ParentTab.Screen
        name="Children"
        component={ChildrenListScreen}
        options={{ tabBarIcon: ({ color, size }) => <Feather name="users" size={size} color={color} /> }}
      />
      <ParentTab.Screen
        name="CheckIns"
        component={CheckInsListScreen}
        options={{
          tabBarLabel: 'Check-Ins',
          tabBarIcon: ({ color, size }) => <Feather name="check-square" size={size} color={color} />,
        }}
      />
      <ParentTab.Screen
        name="Growth"
        component={GrowthDashboardScreen}
        options={{ tabBarIcon: ({ color, size }) => <Feather name="bar-chart-2" size={size} color={color} /> }}
      />
      <ParentTab.Screen
        name="Settings"
        component={ParentSettingsScreen}
        options={{ tabBarIcon: ({ color, size }) => <Feather name="settings" size={size} color={color} /> }}
      />
    </ParentTab.Navigator>
  );
}

function ChildTabNavigator() {
  return (
    <ChildTab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.sand[200],
          height: 80,
          paddingBottom: 16,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.teal[400],
        tabBarInactiveTintColor: colors.charcoal[400],
        tabBarLabelStyle: { fontSize: 12, fontWeight: '700' },
      }}
    >
      <ChildTab.Screen
        name="ChildHome"
        component={ChildHomeScreen}
        options={{ tabBarLabel: 'Home', tabBarIcon: ({ color, size }) => <Feather name="home" size={size} color={color} /> }}
      />
      <ChildTab.Screen
        name="ChildCheckIn"
        component={ChildCheckInScreen}
        options={{ tabBarLabel: 'Check-In', tabBarIcon: ({ color, size }) => <Feather name="check-circle" size={size} color={color} /> }}
      />
      <ChildTab.Screen
        name="ChildGoals"
        component={ChildGoalsScreen}
        options={{ tabBarLabel: 'My Goals', tabBarIcon: ({ color, size }) => <Feather name="target" size={size} color={color} /> }}
      />
      <ChildTab.Screen
        name="ChildMood"
        component={ChildMoodScreen}
        options={{ tabBarLabel: 'My Mood', tabBarIcon: ({ color, size }) => <Feather name="smile" size={size} color={color} /> }}
      />
    </ChildTab.Navigator>
  );
}

function ParentStackNavigator() {
  return (
    <ParentStack.Navigator screenOptions={{ headerShown: false }}>
      <ParentStack.Screen name="ParentTabs" component={ParentTabNavigator} />
      <ParentStack.Screen name="ChildProfile" component={ChildProfileScreen} />
      <ParentStack.Screen name="AddChild" component={AddChildScreen} />
      <ParentStack.Screen name="CheckInFlow" component={CheckInFlowScreen} />
      <ParentStack.Screen name="NewCheckIn" component={CheckInFlowScreen} />
      <ParentStack.Screen name="CheckInComplete" component={CheckInCompleteScreen} />
      <ParentStack.Screen name="GoalsList" component={GoalsListScreen} />
      <ParentStack.Screen name="Notifications" component={NotificationsScreen} />
    </ParentStack.Navigator>
  );
}

function ChildStackNavigator() {
  return (
    <ChildStack.Navigator screenOptions={{ headerShown: false }}>
      <ChildStack.Screen name="ChildTabs" component={ChildTabNavigator} />
      <ChildStack.Screen name="Notifications" component={NotificationsScreen} />
    </ChildStack.Navigator>
  );
}

export function AppNavigator() {
  const { session, parkidsUser, loading } = useAuth();

  if (loading) return null; // Show splash screen instead

  if (!session) return <AuthNavigator />;

  const isChild = parkidsUser?.role === 'child';
  return isChild ? <ChildStackNavigator /> : <ParentStackNavigator />;
}

export default function Navigation() {
  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
}
