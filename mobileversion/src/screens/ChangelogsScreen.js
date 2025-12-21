import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import ActionButton from '../components/ActionButton';
import { colors, typography, spacing, theme } from '../theme';
import syncService from '../services/sync';

export default function ChangelogsScreen() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('flag'); // 'flag' or 'app'
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [localFlagsCount, setLocalFlagsCount] = useState(0);
  const [localRegionalFlagsCount, setLocalRegionalFlagsCount] = useState(0);

  useEffect(() => {
    loadSyncInfo();
  }, []);

  const loadSyncInfo = () => {
    try {
      setLocalFlagsCount(syncService.getLocalFlagsCount());
      setLocalRegionalFlagsCount(syncService.getLocalRegionalFlagsCount());
      
      // Get last sync time from sync metadata
      const syncMetadata = syncService.getLastSyncTime('flags');
      if (syncMetadata) {
        setLastSyncTime(new Date(syncMetadata));
      }
    } catch (error) {
      console.error('Error loading sync info:', error);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncStatus(null);

    try {
      const result = await syncService.fullSync();
      
      const syncResults = [];
      if (result.flags?.success) syncResults.push(`✓ ${result.flags.message}`);
      if (result.continents?.success) syncResults.push(`✓ ${result.continents.message}`);
      if (result.regionalCountries?.success) syncResults.push(`✓ ${result.regionalCountries.message}`);
      if (result.divisionTypes?.success) syncResults.push(`✓ ${result.divisionTypes.message}`);
      if (result.regionalFlags?.success) syncResults.push(`✓ ${result.regionalFlags.message}`);

      setSyncStatus({
        success: syncResults.length > 0,
        message: syncResults.join('\n'),
      });
      
      // Update last sync time
      const flagsSyncTime = syncService.getLastSyncTime('flags');
      if (flagsSyncTime) {
        setLastSyncTime(new Date(flagsSyncTime));
      }
      
      loadSyncInfo();
    } catch (error) {
      setSyncStatus({
        success: false,
        message: error.message || 'Sync failed',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Flag Changelogs content
  const renderFlagChangelogs = () => {
    // TODO: Fetch flag changelogs from API or local storage
    // For now, showing sync management and placeholder for changelogs
    return (
      <View style={styles.tabContent}>
        {/* Sync Management Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Flag Sync</Text>
          <View style={styles.syncCard}>
            <View style={styles.syncInfo}>
              <View style={styles.syncInfoRow}>
                <Text style={styles.syncInfoLabel}>Local Flags:</Text>
                <Text style={styles.syncInfoValue}>{localFlagsCount}</Text>
              </View>
              <View style={styles.syncInfoRow}>
                <Text style={styles.syncInfoLabel}>Regional Flags:</Text>
                <Text style={styles.syncInfoValue}>{localRegionalFlagsCount}</Text>
              </View>
              <View style={styles.syncInfoRow}>
                <Text style={styles.syncInfoLabel}>Last Sync:</Text>
                <Text style={styles.syncInfoValue}>{formatDate(lastSyncTime)}</Text>
              </View>
            </View>
            
            {syncStatus && (
              <View style={[
                styles.syncStatus,
                syncStatus.success ? styles.syncStatusSuccess : styles.syncStatusError
              ]}>
                <Ionicons
                  name={syncStatus.success ? 'checkmark-circle' : 'close-circle'}
                  size={20}
                  color={syncStatus.success ? colors.success : colors.error}
                />
                <Text style={[
                  styles.syncStatusText,
                  syncStatus.success ? styles.syncStatusTextSuccess : styles.syncStatusTextError
                ]}>
                  {syncStatus.message}
                </Text>
              </View>
            )}

            <ActionButton
              onPress={handleSync}
              disabled={isSyncing}
              style={styles.syncButton}
            >
              {isSyncing ? (
                <View style={styles.syncButtonContent}>
                  <ActivityIndicator size="small" color={colors.textPrimary} style={styles.syncSpinner} />
                  <Text>Syncing...</Text>
                </View>
              ) : (
                '🔄 Sync Flags'
              )}
            </ActionButton>
          </View>
        </View>

        {/* Flag Changelogs Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Flag Changelogs</Text>
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateIcon}>📋</Text>
            <Text style={styles.emptyStateTitle}>No changelogs available</Text>
            <Text style={styles.emptyStateDescription}>
              Flag changelogs will appear here when flags are added, updated, or removed.
            </Text>
          </View>
        </View>
      </View>
    );
  };

  // App Changelogs content
  const renderAppChangelogs = () => {
    // TODO: Fetch app changelogs from API or local storage
    // For now, showing placeholder
    const appChangelogs = [
      {
        version: '1.0.0',
        date: new Date('2024-01-01'),
        changes: [
          'Initial release',
          'Flag quiz game with multiple modes',
          'Regional flags support',
          'Offline mode with local database',
        ],
      },
    ];

    return (
      <View style={styles.tabContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Changelogs</Text>
          {appChangelogs.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyStateIcon}>📱</Text>
              <Text style={styles.emptyStateTitle}>No changelogs available</Text>
              <Text style={styles.emptyStateDescription}>
                App changelogs will appear here when new versions are released.
              </Text>
            </View>
          ) : (
            <View style={styles.changelogList}>
              {appChangelogs.map((changelog, index) => (
                <View key={index} style={styles.changelogItem}>
                  <View style={styles.changelogHeader}>
                    <Text style={styles.changelogVersion}>Version {changelog.version}</Text>
                    <Text style={styles.changelogDate}>
                      {changelog.date.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Text>
                  </View>
                  <View style={styles.changelogChanges}>
                    {changelog.changes.map((change, changeIndex) => (
                      <View key={changeIndex} style={styles.changelogChangeItem}>
                        <Text style={styles.changelogChangeBullet}>•</Text>
                        <Text style={styles.changelogChangeText}>{change}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <LinearGradient
      colors={[colors.backgroundDark, colors.backgroundLight]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.gradientOverlay} />
      <Header title="Changelogs" onMenuPress={() => navigation.goBack()} showBack={true} />
      
      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'flag' && styles.tabActive]}
          onPress={() => setActiveTab('flag')}
          activeOpacity={0.7}
        >
          <Ionicons
            name="flag-outline"
            size={20}
            color={activeTab === 'flag' ? colors.accent : colors.textSecondary}
          />
          <Text style={[
            styles.tabText,
            activeTab === 'flag' && styles.tabTextActive
          ]}>
            Flag Changelogs
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'app' && styles.tabActive]}
          onPress={() => setActiveTab('app')}
          activeOpacity={0.7}
        >
          <Ionicons
            name="phone-portrait-outline"
            size={20}
            color={activeTab === 'app' ? colors.accent : colors.textSecondary}
          />
          <Text style={[
            styles.tabText,
            activeTab === 'app' && styles.tabTextActive
          ]}>
            App Changelogs
          </Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.scrollView, styles.content]}>
        {activeTab === 'flag' ? renderFlagChangelogs() : renderAppChangelogs()}
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.cardBgTransparent,
    marginHorizontal: spacing.xl,
    marginTop: spacing.md,
    marginBottom: spacing.base,
    borderRadius: theme.borderRadius.md,
    padding: spacing.xs,
    borderWidth: 1,
    borderColor: colors.borderTransparent,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    borderRadius: theme.borderRadius.sm,
    gap: spacing.xs,
  },
  tabActive: {
    backgroundColor: colors.cardBg,
  },
  tabText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.accent,
    fontWeight: typography.fontWeight.semiBold,
  },
  tabContent: {
    gap: spacing.xl,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.base,
  },
  syncCard: {
    backgroundColor: colors.cardBgTransparent,
    borderRadius: theme.borderRadius.lg,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.borderTransparent,
    ...theme.shadows.md,
  },
  syncInfo: {
    gap: spacing.base,
    marginBottom: spacing.base,
  },
  syncInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  syncInfoLabel: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
  },
  syncInfoValue: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
  },
  syncStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.base,
    borderRadius: theme.borderRadius.md,
    marginBottom: spacing.base,
    gap: spacing.sm,
  },
  syncStatusSuccess: {
    backgroundColor: colors.success + '20',
  },
  syncStatusError: {
    backgroundColor: colors.error + '20',
  },
  syncStatusText: {
    fontSize: typography.fontSize.sm,
    flex: 1,
  },
  syncStatusTextSuccess: {
    color: colors.success,
  },
  syncStatusTextError: {
    color: colors.error,
  },
  syncButton: {
    marginTop: spacing.base,
  },
  syncButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  syncSpinner: {
    marginRight: spacing.xs,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['4xl'],
    paddingHorizontal: spacing.xl,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: spacing.base,
  },
  emptyStateTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptyStateDescription: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
  },
  changelogList: {
    gap: spacing.base,
  },
  changelogItem: {
    backgroundColor: colors.cardBgTransparent,
    borderRadius: theme.borderRadius.lg,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.borderTransparent,
    ...theme.shadows.md,
  },
  changelogHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.base,
    paddingBottom: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderTransparent,
  },
  changelogVersion: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.accent,
  },
  changelogDate: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  changelogChanges: {
    gap: spacing.sm,
  },
  changelogChangeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  changelogChangeBullet: {
    fontSize: typography.fontSize.base,
    color: colors.accent,
    marginTop: 2,
  },
  changelogChangeText: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
  },
});

