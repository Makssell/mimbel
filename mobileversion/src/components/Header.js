import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, theme } from '../theme';

export default function Header({ title, onMenuPress, showBack = false, showHome = false, onHomePress }) {
  const insets = useSafeAreaInsets();
  
  const getIconName = () => {
    if (showHome) return "home";
    if (showBack) return "arrow-back";
    return "globe-outline";
  };
  
  const getAccessibilityLabel = () => {
    if (showHome) return "Go home";
    if (showBack) return "Go back";
    return "Open menu";
  };
  
  const handlePress = () => {
    if (showHome && onHomePress) {
      onHomePress();
    } else if (onMenuPress) {
      onMenuPress();
    }
  };
  
  return (
    <View style={[styles.safeArea, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={handlePress}
          accessibilityLabel={getAccessibilityLabel()}
        >
          <Ionicons name={getIconName()} size={28} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.cardBg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.cardBg,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    flex: 1,
  },
  menuButton: {
    padding: spacing.sm,
    marginLeft: spacing.sm,
  },
});

