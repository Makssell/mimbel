import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing, theme } from '../theme';

const ContinentButton = ({ 
  label, 
  isSelected, 
  onPress 
}) => {
  return (
    <TouchableOpacity
      style={[styles.button, isSelected && styles.selected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.label, isSelected && styles.selectedLabel]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing['2xl'],
    borderRadius: theme.borderRadius.lg,
    backgroundColor: colors.cardBgTransparent,
    borderWidth: 1,
    borderColor: colors.borderTransparent,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    minHeight: 80,
    width: '100%',
    ...theme.shadows.sm,
  },
  selected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
    ...theme.shadows.accent,
  },
  label: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
  },
  selectedLabel: {
    color: colors.textPrimary,
  },
});

export default ContinentButton;
