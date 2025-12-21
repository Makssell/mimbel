import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import { colors, typography, spacing, theme } from '../theme';
import databaseService from '../services/database';

export default function HomeScreen() {
  const navigation = useNavigation();
  
  // Recent games
  const [recentGames, setRecentGames] = useState([]);

  // Load recent games when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      loadRecentGames();
    }, [])
  );

  const loadRecentGames = () => {
    try {
      const history = databaseService.getGameHistory(3); // Get last 3 games
      setRecentGames(history);
    } catch (error) {
      console.error('Error loading recent games:', error);
      setRecentGames([]);
    }
  };

  // Quick start: World Flags, Flag to Country, Infinite
  const handleQuickStart = () => {
    const quickStartSettings = {
      gameMode: 'standard',
      gameType: 'flag-to-country',
      selectedContinent: 'world',
      includeTerritories: false,
      infiniteMode: true,
      timeAttackMode: false,
      typingMode: false,
    };
    navigation.navigate('Game', { gameSettings: quickStartSettings });
  };

  // Replay a recent game
  const handleReplayGame = (gameHistoryItem) => {
    const gameData = gameHistoryItem.game_data || {};
    const gameSettings = gameData.gameSettings;
    
    if (gameSettings) {
      // Reconstruct settings for navigation - ensure all values are primitives
      const replaySettings = {
        gameMode: gameSettings.gameMode === 'Regional Flags' ? 'regional' : 'standard',
        gameType: gameSettings.gameType === 'Flag → Country' ? 'flag-to-country' :
                 gameSettings.gameType === 'Country → Flag' ? 'country-to-flag' :
                 gameSettings.gameType === 'Flag → Region' ? 'flag-to-region' :
                 gameSettings.gameType === 'Region → Flag' ? 'region-to-flag' : 'flag-to-country',
        selectedContinent: gameSettings.region === 'World' ? 'world' :
                          gameSettings.region === 'Africa' ? '1' :
                          gameSettings.region === 'Asia' ? '2' :
                          gameSettings.region === 'Europe' ? '3' :
                          gameSettings.region === 'North America' ? '4' :
                          gameSettings.region === 'South America' ? '5' :
                          gameSettings.region === 'Oceania' ? '6' : 'world',
        includeTerritories: Boolean(gameSettings.territories === 'Included'),
        infiniteMode: Boolean(gameSettings.mode === 'Infinite'),
        timeAttackMode: Boolean(gameSettings.mode === 'Time Attack'),
        typingMode: Boolean(gameSettings.typingMode || false),
        selectedCountryId: gameSettings.selectedCountryId || null,
        selectedDivisionTypes: Array.isArray(gameSettings.selectedDivisionTypes)
          ? gameSettings.selectedDivisionTypes.map(id => Number(id))
          : [],
      };
      navigation.navigate('Game', { gameSettings: replaySettings });
    }
  };

  const handleMenuPress = () => {
    navigation.navigate('Menu');
  };

  const handleCustomSetup = () => {
    navigation.navigate('GameSetup');
  };

  const handleViewFullHistory = () => {
    navigation.navigate('History');
  };

  // Render home hub - Central command center
  const renderHomeHub = () => (
    <View style={styles.homeHub}>
      {/* Quick Start Section */}
      <View style={styles.section}>
        <View style={styles.sectionTitleContainer}>
          <Text style={styles.sectionTitle}>Quick Start</Text>
          <View style={styles.sectionTitleLine} />
        </View>
        <TouchableOpacity
          style={styles.quickStartButton}
          onPress={handleQuickStart}
          activeOpacity={0.7}
        >
          <View style={styles.quickStartContent}>
            <Text style={styles.quickStartIcon}>🌍</Text>
            <View style={styles.quickStartText}>
              <Text style={styles.quickStartLabel}>World Flags</Text>
              <Text style={styles.quickStartDescription}>Flag → Country • Infinite Mode</Text>
            </View>
            <Ionicons name="play-circle" size={32} color={colors.accent} />
          </View>
        </TouchableOpacity>
      </View>

      {/* Recent Games Section */}
      {recentGames.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>Recent Games</Text>
            <View style={styles.sectionTitleLine} />
          </View>
          <View style={styles.recentGamesList}>
            {recentGames.map((game, index) => {
              const gameData = game.game_data || {};
              const gameSettings = gameData.gameSettings || {};
              const formatTime = (ms) => {
                const seconds = Math.floor(ms / 1000);
                const minutes = Math.floor(seconds / 60);
                const secs = seconds % 60;
                return minutes > 0 ? `${minutes}m ${secs}s` : `${secs}s`;
              };
              
              return (
                <TouchableOpacity
                  key={game.id || index}
                  style={styles.recentGameItem}
                  onPress={() => handleReplayGame(game)}
                  activeOpacity={0.7}
                >
                  <View style={styles.recentGameInfo}>
                    <Text style={styles.recentGameType}>
                      {gameSettings.gameType || game.game_type || 'Flag → Country'}
                    </Text>
                    <Text style={styles.recentGameDetails}>
                      {gameSettings.region || 'World'} • {gameSettings.mode || 'Standard'}
                    </Text>
                  </View>
                  <View style={styles.recentGameStats}>
                    <Text style={styles.recentGameScore}>{game.score || 0}</Text>
                    <Text style={styles.recentGameTime}>
                      {formatTime(game.time_elapsed || 0)}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              );
            })}
          </View>
          <TouchableOpacity
            style={styles.viewHistoryButton}
            onPress={handleViewFullHistory}
            activeOpacity={0.7}
          >
            <Text style={styles.viewHistoryText}>View Full History</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.accent} />
          </TouchableOpacity>
        </View>
      )}

      {/* Custom Setup Button */}
      <View style={styles.section}>
        <View style={styles.sectionTitleContainer}>
          <Text style={styles.sectionTitle}>Custom Setup</Text>
          <View style={styles.sectionTitleLine} />
        </View>
        <TouchableOpacity
          style={styles.customSetupButton}
          onPress={handleCustomSetup}
          activeOpacity={0.7}
        >
          <View style={styles.customSetupContent}>
            <Ionicons name="settings-outline" size={24} color={colors.accent} />
            <Text style={styles.customSetupText}>Custom Game Setup</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Main render
  return (
    <LinearGradient
      colors={[colors.backgroundDark, colors.backgroundLight]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.gradientOverlay} />
      
      {/* Regular Header */}
      <Header title="Home" onMenuPress={handleMenuPress} />
      
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.content}
      >
        {/* Home Hub */}
        <View style={styles.menuContainer}>
          {renderHomeHub()}
        </View>
      </ScrollView>
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
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    minHeight: '100%',
  },
  menuContainer: {
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
    minHeight: 400,
  },
  // Home Hub Styles
  homeHub: {
    gap: spacing.xl,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginRight: spacing.md,
  },
  sectionTitleLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.borderTransparent,
  },
  quickStartButton: {
    backgroundColor: colors.cardBgTransparent,
    borderRadius: theme.borderRadius.lg,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.borderTransparent,
    height: 100,
    justifyContent: 'center',
    ...theme.shadows.md,
  },
  quickStartContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickStartIcon: {
    fontSize: 40,
    marginRight: 16,
  },
  quickStartText: {
    flex: 1,
  },
  quickStartLabel: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  quickStartDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  recentGamesList: {
    gap: spacing.md,
  },
  recentGameItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBgTransparent,
    padding: spacing.base,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderTransparent,
    height: 80,
    ...theme.shadows.sm,
  },
  recentGameInfo: {
    flex: 1,
  },
  recentGameType: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  recentGameDetails: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  recentGameStats: {
    alignItems: 'flex-end',
    marginRight: spacing.md,
  },
  recentGameScore: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.accent,
    marginBottom: 2,
  },
  recentGameTime: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  customSetupButton: {
    backgroundColor: colors.cardBgTransparent,
    borderRadius: theme.borderRadius.lg,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.borderTransparent,
    height: 100,
    justifyContent: 'center',
    ...theme.shadows.md,
  },
  customSetupContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customSetupText: {
    flex: 1,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
    marginLeft: spacing.md,
  },
  viewHistoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
  },
  viewHistoryText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.accent,
    marginRight: spacing.xs,
  },
});
