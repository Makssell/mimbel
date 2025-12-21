import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  TextInput,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGame } from '../hooks/useGame';
import GameButton from '../components/GameButton';
import ActionButton from '../components/ActionButton';
import { colors, typography, spacing, theme } from '../theme';

export default function GameScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { gameSettings } = route.params || {};
  const typingInputRef = useRef(null);

  const handleGameEnd = (gameStats) => {
    navigation.navigate('End', { gameStats });
  };

  const {
    flags,
    currentFlag,
    options,
    flagOptions,
    score,
    health,
    gameStarted,
    buttonsDisabled,
    message,
    usedFlags,
    isFlagLoading,
    flagOptionsReady,
    totalAttempts,
    longestStreak,
    timeRemaining,
    timerStarted,
    typedAnswer,
    setTypedAnswer,
    buttonStyles,
    typingInputStyle,
    startGame,
    checkAnswer,
  } = useGame(gameSettings, handleGameEnd);

  // Focus typing input when typing mode is active
  useEffect(() => {
    if (gameStarted && gameSettings?.typingMode && typingInputRef.current) {
      typingInputRef.current.focus();
    }
  }, [gameStarted, currentFlag, gameSettings?.typingMode]);

  // Handle typing mode submission
  const handleTypingSubmit = () => {
    if (typedAnswer.trim() && !buttonsDisabled) {
      checkAnswer(typedAnswer);
    }
  };

  const handleMenuPress = () => {
    navigation.navigate('Menu');
  };

  // Pulse placeholder component for loading flag options
  const PulsePlaceholder = ({ delay = 0 }) => {
    const pulseAnim = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.6,
            duration: 4000,
            delay: delay,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.3,
            duration: 4000,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }, [pulseAnim, delay]);

    return (
      <Animated.View
        style={[
          styles.flagOptionButton,
          styles.placeholderButton,
          { opacity: pulseAnim },
        ]}
      />
    );
  };

  if (!gameStarted) {
    return (
      <LinearGradient
        colors={[colors.backgroundDark, colors.backgroundLight]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <View style={styles.gradientOverlay} />
        <View style={styles.scrollView}>
          <View style={styles.startContainer}>
          <Text style={styles.title}>Ready to Play?</Text>
          <Text style={styles.settingsText}>
            Mode: {gameSettings?.gameMode || 'standard'}
          </Text>
          <Text style={styles.settingsText}>
            Type: {gameSettings?.gameType || 'flag-to-country'}
          </Text>
          
          <ActionButton
            onPress={startGame}
            style={styles.startButton}
          >
            Start Game
          </ActionButton>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Back to Settings</Text>
          </TouchableOpacity>
        </View>
        </View>
      </LinearGradient>
    );
  }

  const gameType = gameSettings?.gameType || 'flag-to-country';
  const isTypingMode = gameSettings?.typingMode || false;

  return (
    <LinearGradient
      colors={[colors.backgroundDark, colors.backgroundLight]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.gradientOverlay} />
      
      {/* Fixed Game Info Bar at Top */}
      <View style={[styles.gameInfo, { paddingTop: insets.top + 12 }]}>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreLabel}>Score:</Text>
          <Text style={styles.scoreValue}>{score}</Text>
        </View>
        
        {gameSettings?.timeAttackMode && timerStarted && (
          <View style={styles.timerContainer}>
            <Text style={styles.timerLabel}>⏱️ Time:</Text>
            <Text style={[
              styles.timerValue,
              timeRemaining <= 10 && styles.timerWarning,
              timeRemaining <= 5 && styles.timerCritical
            ]}>
              {timeRemaining}s
            </Text>
          </View>
        )}
        
        {!gameSettings?.timeAttackMode && (
          <View style={styles.healthContainer}>
            {Array.from({ length: 3 }).map((_, index) => (
              <Text
                key={index}
                style={[
                  styles.heart,
                  health > index ? styles.activeHeart : styles.inactiveHeart
                ]}
              >
                ❤️
              </Text>
            ))}
          </View>
        )}
      </View>

      {/* Flag Image or Country Name - Top 50% */}
      {currentFlag && (
        <View style={[
          styles.questionContainer, 
          { 
            marginTop: 65 + insets.top,
            height: (Dimensions.get('window').height - (65 + insets.top)) * 0.5
          }
        ]}>
          {isFlagLoading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size={48} color={colors.accent} />
            </View>
          )}
          
          {(gameType === 'flag-to-country' || gameType === 'flag-to-region') ? (
            <View style={styles.flagContainer}>
              <Image
                source={{ uri: currentFlag.image_url }}
                style={styles.flagImage}
                resizeMode="contain"
                onLoadStart={() => {}}
                onLoadEnd={() => {}}
              />
            </View>
          ) : (
            <View style={styles.nameContainer}>
              <Text style={styles.countryName}>{currentFlag.name}</Text>
            </View>
          )}
        </View>
      )}

      {/* Answer Options - Bottom 50% */}
      {isTypingMode ? (
        <View style={[
          styles.typingContainer,
          { height: (Dimensions.get('window').height - (65 + insets.top)) * 0.5 }
        ]}>
          <TextInput
            ref={typingInputRef}
            style={[
              styles.typingInput,
              typingInputStyle === 'correct' && styles.correctInput,
              typingInputStyle === 'incorrect' && styles.incorrectInput,
            ]}
            value={typedAnswer}
            onChangeText={setTypedAnswer}
            onSubmitEditing={handleTypingSubmit}
            placeholder="Type your answer..."
            autoCapitalize="words"
            autoCorrect={false}
            editable={!buttonsDisabled}
            placeholderTextColor={colors.textSecondary}
          />
          <ActionButton
            onPress={handleTypingSubmit}
            disabled={buttonsDisabled || !typedAnswer.trim()}
            style={styles.submitButton}
          >
            Submit
          </ActionButton>
        </View>
      ) : (
        <View style={[
          styles.optionsContainer,
          { height: (Dimensions.get('window').height - (65 + insets.top)) * 0.5 }
        ]}>
          {(gameType === 'flag-to-country' || gameType === 'flag-to-region') ? (
            // Show name options in 2x2 grid
            options.map((option, index) => (
              <GameButton
                key={index}
                variant="guess"
                onPress={() => checkAnswer(option)}
                disabled={buttonsDisabled}
                style={styles.optionButton}
                feedbackStyle={buttonStyles[option]}
              >
                <Text style={styles.optionText}>{option}</Text>
              </GameButton>
            ))
          ) : (
            // Show flag options in 2x2 grid - only when all images are preloaded
            flagOptionsReady && flagOptions.length > 0 ? (
              flagOptions.map((flag, index) => (
                <GameButton
                  key={flag.id}
                  variant="flagGuess"
                  flagImage={flag.image_url}
                  onPress={() => checkAnswer(flag.id)}
                  disabled={buttonsDisabled}
                  style={styles.flagOptionButton}
                  feedbackStyle={buttonStyles[flag.id]}
                >
                  <Text style={styles.flagOptionText}>{flag.name}</Text>
                </GameButton>
              ))
            ) : (
              // Show pulsing placeholders while images are preloading
              Array.from({ length: 4 }).map((_, index) => (
                <PulsePlaceholder key={`placeholder-${index}`} delay={index * 150} />
              ))
            )
          )}
        </View>
      )}

      {/* Fixed Message at Bottom */}
      {message ? (
        <View style={styles.messageContainer}>
          <Text style={styles.messageText}>{message}</Text>
        </View>
      ) : null}

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
    flexGrow: 1,
    paddingTop: 65, // Space for fixed gameInfo bar
  },
  startContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 400,
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.lg,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  settingsText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: 5,
  },
  startButton: {
    marginTop: spacing['2xl'],
    minWidth: 200,
  },
  backButton: {
    marginTop: spacing.xl,
    padding: spacing.sm,
  },
  backButtonText: {
    color: colors.accent,
    fontSize: typography.fontSize.base,
  },
  // Game Info Bar - Fixed at top, matching web design
  gameInfo: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(21, 21, 21, 0.85)',
    paddingVertical: 12,
    paddingHorizontal: spacing.xl,
    minHeight: 65,
    zIndex: 1000,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    ...theme.shadows.lg,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(108, 92, 231, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(108, 92, 231, 0.2)',
  },
  scoreLabel: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    marginRight: 6,
    opacity: 0.7,
  },
  scoreValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
    letterSpacing: 0.5,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 7, 0.2)',
    gap: 6,
  },
  timerLabel: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    opacity: 0.7,
  },
  timerValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    letterSpacing: 0.5,
  },
  timerWarning: {
    color: colors.warning,
  },
  timerCritical: {
    color: colors.error,
    fontWeight: typography.fontWeight.bold,
  },
  healthContainer: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  heart: {
    fontSize: 20,
    width: 28,
    height: 28,
    textAlign: 'center',
  },
  activeHeart: {
    color: colors.accent,
    opacity: 1,
  },
  inactiveHeart: {
    color: 'rgba(102, 102, 102, 0.2)',
    opacity: 0.3,
    transform: [{ scale: 0.9 }],
  },
  // Message - Fixed at bottom, matching web design
  messageContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(21, 21, 21, 0.7)',
    padding: 15,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    zIndex: 1000,
    ...theme.shadows.lg,
  },
  messageText: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  // Question Container - Takes up top 50% of screen
  questionContainer: {
    width: '100%',
    minHeight: 250,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(21, 21, 21, 0.7)',
    padding: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  flagContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  flagImage: {
    width: '100%',
    height: '100%',
    maxHeight: 400,
    resizeMode: 'contain',
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.md,
  },
  nameContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  countryName: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  // Typing Container
  typingContainer: {
    width: '100%',
    minHeight: 200,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: 'rgba(21, 21, 21, 0.7)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  typingInput: {
    backgroundColor: colors.cardBg,
    padding: spacing.base,
    borderRadius: theme.borderRadius.lg,
    fontSize: typography.fontSize.xl,
    marginBottom: spacing.base,
    borderWidth: 2,
    borderColor: colors.borderTransparent,
    color: colors.textPrimary,
    width: '100%',
    maxWidth: 400,
    minHeight: 50,
  },
  correctInput: {
    backgroundColor: '#00c49a',
    borderColor: '#00a884',
    borderWidth: 0,
    color: '#ffffff',
    ...theme.shadows.lg,
  },
  incorrectInput: {
    backgroundColor: '#ff4c4c',
    borderColor: '#ff3333',
    borderWidth: 0,
    color: '#ffffff',
    ...theme.shadows.lg,
  },
  submitButton: {
    minWidth: 150,
  },
  // Options Container - Takes up bottom 50% of screen, 2x2 grid
  optionsContainer: {
    width: '100%',
    minHeight: 250,
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: 'rgba(21, 21, 21, 0.7)',
    padding: spacing.base,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  optionButton: {
    width: '48%',
    height: '48%',
    margin: '1%',
  },
  optionText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
  },
  flagOptionButton: {
    width: '48%',
    height: '48%',
    margin: '1%',
    padding: spacing.sm,
  },
  flagOptionText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  placeholderButton: {
    backgroundColor: 'rgba(21, 21, 21, 0.7)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    alignItems: 'center',
    padding: spacing.sm,
  },
  progressText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
});
