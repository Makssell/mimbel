import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screens
import HomeScreen from '../screens/HomeScreen';
import GameSetupScreen from '../screens/GameSetupScreen';
import GameScreen from '../screens/GameScreen';
import EndScreen from '../screens/EndScreen';
import HistoryScreen from '../screens/HistoryScreen';
import ChangelogsScreen from '../screens/ChangelogsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import MenuScreen from '../screens/MenuScreen';

const Stack = createNativeStackNavigator();

// Root Navigator - Stack based (no tabs)
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
        initialRouteName="Home"
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="GameSetup" component={GameSetupScreen} />
        <Stack.Screen name="Menu" component={MenuScreen} />
        <Stack.Screen name="Game" component={GameScreen} />
        <Stack.Screen 
          name="End" 
          component={EndScreen}
          options={{
            gestureEnabled: false, // Prevent going back
          }}
        />
        <Stack.Screen name="History" component={HistoryScreen} />
        <Stack.Screen name="Changelogs" component={ChangelogsScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
