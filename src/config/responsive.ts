// Responsive Configuration System
// This replaces static values with dynamic, responsive configurations

// Breakpoints for responsive design
export const breakpoints = {
  xs: '320px',
  sm: '640px', 
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// Dynamic spacing system
export const spacing = {
  // Base spacing unit (can be adjusted based on screen size)
  unit: 'clamp(0.25rem, 0.5vw, 0.5rem)',
  
  // Responsive spacing scales
  xs: 'clamp(0.125rem, 0.25vw, 0.25rem)',
  sm: 'clamp(0.25rem, 0.5vw, 0.5rem)',
  md: 'clamp(0.5rem, 1vw, 1rem)',
  lg: 'clamp(1rem, 2vw, 2rem)',
  xl: 'clamp(1.5rem, 3vw, 3rem)',
  '2xl': 'clamp(2rem, 4vw, 4rem)',
  '3xl': 'clamp(3rem, 6vw, 6rem)',
  
  // Semantic spacing
  componentGap: 'clamp(0.75rem, 1.5vw, 1.5rem)',
  sectionGap: 'clamp(1.5rem, 3vw, 3rem)',
  pageGap: 'clamp(2rem, 4vw, 4rem)',
} as const;

// Dynamic typography system
export const typography = {
  // Font sizes with responsive scaling
  xs: 'clamp(0.75rem, 0.875vw, 0.875rem)',
  sm: 'clamp(0.875rem, 1vw, 1rem)',
  base: 'clamp(1rem, 1.125vw, 1.125rem)',
  lg: 'clamp(1.125rem, 1.25vw, 1.25rem)',
  xl: 'clamp(1.25rem, 1.5vw, 1.5rem)',
  '2xl': 'clamp(1.5rem, 2vw, 2rem)',
  '3xl': 'clamp(1.875rem, 2.5vw, 2.5rem)',
  '4xl': 'clamp(2.25rem, 3vw, 3rem)',
  '5xl': 'clamp(3rem, 4vw, 4rem)',
  
  // Line heights
  lineHeight: {
    tight: '1.25',
    normal: '1.5', 
    relaxed: '1.75',
  },
  
  // Letter spacing
  letterSpacing: {
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
  },
} as const;

// Dynamic layout dimensions
export const layout = {
  // Container widths
  container: {
    sm: 'min(100% - 2rem, 640px)',
    md: 'min(100% - 3rem, 768px)', 
    lg: 'min(100% - 4rem, 1024px)',
    xl: 'min(100% - 6rem, 1280px)',
    '2xl': 'min(100% - 8rem, 1536px)',
    full: '100%',
  },
  
  // Sidebar widths
  sidebar: {
    collapsed: 'clamp(3rem, 5vw, 4rem)',
    expanded: 'clamp(12rem, 20vw, 16rem)',
    mobile: '100vw',
  },
  
  // Header heights
  header: {
    mobile: 'clamp(3rem, 8vw, 4rem)',
    desktop: 'clamp(4rem, 6vw, 5rem)',
  },
  
  // Card dimensions
  card: {
    minHeight: 'clamp(8rem, 15vw, 12rem)',
    maxWidth: 'clamp(20rem, 40vw, 30rem)',
    borderRadius: 'clamp(0.5rem, 1vw, 1rem)',
  },
  
  // Modal dimensions
  modal: {
    width: 'clamp(20rem, 90vw, 32rem)',
    maxHeight: '90vh',
    padding: 'clamp(1rem, 3vw, 2rem)',
  },
} as const;

// Dynamic color system with theme support
export const colors = {
  // Theme-aware colors
  background: {
    primary: 'hsl(var(--background-primary) / <alpha-value>)',
    secondary: 'hsl(var(--background-secondary) / <alpha-value>)',
    tertiary: 'hsl(var(--background-tertiary) / <alpha-value>)',
  },
  
  text: {
    primary: 'hsl(var(--text-primary) / <alpha-value>)',
    secondary: 'hsl(var(--text-secondary) / <alpha-value>)',
    tertiary: 'hsl(var(--text-tertiary) / <alpha-value>)',
  },
  
  border: {
    primary: 'hsl(var(--border-primary) / <alpha-value>)',
    secondary: 'hsl(var(--border-secondary) / <alpha-value>)',
  },
  
  // Semantic colors that adapt to theme
  success: 'hsl(var(--success) / <alpha-value>)',
  warning: 'hsl(var(--warning) / <alpha-value>)',
  error: 'hsl(var(--error) / <alpha-value>)',
  info: 'hsl(var(--info) / <alpha-value>)',
} as const;

// Animation system with performance considerations
export const animations = {
  // Durations based on user preferences
  duration: {
    fast: 'var(--duration-fast, 150ms)',
    normal: 'var(--duration-normal, 250ms)',
    slow: 'var(--duration-slow, 350ms)',
  },
  
  // Easing functions
  easing: {
    ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  
  // Reduced motion support
  motion: {
    safe: 'var(--motion-safe, transform)',
    reduce: 'var(--motion-reduce, none)',
  },
} as const;

// Dynamic grid system
export const grid = {
  // Responsive columns
  columns: {
    mobile: 'repeat(auto-fit, minmax(250px, 1fr))',
    tablet: 'repeat(auto-fit, minmax(300px, 1fr))',
    desktop: 'repeat(auto-fit, minmax(350px, 1fr))',
  },
  
  // Gap system
  gap: {
    sm: 'clamp(0.5rem, 1vw, 1rem)',
    md: 'clamp(1rem, 2vw, 2rem)',
    lg: 'clamp(1.5rem, 3vw, 3rem)',
  },
} as const;

// Component-specific configurations
export const components = {
  button: {
    height: {
      sm: 'clamp(2rem, 4vw, 2.25rem)',
      md: 'clamp(2.25rem, 4.5vw, 2.5rem)', 
      lg: 'clamp(2.5rem, 5vw, 3rem)',
    },
    padding: {
      sm: 'clamp(0.5rem, 1vw, 0.75rem) clamp(1rem, 2vw, 1.5rem)',
      md: 'clamp(0.75rem, 1.5vw, 1rem) clamp(1.5rem, 3vw, 2rem)',
      lg: 'clamp(1rem, 2vw, 1.25rem) clamp(2rem, 4vw, 2.5rem)',
    },
    fontSize: {
      sm: typography.sm,
      md: typography.base,
      lg: typography.lg,
    },
  },
  
  input: {
    height: 'clamp(2.5rem, 5vw, 3rem)',
    padding: 'clamp(0.75rem, 1.5vw, 1rem)',
    fontSize: typography.base,
    borderRadius: 'clamp(0.25rem, 0.5vw, 0.5rem)',
  },
  
  card: {
    padding: 'clamp(1rem, 2vw, 1.5rem)',
    borderRadius: 'clamp(0.5rem, 1vw, 0.75rem)',
    shadow: '0 clamp(1px, 0.1vw, 2px) clamp(3px, 0.5vw, 6px) rgba(0, 0, 0, 0.1)',
  },
  
  navigation: {
    height: layout.header.desktop,
    itemSpacing: spacing.md,
    fontSize: typography.base,
  },
  
  sidebar: {
    width: layout.sidebar.expanded,
    collapsedWidth: layout.sidebar.collapsed,
    itemHeight: 'clamp(2.5rem, 5vw, 3rem)',
    itemPadding: spacing.md,
  },
} as const;

// Utility functions for responsive calculations
export const utils = {
  // Convert static px values to responsive clamp
  clampPx: (min: number, ideal: number, max: number) => 
    `clamp(${min}px, ${ideal}vw, ${max}px)`,
  
  // Generate responsive font size
  responsiveFont: (base: number, scale: number = 0.8) => 
    `clamp(${base * scale}rem, ${base}vw, ${base * 1.2}rem)`,
  
  // Generate responsive spacing
  responsiveSpace: (base: number) => 
    `clamp(${base * 0.5}rem, ${base}vw, ${base * 1.5}rem)`,
  
  // Media query helpers
  media: {
    sm: `@media (min-width: ${breakpoints.sm})`,
    md: `@media (min-width: ${breakpoints.md})`,
    lg: `@media (min-width: ${breakpoints.lg})`,
    xl: `@media (min-width: ${breakpoints.xl})`,
    '2xl': `@media (min-width: ${breakpoints['2xl']})`,
    
    // Touch-friendly queries
    touch: '@media (hover: none) and (pointer: coarse)',
    mouse: '@media (hover: hover) and (pointer: fine)',
    
    // Accessibility queries
    reducedMotion: '@media (prefers-reduced-motion: reduce)',
    highContrast: '@media (prefers-contrast: high)',
    darkMode: '@media (prefers-color-scheme: dark)',
  },
} as const;

// CSS Custom Properties for dynamic theming
export const cssVariables = {
  // Light theme
  light: {
    '--background-primary': '0 0% 100%',
    '--background-secondary': '210 40% 98%',
    '--background-tertiary': '210 40% 96%',
    '--text-primary': '222 84% 4.9%',
    '--text-secondary': '215 25% 26.7%',
    '--text-tertiary': '215 20.2% 65.1%',
    '--border-primary': '214 31.8% 91.4%',
    '--border-secondary': '214 32% 86%',
    '--success': '142 71% 45%',
    '--warning': '38 92% 50%',
    '--error': '0 84% 60%',
    '--info': '213 94% 68%',
  },
  
  // Dark theme
  dark: {
    '--background-primary': '222 84% 4.9%',
    '--background-secondary': '217 32.6% 17.5%',
    '--background-tertiary': '215 27.9% 16.9%',
    '--text-primary': '210 40% 98%',
    '--text-secondary': '215 20.2% 65.1%',
    '--text-tertiary': '215 25% 26.7%',
    '--border-primary': '215 27.9% 16.9%',
    '--border-secondary': '217 32.6% 17.5%',
    '--success': '142 71% 45%',
    '--warning': '38 92% 50%',
    '--error': '0 84% 60%',
    '--info': '213 94% 68%',
  },
  
  // Motion preferences
  motion: {
    '--duration-fast': '150ms',
    '--duration-normal': '250ms', 
    '--duration-slow': '350ms',
    '--motion-safe': 'transform',
    '--motion-reduce': 'none',
  },
} as const;

// Export default configuration
export default {
  breakpoints,
  spacing,
  typography,
  layout,
  colors,
  animations,
  grid,
  components,
  utils,
  cssVariables,
} as const;