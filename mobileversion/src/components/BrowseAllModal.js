import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, theme } from '../theme';

export default function BrowseAllModal({
  visible,
  onClose,
  countries,
  isLoading,
  onCountrySelect,
}) {
  if (!visible) return null;

  const activeCountries = countries.filter(country => country.is_active);

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.browseAllModal}>
        <View style={styles.browseAllModalHeader}>
          <Text style={styles.browseAllModalTitle}>All Regional Countries</Text>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={onClose}
          >
            <Ionicons name="close" size={28} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.browseAllModalBody}>
          {isLoading ? (
            <View style={styles.emptyStateContainer}>
              <ActivityIndicator size={48} color={colors.accent} />
              <Text style={styles.emptyStateTitle}>Loading countries...</Text>
              <Text style={styles.emptyStateDescription}>
                Please wait while we fetch available countries
              </Text>
            </View>
          ) : countries.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyStateIcon}>🌍</Text>
              <Text style={styles.emptyStateTitle}>No countries found</Text>
              <Text style={styles.emptyStateDescription}>
                Please check your data or try refreshing the page
              </Text>
            </View>
          ) : activeCountries.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyStateIcon}>🚫</Text>
              <Text style={styles.emptyStateTitle}>No active countries</Text>
              <Text style={styles.emptyStateDescription}>
                All countries are currently inactive. Please contact an administrator.
              </Text>
            </View>
          ) : (
            <View style={styles.regionalCountryList}>
              {activeCountries.map((country, index) => (
                <TouchableOpacity
                  key={country.id.toString()}
                  style={[
                    styles.regionalCountryItem,
                    index < activeCountries.length - 1 && styles.regionalCountryItemSpacing
                  ]}
                  onPress={() => {
                    onCountrySelect(country);
                    onClose();
                  }}
                  activeOpacity={0.7}
                >
                  <Image
                    source={{ uri: country.flag_image_url }}
                    style={styles.regionalCountryFlag}
                    defaultSource={require('../../assets/icon.png')}
                  />
                  <View style={styles.regionalCountryInfo}>
                    <Text style={styles.regionalCountryName}>{country.name}</Text>
                    <Text style={styles.regionalCountryCount}>
                      {country.total_regional_flags || 0} regional flags
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
  },
  browseAllModal: {
    backgroundColor: colors.cardBg,
    borderRadius: theme.borderRadius.lg,
    width: '90%',
    maxWidth: 600,
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: colors.borderTransparent,
    ...theme.shadows.lg,
  },
  browseAllModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  browseAllModalTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  modalCloseButton: {
    padding: spacing.sm,
  },
  browseAllModalBody: {
    maxHeight: 500,
    padding: spacing.xl,
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
  regionalCountryList: {
    maxHeight: 400,
  },
  regionalCountryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.base,
    backgroundColor: colors.cardBgTransparent,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderTransparent,
    marginBottom: spacing.md,
  },
  regionalCountryItemSpacing: {
    marginBottom: spacing.md,
  },
  regionalCountryFlag: {
    width: 50,
    height: 30,
    borderRadius: theme.borderRadius.sm,
    marginRight: spacing.base,
  },
  regionalCountryInfo: {
    flex: 1,
  },
  regionalCountryName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  regionalCountryCount: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
});

