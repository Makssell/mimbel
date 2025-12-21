// Color theme matching web version (site1.js)
export const colors = {
  // Background colors
  backgroundDark: '#0a0a0a',
  backgroundLight: '#1a1a1a',
  
  // Text colors
  textPrimary: '#ffffff',
  textSecondary: '#a0a0a0',
  
  // Accent colors
  accent: '#6c5ce7',
  accentHover: '#8c7ae6',
  
  // UI colors
  border: '#2a2a2a',
  cardBg: '#151515',
  cardBgTransparent: 'rgba(21, 21, 21, 0.7)',
  borderTransparent: 'rgba(255, 255, 255, 0.1)',
  
  // Status colors
  success: '#00c49a',
  error: '#ff4c4c',
  warning: '#ff9800',
  
  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  
  // Gradient overlay (purple accent)
  gradientOverlay: 'rgba(108, 92, 231, 0.1)',
};

// Helper function to create gradient background
export const getGradientBackground = () => ({
  colors: [colors.backgroundDark, colors.backgroundLight],
  start: { x: 0, y: 0 },
  end: { x: 1, y: 1 },
});

