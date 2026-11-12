import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme && ['light', 'dark', 'pink'].includes(savedTheme)) {
            return savedTheme;
        }
        return 'pink';
    });

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark', 'pink');
        root.classList.add(theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const cycleTheme = () => {
        setTheme(prevTheme => {
            if (prevTheme === 'light') return 'dark';
            if (prevTheme === 'dark') return 'pink';
            return 'light';
        });
    };

    const value = {
        theme,
        setTheme,
        toggleTheme: cycleTheme,
        cycleTheme,
        isDark: theme === 'dark',
        isPink: theme === 'pink',
        isLight: theme === 'light',
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};
