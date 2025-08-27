import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface BackgroundOption {
  value: string;
  label: string;
}

interface SidebarPosition {
  value: string;
}

interface HeaderPosition {
  value: string;
}

interface SidebarLayout {
  value: string;
}

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  // Fleet Management specific properties
  sidebariconHover: boolean;
  iconHover: boolean;
  sidebarposition: SidebarPosition;
  headerposition: HeaderPosition;
  sidebarLayout: SidebarLayout;
  ChangeIconSidebar: (hover: boolean) => void;
  background: BackgroundOption;
  changeBackground: (bg: BackgroundOption) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ 
  children, 
  defaultTheme = 'dark' // Default to dark mode for ERP system
}) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Check localStorage first, then use default
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('erp-theme') as Theme;
      return stored || defaultTheme;
    }
    return defaultTheme;
  });

  // Fleet Management specific state
  const [sidebariconHover, setSidebariconHover] = useState(false);
  const [iconHover, setIconHover] = useState(false);
  const [sidebarposition] = useState<SidebarPosition>({ value: 'fixed' });
  const [headerposition] = useState<HeaderPosition>({ value: 'static' });
  const [sidebarLayout] = useState<SidebarLayout>({ value: 'horizontal' });
  const [background, setBackground] = useState<BackgroundOption>({
    value: theme,
    label: theme === 'dark' ? 'Dark' : 'Light'
  });

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove previous theme classes
    root.classList.remove('light', 'dark');
    
    // Add current theme class
    root.classList.add(theme);
    
    // Store in localStorage
    localStorage.setItem('erp-theme', theme);
    
    // Update background state when theme changes
    setBackground({
      value: theme,
      label: theme === 'dark' ? 'Dark' : 'Light'
    });
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const ChangeIconSidebar = (hover: boolean) => {
    setIconHover(hover);
    setSidebariconHover(hover);
  };

  const changeBackground = (bg: BackgroundOption) => {
    setBackground(bg);
    setThemeState(bg.value as Theme);
  };

  const value = {
    theme,
    toggleTheme,
    setTheme,
    // Fleet Management specific properties
    sidebariconHover,
    iconHover,
    sidebarposition,
    headerposition,
    sidebarLayout,
    ChangeIconSidebar,
    background,
    changeBackground,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Export the context for direct usage
export { ThemeContext };
export default ThemeProvider;