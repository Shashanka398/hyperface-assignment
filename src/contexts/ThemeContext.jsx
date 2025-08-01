import React, { createContext, useState, useEffect, useContext } from 'react';
import {THEME_KEY} from '../constants/common.constants'

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    const saved = sessionStorage.getItem(THEME_KEY);
    return saved ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    sessionStorage.setItem(THEME_KEY, JSON.stringify(isDark));
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggleTheme = () => setIsDark(prev => !prev);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeProvider;