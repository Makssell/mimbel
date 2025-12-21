import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import { colors, typography, spacing, theme } from '../theme';

export default function MenuScreen() {
  const navigation = useNavigation();

  const menuItems = [
    {
      id: 'history',
      icon: 'trophy',
      label: 'Game History',
      description: 'View your game history and best scores',
      onPress: () => navigation.navigate('History'),
    },
    {
      id: 'changelogs',
      icon: 'document-text',
      label: 'Changelogs',
      description: 'View flag and app changelogs, manage sync',
      onPress: () => navigation.navigate('Changelogs'),
    },
    {
      id: 'settings',
      icon: 'settings',
      label: 'Settings',
      description: 'Sync data, manage preferences, and more',
      onPress: () => navigation.navigate('Settings'),
    },
  ];

  const handleBackPress = () => {
    navigation.goBack();
  };

  return (
    <LinearGradient
      colors={[colors.backgroundDark, colors.backgroundLight]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.gradientOverlay} />
      <Header title="Menu" onMenuPress={handleBackPress} showBack={true} />
      <View style={[styles.scrollView, styles.content]}>
        <View style={styles.menuGrid}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemIconContainer}>
                <Ionicons
                  name={item.icon}
                  size={32}
                  color={colors.accent}
                />
              </View>
              <View style={styles.menuItemContent}>
                <Text style={styles.menuItemLabel}>{item.label}</Text>
                <Text style={styles.menuItemDescription}>{item.description}</Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={24}
                color={colors.textSecondary}
                style={styles.chevron}
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.gradientOverlay,
    opacity: 0.3,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.xl,
  },
  menuGrid: {
    gap: spacing.base,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBgTransparent,
    padding: spacing.xl,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderTransparent,
    ...theme.shadows.md,
  },
  menuItemIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.cardBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.base,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemLabel: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  menuItemDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  chevron: {
    marginLeft: spacing.sm,
  },
});

