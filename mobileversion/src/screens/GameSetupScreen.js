import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import MenuButton from '../components/MenuButton';
import ActionButton from '../components/ActionButton';
import ContinentButton from '../components/ContinentButton';
import ProgressBar from '../components/ProgressBar';
import BrowseAllModal from '../components/BrowseAllModal';
import { colors, typography, spacing, theme } from '../theme';
import flagLoader from '../services/flagLoader';

export default function GameSetupScreen({ route }) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  
  // Get initial settings from route params if provided
  const initialSettings = route?.params?.initialSettings || {};
  
  // Menu state
  const [menuStep, setMenuStep] = useState(initialSettings.menuStep || 1); // Start at mode selection
  const [gameMode, setGameMode] = useState(initialSettings.gameMode || null);
  const [gameType, setGameType] = useState(initialSettings.gameType || null);
  const [regionalGameType, setRegionalGameType] = useState(initialSettings.regionalGameType || null);
  
  // Standard mode settings
  const [selectedContinent, setSelectedContinent] = useState(initialSettings.selectedContinent || 'world');
  const [includeTerritories, setIncludeTerritories] = useState(initialSettings.includeTerritories || false);
  const [infiniteMode, setInfiniteMode] = useState(initialSettings.infiniteMode || false);
  const [timeAttackMode, setTimeAttackMode] = useState(initialSettings.timeAttackMode || false);
  const [typingMode, setTypingMode] = useState(initialSettings.typingMode || false);
  
  // Regional mode settings
  const [regionalCountries, setRegionalCountries] = useState([]);
  const [featuredCountries, setFeaturedCountries] = useState([]);
  const [selectedRegionalCountry, setSelectedRegionalCountry] = useState(initialSettings.selectedRegionalCountry || null);
  const [regionalDivisionTypes, setRegionalDivisionTypes] = useState([]);
  const [selectedDivisionTypes, setSelectedDivisionTypes] = useState(initialSettings.selectedDivisionTypes || []);
  const [regionalInfiniteMode, setRegionalInfiniteMode] = useState(initialSettings.regionalInfiniteMode || false);
  const [regionalTypingMode, setRegionalTypingMode] = useState(initialSettings.regionalTypingMode || false);
  
  // Loading states
  const [isLoadingRegionalCountries, setIsLoadingRegionalCountries] = useState(false);
  const [isLoadingFeaturedCountries, setIsLoadingFeaturedCountries] = useState(false);
  const [isLoadingDivisionTypes, setIsLoadingDivisionTypes] = useState(false);
  
  // Modal states
  const [showAllCountriesModal, setShowAllCountriesModal] = useState(false);

  // Load featured countries when entering regional mode
  useEffect(() => {
    if (gameMode === 'regional' && menuStep === 'regional-2') {
      loadFeaturedCountries();
    }
  }, [gameMode, menuStep]);

  // Load all countries when opening Browse All modal
  useEffect(() => {
    if (showAllCountriesModal && regionalCountries.length === 0) {
      loadAllRegionalCountries();
    }
  }, [showAllCountriesModal]);

  // Load division types when country is selected
  useEffect(() => {
    if (selectedRegionalCountry) {
      loadDivisionTypes(selectedRegionalCountry.id);
    }
  }, [selectedRegionalCountry]);

  // Auto-select division type if only one is available
  useEffect(() => {
    if (selectedRegionalCountry && regionalDivisionTypes.length > 0 && !isLoadingDivisionTypes) {
      const countryDivisionTypes = regionalDivisionTypes.filter(
        dt => dt.country_id === selectedRegionalCountry.id && dt.is_active
      );
      
      if (countryDivisionTypes.length === 1 && menuStep === 'regional-3') {
        // Auto-select the single division type and skip to settings
        setSelectedDivisionTypes([countryDivisionTypes[0].id]);
        setMenuStep('regional-4');
      }
    }
  }, [selectedRegionalCountry, regionalDivisionTypes, isLoadingDivisionTypes, menuStep]);

  const loadFeaturedCountries = async () => {
    setIsLoadingFeaturedCountries(true);
    try {
      const countries = await flagLoader.getFeaturedRegionalCountries();
      setFeaturedCountries(countries);
    } catch (error) {
      console.error('Error loading featured countries:', error);
      setFeaturedCountries([]);
    } finally {
      setIsLoadingFeaturedCountries(false);
    }
  };

  const loadAllRegionalCountries = async () => {
    setIsLoadingRegionalCountries(true);
    try {
      const countries = await flagLoader.getAllRegionalCountries();
      setRegionalCountries(countries);
    } catch (error) {
      console.error('Error loading all regional countries:', error);
      setRegionalCountries([]);
    } finally {
      setIsLoadingRegionalCountries(false);
    }
  };

  const loadDivisionTypes = async (countryId) => {
    setIsLoadingDivisionTypes(true);
    try {
      const divisionTypes = await flagLoader.getDivisionTypes(countryId);
      setRegionalDivisionTypes(divisionTypes);
    } catch (error) {
      console.error('Error loading division types:', error);
    } finally {
      setIsLoadingDivisionTypes(false);
    }
  };

  const startGame = () => {
    // Build game settings object - ensure it's completely serializable
    // Only include primitive values and arrays of primitives
    const isRegionalMode = gameMode === 'regional';
    
    // Extract only primitive values to ensure serializability
    const cleanSettings = {
      gameMode: isRegionalMode ? 'regional' : 'standard',
      gameType: isRegionalMode ? (regionalGameType || null) : (gameType || null),
      selectedContinent: isRegionalMode ? null : (selectedContinent || 'world'),
      includeTerritories: isRegionalMode ? false : Boolean(includeTerritories),
      selectedCountryId: isRegionalMode ? (selectedRegionalCountry?.id || null) : null,
      selectedDivisionTypes: isRegionalMode 
        ? (Array.isArray(selectedDivisionTypes) ? selectedDivisionTypes.map(id => Number(id)) : [])
        : [],
      infiniteMode: Boolean(isRegionalMode ? regionalInfiniteMode : infiniteMode),
      timeAttackMode: Boolean(timeAttackMode),
      typingMode: Boolean(isRegionalMode ? regionalTypingMode : typingMode),
    };

    navigation.navigate('Game', { gameSettings: cleanSettings });
  };

  // Get progress steps based on game mode
  const getProgressSteps = () => {
    const baseSteps = [
      { id: 'home', name: 'home', icon: 'home', iconSize: 20 },
      { id: 1, name: 'mode' }, // Always show mode step
    ];
    
    if (gameMode === 'regional') {
      return [
        ...baseSteps,
        { id: 'regional-1', name: 'gameType' },
        { id: 'regional-2', name: 'country' },
        { id: 'regional-3', name: 'divisionType' },
        { id: 'regional-4', name: 'settings' },
      ];
    } else {
      // When gameMode is null or 'standard', show standard path (default)
      return [
        ...baseSteps,
        { id: 2, name: 'gameType' },
        { id: 3, name: 'continent' },
        { id: 4, name: 'settings' },
      ];
    }
  };

  // Get screen name based on menu step
  const getScreenName = () => {
    if (menuStep === 1) return 'Select Mode';
    if (menuStep === 2) return 'Select Game Type';
    if (menuStep === 3) return 'Select Region';
    if (menuStep === 4) return 'Game Settings';
    if (menuStep === 'regional-1') return 'Select Game Type';
    if (menuStep === 'regional-2') return 'Select Country';
    if (menuStep === 'regional-3') return 'Select Divisions';
    if (menuStep === 'regional-4') return 'Game Settings';
    return 'Game Setup';
  };

  // Handle progress step click
  const handleProgressStepClick = (stepId) => {
    // Handle home step click - navigate to Home screen
    if (stepId === 'home') {
      navigation.navigate('Home');
      return;
    }
    
    const steps = getProgressSteps();
    const stepIndex = steps.findIndex(step => step.id === stepId);
    const currentIndex = steps.findIndex(step => step.id === menuStep);
    
    // Only allow jumping to completed steps or the current step
    if (stepIndex <= currentIndex) {
      setMenuStep(stepId);
    }
  };

  // Get current action button for the current step
  const getCurrentActionButton = () => {
    if (menuStep === 4) {
      return {
        label: 'Start Game',
        onPress: () => startGame(),
      };
    }
    if (menuStep === 'regional-2' && !isLoadingFeaturedCountries && featuredCountries.length > 0) {
      return {
        label: '🌍 Browse All',
        onPress: () => {
          setShowAllCountriesModal(true);
          if (regionalCountries.length === 0) {
            loadAllRegionalCountries();
          }
        },
      };
    }
    if (menuStep === 'regional-3') {
      return {
        label: 'Continue',
        onPress: () => setMenuStep('regional-4'),
        disabled: selectedDivisionTypes.length === 0,
      };
    }
    if (menuStep === 'regional-4') {
      return {
        label: 'Start Game',
        onPress: () => startGame(),
      };
    }
    return null;
  };

  const handleBackPress = () => {
    if (menuStep === 1) {
      navigation.goBack();
    } else {
      // Navigate to previous step
      const steps = getProgressSteps();
      const currentIndex = steps.findIndex(step => step.id === menuStep);
      if (currentIndex > 0) {
        setMenuStep(steps[currentIndex - 1].id);
      } else {
        navigation.goBack();
      }
    }
  };

  // Render mode selection (step 1)
  const renderModeSelection = () => (
    <View style={styles.menuSection}>
      <View style={styles.modeGrid}>
        <MenuButton
          type="mode"
          icon="🌐"
          label="Country Flags"
          description="Play with national flags and territories"
          isSelected={gameMode === 'standard'}
          onPress={() => {
            setGameMode('standard');
            setMenuStep(2);
          }}
        />
        <MenuButton
          type="mode"
          icon="🏳️"
          label="Regional Flags"
          description="Play with state, province, and regional flags"
          isSelected={gameMode === 'regional'}
          onPress={() => {
            setGameMode('regional');
            setMenuStep('regional-1');
          }}
        />
      </View>
    </View>
  );

  // Render game type selection for standard mode (step 2)
  const renderGameTypeSelection = () => (
    <View style={styles.menuSection}>
      <View style={styles.gameTypeGrid}>
        <MenuButton
          type="gameType"
          icon="🎯"
          label="Flag to Country"
          description="Guess the country name from the flag"
          isSelected={gameType === 'flag-to-country'}
          onPress={() => {
            setGameType('flag-to-country');
            setMenuStep(3);
          }}
        />
        <MenuButton
          type="gameType"
          icon="🗺️"
          label="Country to Flag"
          description="Guess the flag from the country name"
          isSelected={gameType === 'country-to-flag'}
          onPress={() => {
            setGameType('country-to-flag');
            setMenuStep(3);
          }}
        />
      </View>
    </View>
  );

  // Render continent selection (step 3)
  const renderContinentSelection = () => {
    const continents = [
      { id: 'world', label: 'World' },
      { id: '1', label: 'Africa' },
      { id: '2', label: 'Asia' },
      { id: '3', label: 'Europe' },
      { id: '4', label: 'North America' },
      { id: '5', label: 'South America' },
      { id: '6', label: 'Oceania' },
    ];

    const screenWidth = Dimensions.get('window').width;
    const screenHeight = Dimensions.get('window').height;
    const padding = spacing.xl * 2; // Left and right padding
    const gap = spacing.xl;
    const availableWidth = screenWidth - padding;
    const itemWidth = (availableWidth - gap) / 2; // 2 columns with gap
    // Calculate height to fill available space - account for progress bar and padding
    const availableHeight = screenHeight - 200; // Approximate space for progress bar and padding
    const itemHeight = Math.max(availableHeight / 4, 100); // At least 4 rows, min 100px per item

    return (
      <View style={styles.menuSection}>
        <View style={styles.continentGrid}>
          {continents.map(continent => (
            <View key={continent.id} style={[styles.continentGridItem, { width: itemWidth, minHeight: itemHeight }]}>
              <ContinentButton
                label={continent.label}
                isSelected={selectedContinent === continent.id}
                onPress={() => {
                  setSelectedContinent(continent.id);
                  setMenuStep(4);
                }}
              />
            </View>
          ))}
        </View>
      </View>
    );
  };

  // Render settings for standard mode (step 4)
  const renderSettings = () => (
    <View style={styles.menuSection}>
      <ScrollView 
        style={styles.settingsScrollContainer}
        contentContainerStyle={styles.settingsGrid}
        showsVerticalScrollIndicator={true}
      >
        <MenuButton
          type="setting"
          icon="🏝️"
          label="Include Territories"
          description="Play with territories and dependencies"
          isSelected={includeTerritories}
          onPress={() => setIncludeTerritories(!includeTerritories)}
        />
        <MenuButton
          type="setting"
          icon="⏱️"
          label="Time Attack Mode"
          description="Get the highest score in 1 minute"
          isSelected={timeAttackMode}
          onPress={() => {
            setTimeAttackMode(!timeAttackMode);
            if (!timeAttackMode) {
              setInfiniteMode(true);
            } else {
              setInfiniteMode(false);
            }
          }}
        />
        <MenuButton
          type="setting"
          icon="♾️"
          label="Infinite Mode"
          description="Play endlessly without running out of flags"
          isSelected={infiniteMode}
          onPress={() => setInfiniteMode(!infiniteMode)}
          disabled={timeAttackMode}
        />
        {gameType === 'flag-to-country' && (
          <MenuButton
            type="setting"
            icon="⌨️"
            label="Typing Mode"
            description="Type the answer instead of multiple choice"
            isSelected={typingMode}
            onPress={() => setTypingMode(!typingMode)}
          />
        )}
      </ScrollView>
    </View>
  );

  // Render game type selection for regional mode (regional-1)
  const renderRegionalGameTypeSelection = () => (
    <View style={styles.menuSection}>
      <View style={styles.gameTypeGrid}>
        <MenuButton
          type="gameType"
          icon="🎯"
          label="Flag to Region"
          description="Guess the region name from the flag"
          isSelected={regionalGameType === 'flag-to-region'}
          onPress={() => {
            setRegionalGameType('flag-to-region');
            setMenuStep('regional-2');
          }}
        />
        <MenuButton
          type="gameType"
          icon="🗺️"
          label="Region to Flag"
          description="Guess the flag from the region name"
          isSelected={regionalGameType === 'region-to-flag'}
          onPress={() => {
            setRegionalGameType('region-to-flag');
            setMenuStep('regional-2');
          }}
        />
      </View>
    </View>
  );

  // Render regional country selection (regional-2)
  const renderRegionalCountrySelection = () => {
    return (
      <View style={styles.menuSection}>
        {isLoadingFeaturedCountries ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size={48} color={colors.accent} />
            <Text style={styles.loadingText}>Loading featured countries...</Text>
          </View>
        ) : featuredCountries.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateIcon}>⭐</Text>
            <Text style={styles.emptyStateTitle}>No featured countries</Text>
            <Text style={styles.emptyStateDescription}>
              No countries are currently marked as featured. Please contact an administrator.
            </Text>
          </View>
        ) : (
          <>
            <ScrollView 
              style={styles.regionalCountryListContainer}
              contentContainerStyle={styles.regionalCountryList}
              showsVerticalScrollIndicator={true}
            >
              {featuredCountries
                .filter(country => country.is_active)
                .map((item, index) => (
                  <TouchableOpacity
                    key={item.id.toString()}
                    style={styles.regionalCountryItem}
                    onPress={() => {
                      setSelectedRegionalCountry(item);
                      // Division types will be loaded via useEffect, and auto-selection will happen if there's only one
                      // For now, just move to regional-3 - the useEffect will handle skipping if needed
                      setMenuStep('regional-3');
                    }}
                    activeOpacity={0.7}
                  >
                    <Image
                      source={{ uri: item.flag_image_url }}
                      style={styles.regionalCountryFlag}
                      defaultSource={require('../../assets/icon.png')}
                    />
                    <View style={styles.regionalCountryInfo}>
                      <Text style={styles.regionalCountryName}>{item.name}</Text>
                      <Text style={styles.regionalCountryCount}>
                        {item.total_regional_flags || 0} regional flags
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                ))}
            </ScrollView>
          </>
        )}
      </View>
    );
  };

  // Render division type selection (regional-3)
  const renderDivisionTypeSelection = () => {
    const countryDivisionTypes = regionalDivisionTypes.filter(
      dt => dt.country_id === selectedRegionalCountry?.id
    );

    if (isLoadingDivisionTypes) {
      return (
        <View style={styles.menuSection}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size={48} color={colors.accent} />
            <Text style={styles.loadingText}>Loading division types...</Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.menuSection}>
        <View style={styles.divisionTypeList}>
          {countryDivisionTypes.map((item, index) => (
            <TouchableOpacity
              key={item.id.toString()}
              style={[
                styles.divisionTypeItem,
                selectedDivisionTypes.includes(item.id) && styles.divisionTypeItemSelected,
                index < countryDivisionTypes.length - 1 && styles.divisionTypeItemSpacing
              ]}
              onPress={() => {
                if (selectedDivisionTypes.includes(item.id)) {
                  setSelectedDivisionTypes(selectedDivisionTypes.filter(id => id !== item.id));
                } else {
                  setSelectedDivisionTypes([...selectedDivisionTypes, item.id]);
                }
              }}
            >
              <View style={styles.divisionTypeInfo}>
                <Text style={styles.divisionTypeName}>{item.type_name}</Text>
                <Text style={styles.divisionTypeCount}>
                  {item.flag_count || 0} regional flags
                </Text>
              </View>
              {selectedDivisionTypes.includes(item.id) && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  // Render settings for regional mode (regional-4)
  const renderRegionalSettings = () => (
    <View style={styles.menuSection}>
      <ScrollView 
        style={styles.settingsScrollContainer}
        contentContainerStyle={styles.settingsGrid}
        showsVerticalScrollIndicator={true}
      >
        <MenuButton
          type="setting"
          icon="⏱️"
          label="Time Attack Mode"
          description="Get the highest score in 1 minute"
          isSelected={timeAttackMode}
          onPress={() => {
            setTimeAttackMode(!timeAttackMode);
            if (!timeAttackMode) {
              setRegionalInfiniteMode(true);
            } else {
              setRegionalInfiniteMode(false);
            }
          }}
        />
        <MenuButton
          type="setting"
          icon="♾️"
          label="Infinite Mode"
          description="Play endlessly without running out of flags"
          isSelected={regionalInfiniteMode}
          onPress={() => setRegionalInfiniteMode(!regionalInfiniteMode)}
          disabled={timeAttackMode}
        />
        {regionalGameType === 'flag-to-region' && (
          <MenuButton
            type="setting"
            icon="⌨️"
            label="Typing Mode"
            description="Type the answer instead of multiple choice"
            isSelected={regionalTypingMode}
            onPress={() => setRegionalTypingMode(!regionalTypingMode)}
          />
        )}
      </ScrollView>
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
      
      {/* Fixed Progress Bar */}
      <View style={[styles.fixedProgressBar, { paddingTop: insets.top }]}>
        <View style={styles.progressBarHeader}>
          <View style={styles.progressBarContainer}>
            <ProgressBar
              steps={getProgressSteps()}
              currentStep={menuStep}
              onStepPress={handleProgressStepClick}
            />
          </View>
        </View>
      </View>
      
      <View 
        style={styles.scrollView} 
      >
        {/* Menu Steps */}
        <View style={[
          styles.menuContainer, 
          styles.contentWithProgressBar,
          getCurrentActionButton() && styles.contentWithButton
        ]}>
          {menuStep === 1 && renderModeSelection()}
          {menuStep === 2 && renderGameTypeSelection()}
          {menuStep === 3 && renderContinentSelection()}
          {menuStep === 4 && renderSettings()}
          {menuStep === 'regional-1' && renderRegionalGameTypeSelection()}
          {menuStep === 'regional-2' && renderRegionalCountrySelection()}
          {menuStep === 'regional-3' && renderDivisionTypeSelection()}
          {menuStep === 'regional-4' && renderRegionalSettings()}
        </View>
      </View>

      {/* Fixed Action Button at Bottom */}
      {getCurrentActionButton() && (
        <View style={[styles.fixedButtonContainer, { paddingBottom: insets.bottom }]}>
          <View style={styles.fixedButtonWrapper}>
            <ActionButton 
              onPress={getCurrentActionButton().onPress}
              disabled={getCurrentActionButton().disabled}
              style={styles.fullWidthButton}
            >
              {getCurrentActionButton().label}
            </ActionButton>
          </View>
        </View>
      )}

      {/* Browse All Modal */}
      <BrowseAllModal
        visible={showAllCountriesModal}
        onClose={() => setShowAllCountriesModal(false)}
        countries={regionalCountries}
        isLoading={isLoadingRegionalCountries}
        onCountrySelect={(country) => {
          setSelectedRegionalCountry(country);
          // Division types will be loaded via useEffect, and auto-selection will happen if there's only one
          // For now, just move to regional-3 - the useEffect will handle skipping if needed
          setMenuStep('regional-3');
        }}
      />
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
  contentWithProgressBar: {
    flex: 1,
    padding: spacing.xl,
    paddingTop: 100, // Space for fixed progress bar with hamburger + safe area
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentWithButton: {
    paddingBottom: 100, // Space for fixed button at bottom (only when button exists)
  },
  fixedProgressBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(108, 92, 231, 0.2)',
  },
  progressBarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    justifyContent: 'center',
  },
  progressBarContainer: {
    flex: 1,
    maxWidth: 1200,
  },
  menuContainer: {
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuSection: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  sectionTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  backButton: {
    marginBottom: spacing.base,
    paddingVertical: spacing.sm,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontSize: typography.fontSize.base,
    color: colors.accent,
    fontWeight: typography.fontWeight.medium,
  },
  modeGrid: {
    flexDirection: 'row',
    gap: spacing['3xl'],
    width: '100%',
    maxWidth: 900,
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  gameTypeGrid: {
    flexDirection: 'row',
    gap: spacing['3xl'],
    width: '100%',
    maxWidth: 900,
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  continentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xl,
    width: '100%',
    maxWidth: 1200,
    justifyContent: 'center',
  },
  continentGridItem: {
    minWidth: 150,
    flex: 1,
  },
  settingsScrollContainer: {
    maxHeight: 500,
    width: '100%',
    alignSelf: 'center',
  },
  settingsGrid: {
    gap: spacing.xl,
    width: '100%',
    maxWidth: 1200,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingBottom: spacing.md,
  },
  settingsButtons: {
    marginTop: spacing['2xl'],
    alignItems: 'center',
    width: '100%',
  },
  fixedButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(108, 92, 231, 0.2)',
    paddingTop: spacing.md,
    paddingHorizontal: spacing.xl,
    zIndex: 999,
  },
  fixedButtonWrapper: {
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
  },
  fullWidthButton: {
    width: '100%',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
  },
  loadingText: {
    marginTop: spacing.base,
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
  },
  regionalCountryListContainer: {
    maxHeight: 500,
    width: '100%',
    alignSelf: 'center',
  },
  regionalCountryList: {
    gap: spacing.md,
    paddingBottom: spacing.md,
    alignItems: 'center',
  },
  regionalCountryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.base,
    backgroundColor: colors.cardBgTransparent,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderTransparent,
    width: '100%',
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
  divisionTypeList: {
    maxHeight: 600,
    width: '100%',
    alignItems: 'center',
  },
  divisionTypeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.base,
    backgroundColor: colors.cardBgTransparent,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderTransparent,
    marginBottom: spacing.md,
  },
  divisionTypeItemSpacing: {
    marginBottom: spacing.md,
  },
  divisionTypeItemSelected: {
    backgroundColor: colors.cardBg,
    borderColor: colors.accent,
    borderWidth: 2,
  },
  divisionTypeInfo: {
    flex: 1,
  },
  divisionTypeName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  divisionTypeCount: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  checkmark: {
    fontSize: typography.fontSize['2xl'],
    color: colors.accent,
    fontWeight: typography.fontWeight.bold,
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
  browseAllSection: {
    marginTop: spacing.xl,
    alignItems: 'center',
  },
});

