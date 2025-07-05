import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';

// Types
type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  isDark: boolean;
  isLoading: boolean;
}

type ThemeAction =
  | { type: 'SET_THEME'; payload: Theme }
  | { type: 'SET_IS_DARK'; payload: boolean }
  | { type: 'SET_LOADING'; payload: boolean };

interface ThemeContextType extends ThemeState {
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

// Initial state
const initialState: ThemeState = {
  theme: 'system',
  isDark: false,
  isLoading: true,
};

// Reducer
const themeReducer = (state: ThemeState, action: ThemeAction): ThemeState => {
  switch (action.type) {
    case 'SET_THEME':
      return {
        ...state,
        theme: action.payload,
      };
    case 'SET_IS_DARK':
      return {
        ...state,
        isDark: action.payload,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
};

// Context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Provider Props
interface ThemeProviderProps {
  children: ReactNode;
}

// Provider Component
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(themeReducer, initialState);

  // Get system theme preference
  const getSystemTheme = (): boolean => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  };

  // Apply theme to document
  const applyTheme = (isDark: boolean) => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  // Determine if dark mode should be active
  const shouldBeDark = (theme: Theme): boolean => {
    switch (theme) {
      case 'dark':
        return true;
      case 'light':
        return false;
      case 'system':
        return getSystemTheme();
      default:
        return false;
    }
  };

  // Initialize theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    const theme = savedTheme || 'system';
    const isDark = shouldBeDark(theme);

    dispatch({ type: 'SET_THEME', payload: theme });
    dispatch({ type: 'SET_IS_DARK', payload: isDark });
    dispatch({ type: 'SET_LOADING', payload: false });

    applyTheme(isDark);
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    if (state.theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleChange = (e: MediaQueryListEvent) => {
        const isDark = e.matches;
        dispatch({ type: 'SET_IS_DARK', payload: isDark });
        applyTheme(isDark);
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [state.theme]);

  // Theme functions
  const setTheme = (theme: Theme) => {
    const isDark = shouldBeDark(theme);
    
    dispatch({ type: 'SET_THEME', payload: theme });
    dispatch({ type: 'SET_IS_DARK', payload: isDark });
    
    localStorage.setItem('theme', theme);
    applyTheme(isDark);
  };

  const toggleTheme = () => {
    const newTheme = state.isDark ? 'light' : 'dark';
    setTheme(newTheme);
  };

  const value: ThemeContextType = {
    ...state,
    setTheme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;