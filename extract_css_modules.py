#!/usr/bin/env python3
"""
CSS Module Extraction Script
Extracts styles from game.module.css into component-specific CSS module files.
"""

import re
from pathlib import Path

# Define style mappings - which classes belong to which component
STYLE_MAPPINGS = {
    'shared': [
        'container', 'title', 'button', 'mainButton', 'secondaryButton',
        'loadingSpinner', 'message', 'transitioning', 'correctButton', 'incorrectButton',
        'correctInput', 'incorrectInput', 'correct', 'incorrect', 'gameOver',
        'preloadIndicator'
    ],
    'startScreen': [
        'startScreen', 'menuContainer', 'contentArea', 'fixedProgressBar',
        'modeSelectionSection', 'modeSelectionGrid', 'modeButton', 'modeIcon', 'modeLabel', 'modeDescription',
        'gameTypeSection', 'gameTypeGrid', 'menuButton', 'gameTypeButton', 'selectedGameType',
        'continentSection', 'continentGrid', 'continentButton', 'selectedContinent',
        'settingsSection', 'settingsGrid', 'settingOption', 'settingOptionActive', 'settingIcon', 'settingLabel', 'settingDescription',
        'settingsButtons', 'backButton',
        'regionalCountrySection', 'regionalCountryList', 'regionalCountryItem', 'regionalCountryFlag', 'regionalCountryFlagFallback',
        'regionalCountryInfo', 'regionalCountryName', 'regionalCountryCount', 'regionalCountryArrow', 'regionalCountryLoading',
        'divisionTypeSection', 'divisionTypeList', 'divisionTypeItem', 'divisionTypeCheckbox',
        'divisionTypeInfo', 'divisionTypeName', 'divisionTypeCount', 'divisionTypeIcon',
        'emptyState', 'emptyStateIcon', 'emptyStateTitle', 'emptyStateDescription',
        'browseAllSection', 'browseAllButton', 'gameTypeDesc'
    ],
    'gameScreen': [
        'gameInfo', 'score', 'scoreLabel', 'scoreValue', 'increase',
        'timer', 'timerLabel', 'timerValue', 'timerWarning', 'timerCritical', 'timerCountdown',
        'health', 'heart', 'activeHeart', 'inactiveHeart',
        'endGameButton',
        'flagContainer', 'flagImage', 'flagErrorPlaceholder', 'flagErrorText',
        'optionsContainer', 'guessButton', 'flagGuessButton', 'flagLoadingSpinner', 'flagLoadingPlaceholder',
        'countryText', 'typingInputContainer', 'typingInput', 'submitButton',
        'optionsTransition'
    ],
    'endScreen': [
        'endScreen', 'endScreenContent', 'endScreenHeader',
        'endStateIcon', 'endStateTitle', 'endStateSubtitle',
        'gameOverIcon', 'completedIcon', 'infiniteIcon', 'timeAttackIcon',
        'quickStatsSection', 'quickStatCard', 'quickStatValue', 'quickStatLabel',
        'gameSettings', 'settingsInfo', 'settingItem', 'endScreenSettingLabel', 'endScreenSettingValue',
        'gameStats', 'statsGrid', 'statCard', 'statIcon', 'statContent', 'statLabel', 'statValue',
        'endScreenActions'
    ],
    'challengeScreen': [
        'challengeScreen', 'challengeContent',
        'challengeInfoCard', 'challengeInfoCardCompact', 'challengeInfoLayout',
        'challengeInfoLeft', 'challengeInfoHeader', 'challengeInfoMeta', 'challengeCreatedText', 'challengeExpiresText',
        'challengeInfoContentWrapper', 'challengeInfoContent', 'challengeInfoMetaCompact', 'challengeCreatedTextCompact',
        'challengeSettingsPills', 'settingPill', 'settingPillLabel', 'settingPillValue',
        'challengeFlagPreview', 'flagPreviewImage', 'flagPreviewLoading',
        'challengeCreator', 'challengeCreatorIcon', 'challengeCreatorName',
        'challengeDateInfo', 'challengeDateIcon', 'challengeDateText',
        'challengeSettingsContainer', 'challengeSettingsGrid', 'settingTopRow', 'settingBottomRow',
        'settingFullWidth', 'settingLarge', 'settingMedium', 'settingSmall', 'settingValue',
        'challengeLeaderboard', 'emptyLeaderboard', 'leaderboardColumns', 'leaderboardHeader',
        'leaderboardRow', 'leaderboardRowEmpty', 'leaderboardRowCurrent',
        'colRank', 'colName', 'colScore', 'colAccuracy', 'colTime',
        'challengeActions', 'challengeCompletedMessage', 'challengeCompletedIcon'
    ],
    'modals': [
        'modalOverlay', 'modal', 'modalHeader', 'closeButton', 'modalForm', 'modalContent',
        'helpSection', 'helpItem',
        'floatingMenuContainer', 'floatingMenuButton', 'floatingMenuDropdown', 'floatingMenuItem',
        'gamesModalContent', 'gamesViewTabs', 'gamesViewTab', 'activeTab',
        'gameHistoryList', 'gameHistoryContainer', 'completedGamesSection',
        'activeGameSection', 'activeGameHeader',
        'challengesModalContent', 'challengeItem', 'challengeInfo', 'challengeCode', 'challengeDate', 'challengeSettings', 'challengeScore',
        'challengeActions', 'deleteButton',
        'browseAllModal', 'browseAllModalHeader', 'browseAllModalBody', 'modalCloseButton',
        'feedbackModal', 'feedbackForm', 'formGroup', 'formLabel', 'formInput', 'formTextarea',
        'charCount', 'formHelp', 'categoryGrid', 'categoryButton', 'selectedCategory',
        'categoryIcon', 'categoryContent', 'categoryLabel', 'categoryDescription',
        'submitMessage', 'success', 'error', 'formActions', 'feedbackButton'
    ],
    'progressBar': [
        'progressBar', 'progressSteps', 'progressStep', 'progressStepActive', 'progressStepCompleted',
        'progressStepDisabled', 'progressStepHover', 'progressStepIcon', 'progressStepLabel'
    ]
}

# Animation keyframes that should be in shared
SHARED_ANIMATIONS = [
    'spin', 'slideUp', 'pulse', 'shimmer', 'optionsSlideIn', 'slideInRight',
    'scoreGlow', 'timerPulse', 'timerCriticalPulse', 'countdownBlink',
    'floatGlobe', 'pulseGlobe', 'countryTextAppear', 'checkmarkAppear', 'settingGlow',
    'modalSlideIn', 'activeGamePulse'
]

def extract_css_by_component(css_file_path, output_dir):
    """Extract CSS styles into component-specific files."""
    css_file = Path(css_file_path)
    output_dir = Path(output_dir)
    output_dir.mkdir(exist_ok=True)
    
    # Read the original CSS file
    with open(css_file, 'r', encoding='utf-8') as f:
        css_content = f.read()
    
    # Split CSS into lines for processing
    lines = css_content.split('\n')
    
    # Track which component each style belongs to
    component_styles = {component: [] for component in STYLE_MAPPINGS.keys()}
    component_styles['shared'] = []
    
    current_style = None
    current_component = None
    in_media_query = False
    media_query_content = []
    media_query_selector = None
    
    i = 0
    while i < len(lines):
        line = lines[i]
        stripped = line.strip()
        
        # Check for media queries
        if stripped.startswith('@media'):
            in_media_query = True
            media_query_selector = line
            media_query_content = [line]
            i += 1
            continue
        
        if in_media_query:
            media_query_content.append(line)
            if stripped == '}':
                # End of media query - need to determine which component it belongs to
                media_query_text = '\n'.join(media_query_content)
                # Try to match styles in media query to components
                for component, classes in STYLE_MAPPINGS.items():
                    for class_name in classes:
                        if f'.{class_name}' in media_query_text or f' {class_name}' in media_query_text:
                            if media_query_text not in component_styles[component]:
                                component_styles[component].append(media_query_text)
                            break
                in_media_query = False
                media_query_content = []
            i += 1
            continue
        
        # Check for keyframe animations
        if stripped.startswith('@keyframes'):
            anim_name = stripped.split()[1].split('(')[0]
            # Extract the entire keyframe
            keyframe_lines = [line]
            i += 1
            brace_count = 0
            while i < len(lines):
                keyframe_lines.append(lines[i])
                if '{' in lines[i]:
                    brace_count += 1
                if '}' in lines[i]:
                    brace_count -= 1
                    if brace_count == 0:
                        break
                i += 1
            keyframe_text = '\n'.join(keyframe_lines)
            # Add to shared if it's a shared animation
            if anim_name in SHARED_ANIMATIONS:
                component_styles['shared'].append(keyframe_text)
            i += 1
            continue
        
        # Check for CSS class definitions
        if stripped.startswith('.') and not stripped.startswith('/*'):
            # Extract class name
            class_match = re.match(r'^\.([a-zA-Z0-9_-]+)', stripped)
            if class_match:
                class_name = class_match.group(1)
                # Remove pseudo-selectors
                class_name = class_name.split(':')[0].split('::')[0]
                
                # Find which component this class belongs to
                found_component = None
                for component, classes in STYLE_MAPPINGS.items():
                    if class_name in classes or any(class_name.startswith(c) for c in classes):
                        found_component = component
                        break
                
                if not found_component:
                    # Check if it's a shared/common style
                    if any(class_name.startswith(prefix) for prefix in ['container', 'button', 'loading', 'message', 'title']):
                        found_component = 'shared'
                
                if found_component:
                    current_component = found_component
                    current_style = [line]
                else:
                    # Unknown style - add to shared for now
                    current_component = 'shared'
                    current_style = [line]
            else:
                # Continuation of previous style
                if current_style is not None:
                    current_style.append(line)
        else:
            # Continuation or comment
            if current_style is not None:
                current_style.append(line)
                # Check if this is the end of a style block
                if stripped == '}' and current_style:
                    style_text = '\n'.join(current_style)
                    if style_text not in component_styles[current_component]:
                        component_styles[current_component].append(style_text)
                    current_style = None
                    current_component = None
        
        i += 1
    
    # Write component-specific CSS files
    for component, styles in component_styles.items():
        if styles:
            output_file = output_dir / f'{component}.module.css'
            with open(output_file, 'w', encoding='utf-8') as f:
                f.write(f'/* {component.upper()} MODULE CSS */\n')
                f.write(f'/* Extracted from game.module.css */\n\n')
                f.write('\n\n'.join(styles))
            print(f'Created {output_file} with {len(styles)} style blocks')
    
    print(f'\nExtraction complete! Created {len([c for c in component_styles.values() if c])} CSS module files.')

if __name__ == '__main__':
    css_file = Path(__file__).parent / 'styles' / 'game.module.css'
    output_dir = Path(__file__).parent / 'styles'
    
    print(f'Extracting CSS from {css_file}...')
    extract_css_by_component(css_file, output_dir)


