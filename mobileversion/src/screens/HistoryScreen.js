import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Header from '../components/Header';
import databaseService from '../services/database';

export default function HistoryScreen() {
  const navigation = useNavigation();
  const [gameHistory, setGameHistory] = useState([]);
  const [bestScores, setBestScores] = useState({});
  const [viewMode, setViewMode] = useState('history'); // 'history' or 'best'

  useEffect(() => {
    loadData();
  }, []);

  const handleMenuPress = () => {
    navigation.navigate('Menu');
  };

  const loadData = () => {
    const history = databaseService.getGameHistory(50);
    const scores = databaseService.getBestScores();
    setGameHistory(history);
    setBestScores(scores);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return minutes > 0 ? `${minutes}m ${secs}s` : `${secs}s`;
  };

  const renderHistoryItem = ({ item }) => (
    <View style={styles.historyItem}>
      <View style={styles.historyHeader}>
        <Text style={styles.historyMode}>
          {item.game_mode === 'standard' ? 'Country Flags' : 'Regional Flags'}
        </Text>
        <Text style={styles.historyDate}>{formatDate(item.created_at)}</Text>
      </View>
      <View style={styles.historyStats}>
        <View style={styles.historyStat}>
          <Text style={styles.historyStatLabel}>Score</Text>
          <Text style={styles.historyStatValue}>{item.score}</Text>
        </View>
        <View style={styles.historyStat}>
          <Text style={styles.historyStatLabel}>Accuracy</Text>
          <Text style={styles.historyStatValue}>{item.accuracy}%</Text>
        </View>
        <View style={styles.historyStat}>
          <Text style={styles.historyStatLabel}>Time</Text>
          <Text style={styles.historyStatValue}>{formatTime(item.time_elapsed)}</Text>
        </View>
      </View>
    </View>
  );

  const renderBestScoreItem = (key, score) => (
    <View key={key} style={styles.bestScoreItem}>
      <View style={styles.bestScoreHeader}>
        <Text style={styles.bestScoreMode}>
          {score.game_mode === 'standard' ? 'Country Flags' : 'Regional Flags'}
        </Text>
        <Text style={styles.bestScoreType}>{score.game_type}</Text>
      </View>
      <View style={styles.bestScoreValue}>
        <Text style={styles.bestScoreLabel}>Best Score</Text>
        <Text style={styles.bestScoreNumber}>{score.score}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header title="Game History" onMenuPress={handleMenuPress} />
      {/* Toggle Buttons */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, viewMode === 'history' && styles.toggleButtonActive]}
          onPress={() => setViewMode('history')}
        >
          <Text style={[styles.toggleText, viewMode === 'history' && styles.toggleTextActive]}>
            History
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, viewMode === 'best' && styles.toggleButtonActive]}
          onPress={() => setViewMode('best')}
        >
          <Text style={[styles.toggleText, viewMode === 'best' && styles.toggleTextActive]}>
            Best Scores
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {viewMode === 'history' ? (
          gameHistory.length > 0 ? (
            <FlatList
              data={gameHistory}
              renderItem={renderHistoryItem}
              keyExtractor={(item, index) => item.id?.toString() || index.toString()}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No game history yet</Text>
              <Text style={styles.emptySubtext}>Play some games to see your history here!</Text>
            </View>
          )
        ) : (
          Object.keys(bestScores).length > 0 ? (
            <View style={styles.bestScoresContainer}>
              {Object.entries(bestScores).map(([key, score]) =>
                renderBestScoreItem(key, score)
              )}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No best scores yet</Text>
              <Text style={styles.emptySubtext}>Complete games to set your best scores!</Text>
            </View>
          )
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
    borderRadius: 10,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  toggleButtonActive: {
    backgroundColor: '#007AFF',
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  toggleTextActive: {
    color: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  historyItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  historyMode: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  historyDate: {
    fontSize: 12,
    color: '#999',
  },
  historyStats: {
    flexDirection: 'row',
    gap: 20,
  },
  historyStat: {
    flex: 1,
  },
  historyStatLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  historyStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  bestScoresContainer: {
    gap: 15,
  },
  bestScoreItem: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bestScoreHeader: {
    marginBottom: 15,
  },
  bestScoreMode: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  bestScoreType: {
    fontSize: 14,
    color: '#666',
  },
  bestScoreValue: {
    alignItems: 'center',
  },
  bestScoreLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  bestScoreNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
