import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Image, View } from 'react-native';
import { colors, typography, spacing, theme } from '../theme';

const GameButton = ({ 
  children, 
  onPress, 
  disabled = false, 
  variant = 'guess', // 'guess', 'flagGuess', 'skip', 'retry'
  flagImage = null, // For flagGuess variant
  feedbackStyle = null, // 'correct' or 'incorrect'
  style,
  ...props
}) => {
  const buttonStyle = [
    styles.button,
    variant === 'guess' && styles.guessButton,
    variant === 'flagGuess' && styles.flagGuessButton,
    variant === 'skip' && styles.skipButton,
    variant === 'retry' && styles.retryButton,
    feedbackStyle === 'correct' && styles.correctButton,
    feedbackStyle === 'incorrect' && styles.incorrectButton,
    disabled && styles.disabled,
    style,
  ];

  const textStyle = [
    styles.text,
    variant === 'guess' && styles.guessText,
    variant === 'flagGuess' && styles.flagGuessText,
    variant === 'skip' && styles.skipText,
    variant === 'retry' && styles.retryText,
    (feedbackStyle === 'correct' || feedbackStyle === 'incorrect') && styles.feedbackText,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      {...props}
    >
      {variant === 'flagGuess' && flagImage && (
        <Image
          source={{ uri: flagImage }}
          style={styles.flagImage}
          resizeMode="contain"
        />
      )}
      {typeof children === 'string' ? (
        <Text style={textStyle}>{children}</Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    ...theme.shadows.md,
    overflow: 'hidden',
  },
  guessButton: {
    backgroundColor: 'rgba(21, 21, 21, 0.7)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 0,
    margin: 0,
  },
  flagGuessButton: {
    backgroundColor: 'rgba(21, 21, 21, 0.7)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: spacing.sm,
    position: 'relative',
  },
  skipButton: {
    backgroundColor: colors.cardBg,
    borderColor: colors.borderTransparent,
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.xl,
  },
  retryButton: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.xl,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  guessText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
  },
  flagGuessText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  skipText: {
    color: colors.textSecondary,
  },
  retryText: {
    color: colors.textPrimary,
  },
  flagImage: {
    width: '100%',
    height: '70%',
    resizeMode: 'contain',
    borderRadius: theme.borderRadius.sm,
  },
  // Correct/Incorrect feedback styles
  correctButton: {
    backgroundColor: '#00c49a',
    borderColor: '#00a884',
    borderWidth: 0,
    ...theme.shadows.lg,
  },
  incorrectButton: {
    backgroundColor: '#ff4c4c',
    borderColor: '#ff3333',
    borderWidth: 0,
    ...theme.shadows.lg,
  },
  feedbackText: {
    color: '#ffffff',
    fontWeight: typography.fontWeight.bold,
  },
});

export default GameButton;
