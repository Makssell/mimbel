import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing, theme } from '../theme';

const MenuButton = ({ 
  icon, 
  label, 
  description, 
  isSelected = false, 
  onPress, 
  disabled = false,
  type = 'default' // 'mode', 'gameType', 'continent', 'setting'
}) => {
  const buttonStyle = [
    styles.button,
    type === 'setting' ? styles.settingButton : styles.menuButton,
    isSelected && styles.selected,
    disabled && styles.disabled,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      {icon && <Text style={styles.icon}>{icon}</Text>}
      <Text style={[styles.label, isSelected && styles.selectedLabel]}>
        {label}
      </Text>
      {description && (
        <Text style={[styles.description, isSelected && styles.selectedDescription]}>
          {description}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(21, 21, 21, 0.7)',
    ...theme.shadows.md,
    position: 'relative',
    overflow: 'hidden',
  },
  menuButton: {
    paddingVertical: 50,
    paddingHorizontal: 40,
    minHeight: 160,
    width: '100%',
  },
  settingButton: {
    paddingVertical: 40,
    paddingHorizontal: 30,
    minHeight: 140,
    width: '100%',
  },
  selected: {
    borderColor: colors.accent,
    backgroundColor: 'rgba(108, 92, 231, 0.1)',
    ...theme.shadows.accent,
  },
  disabled: {
    opacity: 0.5,
  },
  icon: {
    fontSize: 56, // 3.5rem equivalent
    marginBottom: spacing.base,
    textAlign: 'center',
  },
  label: {
    fontSize: 26, // Matching web version
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  selectedLabel: {
    color: colors.textPrimary,
  },
  description: {
    fontSize: typography.fontSize.base,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
    paddingHorizontal: spacing.sm,
  },
  selectedDescription: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
});

export default MenuButton;
