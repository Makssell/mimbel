import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, theme } from '../theme';

const ProgressBar = ({ 
  steps, 
  currentStep, 
  onStepPress,
  canGoBack,
  canGoForward,
  onPrevious,
  onNext 
}) => {
  const currentIndex = steps.findIndex(step => step.id === currentStep);
  const completedSteps = steps.slice(0, currentIndex).map(step => step.id);

  return (
    <View style={styles.container}>
      <View style={styles.stepsContainer}>
        {steps.map((step, index) => {
          const isCurrent = step.id === currentStep;
          // Home step is always considered completed (since we've left home to get here)
          // unless it's the current step (which shouldn't happen in GameSetup)
          const isHomeStep = step.id === 'home';
          const isCompleted = isHomeStep ? !isCurrent : completedSteps.includes(step.id);
          const isFuture = index > currentIndex;
          // Home step is always tappable, other steps follow normal logic
          const isTappable = isHomeStep || index <= currentIndex;
          const isIconStep = step.icon !== undefined;

          return (
            <View key={step.id} style={styles.stepWrapper}>
              <TouchableOpacity
                style={[
                  styles.step,
                  isIconStep && styles.iconStep,
                  isCurrent && styles.currentStep,
                  isCurrent && isIconStep && styles.currentIconStep,
                  isCompleted && styles.completedStep,
                  isCompleted && isIconStep && styles.completedIconStep,
                  isFuture && styles.futureStep,
                  isTappable && styles.tappableStep,
                ]}
                onPress={isTappable ? () => onStepPress?.(step.id) : undefined}
                disabled={!isTappable}
                activeOpacity={0.7}
              >
                {isIconStep && (
                  <Ionicons 
                    name={step.icon} 
                    size={step.iconSize || 20} 
                    color={
                      isCurrent || isCompleted 
                        ? colors.accent 
                        : colors.textSecondary
                    } 
                  />
                )}
              </TouchableOpacity>
              {index < steps.length - 1 && (
                <View
                  style={[
                    styles.line,
                    isCompleted ? styles.completedLine : styles.futureLine,
                  ]}
                />
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  stepsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  step: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.border,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconStep: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderColor: 'transparent',
  },
  currentStep: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
    width: 18,
    height: 18,
    borderRadius: 9,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 5,
  },
  currentIconStep: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 0,
    borderColor: 'transparent',
    backgroundColor: 'transparent',
  },
  completedIconStep: {
    borderWidth: 0,
    borderColor: 'transparent',
    backgroundColor: 'transparent',
  },
  completedStep: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  futureStep: {
    backgroundColor: colors.border,
    borderColor: colors.border,
  },
  tappableStep: {
    // Additional styling for tappable steps if needed
  },
  line: {
    width: 30,
    height: 2,
    marginHorizontal: spacing.xs,
  },
  completedLine: {
    backgroundColor: colors.accent,
  },
  futureLine: {
    backgroundColor: colors.border,
  },
});

export default ProgressBar;

