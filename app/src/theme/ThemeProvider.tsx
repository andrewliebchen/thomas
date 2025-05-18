import React, { createContext, useContext } from 'react';
import { DadTheme, theme, darkTheme } from '@/src/theme';
import { useColorScheme } from 'react-native';

const ThemeContext = createContext<DadTheme>(theme);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const colorScheme = useColorScheme();
  console.log('colorScheme', colorScheme);
  console.log('darkTheme', darkTheme);
  const currentTheme = colorScheme === 'dark' ? darkTheme : theme;
  return (
    <ThemeContext.Provider value={currentTheme}>
      {children}
    </ThemeContext.Provider>
  );
}; 