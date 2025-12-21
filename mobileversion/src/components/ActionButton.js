import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, typography, spacing, theme } from '../theme';

const ActionButton = ({ 
  children, 
  onPress, 
  disabled = false, 
  variant = 'primary', // 'primary', 'secondary', 'danger'
  loading = false,
  style,
  ...props
}) => {
  const buttonStyle = [
    styles.button,
    variant === 'primary' && styles.primary,
    variant === 'secondary' && styles.secondary,
    variant === 'danger' && styles.danger,
    disabled && styles.disabled,
    style,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? colors.textPrimary : colors.textPrimary} />
      ) : (
        <Text style={[
          styles.text,
          variant === 'primary' && styles.primaryText,
          variant === 'secondary' && styles.secondaryText,
          variant === 'danger' && styles.dangerText,
        ]}>{children}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: spacing.base,
    paddingHorizontal: spacing['2xl'],
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
    ...theme.shadows.md,
    alignSelf: 'stretch',
  },
  primary: {
    backgroundColor: colors.accent,
  },
  secondary: {
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.borderTransparent,
  },
  danger: {
    backgroundColor: colors.error,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  primaryText: {
    color: colors.textPrimary,
  },
  secondaryText: {
    color: colors.textPrimary,
  },
  dangerText: {
    color: colors.textPrimary,
  },
});

export default ActionButton;
