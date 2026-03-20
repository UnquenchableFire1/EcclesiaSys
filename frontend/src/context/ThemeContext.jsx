import { createContext, useState, useEffect, useContext } from 'react';

export const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    // Force light theme as per user's request to remove dark theme completely
    const [theme] = useState('light');

    useEffect(() => {
        // Ensure dark classes are removed from the root
        const root = document.documentElement;
        root.classList.remove('dark');
        sessionStorage.setItem('appTheme', 'light');
    }, []);

    const toggleTheme = () => {
        // No-op since dark theme is removed
        console.log("Theme toggle is disabled. Light mode is permanent.");
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => useContext(ThemeContext);
