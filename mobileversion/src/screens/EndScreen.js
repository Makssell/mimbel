import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Header from '../components/Header';
import ActionButton from '../components/ActionButton';
import databaseService from '../services/database';
import { colors, typography, spacing, theme } from '../theme';

// Helper function to format time display
const formatTimeDisplay = (seconds) => {
  if (seconds < 60) {
    return `${seconds.toFixed(1)}s`;
  } else {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (remainingSeconds === 0) {
      return `${minutes}m`;
    } else {
      return `${minutes}m ${remainingSeconds.toFixed(1)}s`;
    }
  }
};

export default function EndScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { gameStats } = route.params || {};
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(30)).current;

  // Save game to history
  React.useEffect(() => {
    if (gameStats) {
      databaseService.saveGameHistory(gameStats, gameStats.gameSettings);
    }

    // Animate entrance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        delay: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleMenuPress = () => {
    navigation.navigate('Menu');
  };

  const handleReturnHome = () => {
    navigation.navigate('Home');
  };

  const handleNewGame = () => {
    navigation.navigate('GameSetup');
  };

  const handlePlayAgain = () => {
    // Navigate back to game setup with same settings
    navigation.navigate('GameSetup', { 
      previousSettings: gameStats?.gameSettings 
    });
  };

  if (!gameStats) {
    return (
      <LinearGradient
        colors={[colors.backgroundDark, colors.backgroundLight]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <View style={styles.gradientOverlay} />
        <Header title="Game Ended" onMenuPress={handleMenuPress} />
        <View style={styles.content}>
          <Text style={styles.title}>No Game Data</Text>
          <ActionButton
            onPress={handleReturnHome}
            style={styles.homeButton}
          >
            Return to Home
          </ActionButton>
        </View>
      </LinearGradient>
    );
  }

  const endState = gameStats.endState || 'ranOutOfHearts';
  const timeElapsedSeconds = Math.floor(gameStats.timeElapsed / 1000);

  // Determine end state icon, title, and subtitle
  const getEndStateInfo = () => {
    switch (endState) {
      case 'ranOutOfHearts':
        return {
          icon: '💀',
          title: 'Game Over!',
          subtitle: "You ran out of hearts!",
        };
      case 'allCompleted':
        return {
          icon: '🏆',
          title: 'All Done!',
          subtitle: "You've completed all flags!",
        };
      case 'infiniteMode':
        return {
          icon: '♾️',
          title: 'Run Complete!',
          subtitle: 'Great job on your infinite run!',
        };
      case 'timeAttack':
        return {
          icon: '⏱️',
          title: "Time's Up!",
          subtitle: 'Great job on your time attack run!',
        };
      default:
        return {
          icon: '🎮',
          title: 'Game Ended',
          subtitle: 'Thanks for playing!',
        };
    }
  };

  const endStateInfo = getEndStateInfo();

  // Get quick stat for second card based on end state
  const getQuickStat = () => {
    switch (endState) {
      case 'ranOutOfHearts':
        return {
          value: `${gameStats.accuracy}%`,
          label: 'Accuracy',
        };
      case 'allCompleted':
        return {
          value: formatTimeDisplay(timeElapsedSeconds),
          label: 'Completion Time',
        };
      case 'infiniteMode':
        return {
          value: gameStats.longestStreak || 0,
          label: 'Longest Streak ⚡',
        };
      case 'timeAttack':
        return {
          value: gameStats.averageTimePerGuess || '0.0s',
          label: 'Avg Time per Guess ⏱️',
        };
      default:
        return {
          value: `${gameStats.accuracy}%`,
          label: 'Accuracy',
        };
    }
  };

  const quickStat = getQuickStat();

  return (
    <LinearGradient
      colors={[colors.backgroundDark, colors.backgroundLight]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.gradientOverlay} />
      <Header title="Game Results" onMenuPress={handleMenuPress} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* End Screen Header */}
          <View style={styles.header}>
            <Text style={styles.endStateIcon}>{endStateInfo.icon}</Text>
            <Text style={styles.endStateTitle}>{endStateInfo.title}</Text>
            <Text style={styles.endStateSubtitle}>{endStateInfo.subtitle}</Text>
          </View>

          {/* Quick Stats Section */}
          <View style={styles.quickStatsSection}>
            <View style={styles.quickStatCard}>
              <Text style={styles.quickStatValue}>{gameStats.score}</Text>
              <Text style={styles.quickStatLabel}>Points</Text>
            </View>
            <View style={styles.quickStatCard}>
              <Text style={styles.quickStatValue}>{quickStat.value}</Text>
              <Text style={styles.quickStatLabel}>{quickStat.label}</Text>
            </View>
          </View>

          {/* Game Settings Section */}
          {gameStats.gameSettings && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Game Settings</Text>
              <View style={styles.settingsInfo}>
                {gameStats.gameSettings.gameMode && (
                  <View style={styles.settingItem}>
                    <Text style={styles.settingLabel}>Game Mode:</Text>
                    <Text style={styles.settingValue}>{gameStats.gameSettings.gameMode}</Text>
                  </View>
                )}
                {gameStats.gameSettings.gameType && (
                  <View style={styles.settingItem}>
                    <Text style={styles.settingLabel}>Game Type:</Text>
                    <Text style={styles.settingValue}>{gameStats.gameSettings.gameType}</Text>
                  </View>
                )}
                {gameStats.gameSettings.country && (
                  <View style={styles.settingItem}>
                    <Text style={styles.settingLabel}>Country:</Text>
                    <Text style={styles.settingValue}>{gameStats.gameSettings.country}</Text>
                  </View>
                )}
                {gameStats.gameSettings.region && (
                  <View style={styles.settingItem}>
                    <Text style={styles.settingLabel}>Region:</Text>
                    <Text style={styles.settingValue}>{gameStats.gameSettings.region}</Text>
                  </View>
                )}
                {gameStats.gameSettings.territories && (
                  <View style={styles.settingItem}>
                    <Text style={styles.settingLabel}>Territories:</Text>
                    <Text style={styles.settingValue}>{gameStats.gameSettings.territories}</Text>
                  </View>
                )}
                {gameStats.gameSettings.mode && (
                  <View style={styles.settingItem}>
                    <Text style={styles.settingLabel}>Mode:</Text>
                    <Text style={styles.settingValue}>{gameStats.gameSettings.mode}</Text>
                  </View>
                )}
                {gameStats.gameSettings.typingMode && (
                  <View style={styles.settingItem}>
                    <Text style={styles.settingLabel}>Typing Mode:</Text>
                    <Text style={styles.settingValue}>Enabled</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Statistics Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Statistics</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statIcon}>🎯</Text>
                <View style={styles.statContent}>
                  <Text style={styles.statLabel}>Total Score</Text>
                  <Text style={styles.statValue}>{gameStats.score}</Text>
                </View>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statIcon}>📊</Text>
                <View style={styles.statContent}>
                  <Text style={styles.statLabel}>Accuracy</Text>
                  <Text style={styles.statValue}>{gameStats.accuracy}%</Text>
                </View>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statIcon}>🎲</Text>
                <View style={styles.statContent}>
                  <Text style={styles.statLabel}>Total Attempts</Text>
                  <Text style={styles.statValue}>{gameStats.totalAttempts}</Text>
                </View>
              </View>

              {/* Mode-specific statistics */}
              {endState === 'ranOutOfHearts' && (
                <>
                  <View style={styles.statCard}>
                    <Text style={styles.statIcon}>⏱️</Text>
                    <View style={styles.statContent}>
                      <Text style={styles.statLabel}>Time Elapsed</Text>
                      <Text style={styles.statValue}>{formatTimeDisplay(timeElapsedSeconds)}</Text>
                    </View>
                  </View>
                  {gameStats.remainingFlags !== undefined && (
                    <View style={styles.statCard}>
                      <Text style={styles.statIcon}>🚩</Text>
                      <View style={styles.statContent}>
                        <Text style={styles.statLabel}>Remaining</Text>
                        <Text style={styles.statValue}>{gameStats.remainingFlags}</Text>
                      </View>
                    </View>
                  )}
                </>
              )}

              {endState === 'allCompleted' && (
                <>
                  <View style={styles.statCard}>
                    <Text style={styles.statIcon}>🏁</Text>
                    <View style={styles.statContent}>
                      <Text style={styles.statLabel}>Completion Time</Text>
                      <Text style={styles.statValue}>{formatTimeDisplay(timeElapsedSeconds)}</Text>
                    </View>
                  </View>
                  <View style={styles.statCard}>
                    <Text style={styles.statIcon}>⏱️</Text>
                    <View style={styles.statContent}>
                      <Text style={styles.statLabel}>Avg Time per Guess</Text>
                      <Text style={styles.statValue}>{gameStats.averageTimePerGuess || '0.0s'}</Text>
                    </View>
                  </View>
                </>
              )}

              {endState === 'infiniteMode' && (
                <>
                  <View style={styles.statCard}>
                    <Text style={styles.statIcon}>⏱️</Text>
                    <View style={styles.statContent}>
                      <Text style={styles.statLabel}>Time Elapsed</Text>
                      <Text style={styles.statValue}>{formatTimeDisplay(timeElapsedSeconds)}</Text>
                    </View>
                  </View>
                  <View style={styles.statCard}>
                    <Text style={styles.statIcon}>⚡</Text>
                    <View style={styles.statContent}>
                      <Text style={styles.statLabel}>Longest Streak</Text>
                      <Text style={styles.statValue}>{gameStats.longestStreak || 0}</Text>
                    </View>
                  </View>
                </>
              )}

              {endState === 'timeAttack' && (
                <>
                  <View style={styles.statCard}>
                    <Text style={styles.statIcon}>⏱️</Text>
                    <View style={styles.statContent}>
                      <Text style={styles.statLabel}>Avg Time per Guess</Text>
                      <Text style={styles.statValue}>{gameStats.averageTimePerGuess || '0.0s'}</Text>
                    </View>
                  </View>
                  {gameStats.fastestGuess && (
                    <View style={styles.statCard}>
                      <Text style={styles.statIcon}>🏃</Text>
                      <View style={styles.statContent}>
                        <Text style={styles.statLabel}>Fastest Guess</Text>
                        <Text style={styles.statValue}>
                          {typeof gameStats.fastestGuess === 'number'
                            ? `${gameStats.fastestGuess.toFixed(2)}s`
                            : gameStats.fastestGuess}
                        </Text>
                      </View>
                    </View>
                  )}
                </>
              )}
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Fixed Action Buttons at Bottom */}
      <View style={[styles.fixedButtonContainer, { paddingBottom: insets.bottom }]}>
        <View style={styles.fixedButtonWrapper}>
          <View style={styles.actions}>
            <ActionButton
              onPress={handleNewGame}
              variant="secondary"
              style={styles.actionButton}
            >
              New Game
            </ActionButton>
            <ActionButton
              onPress={handlePlayAgain}
              variant="primary"
              style={styles.actionButton}
            >
              Play Again
            </ActionButton>
            <ActionButton
              onPress={handleReturnHome}
              variant="secondary"
              style={styles.actionButton}
            >
              Return to Home
            </ActionButton>
          </View>
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
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    paddingBottom: 200, // Space for fixed buttons
  },
  content: {
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
    paddingVertical: spacing.xl,
  },
  endStateIcon: {
    fontSize: 64,
    marginBottom: spacing.xl,
  },
  endStateTitle: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  endStateSubtitle: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  quickStatsSection: {
    flexDirection: 'row',
    gap: spacing.base,
    marginBottom: spacing['2xl'],
  },
  quickStatCard: {
    flex: 1,
    backgroundColor: colors.cardBgTransparent,
    borderRadius: theme.borderRadius.md,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderTransparent,
    ...theme.shadows.md,
  },
  quickStatValue: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  quickStatLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  section: {
    marginBottom: spacing['2xl'],
  },
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  settingsInfo: {
    gap: spacing.base,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.base,
    backgroundColor: colors.cardBgTransparent,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderTransparent,
  },
  settingLabel: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  settingValue: {
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
    fontWeight: typography.fontWeight.semiBold,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
  },
  statCard: {
    width: '48%',
    backgroundColor: colors.cardBgTransparent,
    borderRadius: theme.borderRadius.md,
    padding: spacing.base,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderTransparent,
    marginBottom: spacing.base,
    ...theme.shadows.sm,
  },
  statIcon: {
    fontSize: 32,
    marginBottom: spacing.base,
  },
  statContent: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  statValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  fixedButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(108, 92, 231, 0.2)',
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.sm,
    zIndex: 999,
  },
  fixedButtonWrapper: {
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
  },
  actions: {
    gap: spacing.sm,
  },
  actionButton: {
    marginBottom: 0,
    minHeight: 40,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing['2xl'],
    textAlign: 'center',
  },
  homeButton: {
    minWidth: 200,
  },
});
