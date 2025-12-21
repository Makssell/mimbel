import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Switch,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Header from '../components/Header';
import syncService from '../services/sync';
import databaseService from '../services/database';

export default function SettingsScreen() {
  const navigation = useNavigation();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [localFlagsCount, setLocalFlagsCount] = useState(0);
  const [localRegionalFlagsCount, setLocalRegionalFlagsCount] = useState(0);

  useEffect(() => {
    loadStats();
  }, []);

  const handleMenuPress = () => {
    navigation.navigate('Menu');
  };

  const loadStats = () => {
    try {
      setLocalFlagsCount(syncService.getLocalFlagsCount());
      setLocalRegionalFlagsCount(syncService.getLocalRegionalFlagsCount());
    } catch (error) {
      console.error('Error loading stats:', error);
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
      loadStats();
    } catch (error) {
      setSyncStatus({
        success: false,
        message: error.message || 'Sync failed',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to clear all game history? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            const result = databaseService.clearGameHistory();
            if (result.success) {
              Alert.alert('Success', 'Game history cleared');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Header title="Settings" onMenuPress={handleMenuPress} />
      <View style={[styles.scrollView, styles.content]}>
        {/* Sync Section */}
        <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Sync</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Local Flags:</Text>
          <Text style={styles.infoValue}>{localFlagsCount}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Regional Flags:</Text>
          <Text style={styles.infoValue}>{localRegionalFlagsCount}</Text>
        </View>

        {syncStatus && (
          <View style={[
            styles.statusBox,
            syncStatus.success ? styles.statusSuccess : styles.statusError
          ]}>
            <Text style={styles.statusText}>{syncStatus.message}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.button, styles.primaryButton, isSyncing && styles.buttonDisabled]}
          onPress={handleSync}
          disabled={isSyncing}
        >
          {isSyncing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Sync Now</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Settings Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Audio</Text>
            <Text style={styles.settingDescription}>Enable sound effects</Text>
          </View>
          <Switch
            value={audioEnabled}
            onValueChange={setAudioEnabled}
            trackColor={{ false: '#767577', true: '#007AFF' }}
          />
        </View>
      </View>

      {/* Data Management */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Management</Text>
        
        <TouchableOpacity
          style={[styles.button, styles.dangerButton]}
          onPress={handleClearHistory}
        >
          <Text style={styles.buttonText}>Clear Game History</Text>
        </TouchableOpacity>
      </View>

      {/* About Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.aboutText}>
          Mimbel Mobile v1.0.0{'\n'}
          Flag guessing quiz game
        </Text>
      </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
  },
  infoValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBox: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  statusSuccess: {
    backgroundColor: '#d4edda',
  },
  statusError: {
    backgroundColor: '#f8d7da',
  },
  statusText: {
    fontSize: 14,
    color: '#155724',
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  dangerButton: {
    backgroundColor: '#dc3545',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
  },
  aboutText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});
