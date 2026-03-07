import { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('appTheme') || 'light';
    });

    useEffect(() => {
        localStorage.setItem('appTheme', theme);
        document.documentElement.setAttribute('data-theme', theme);
        
        // Apply theme to body
        if (theme === 'dark') {
            document.body.style.backgroundColor = '#1a1a1a';
            document.body.style.color = '#ffffff';
        } else {
            document.body.style.backgroundColor = '#ffffff';
            document.body.style.color = '#000000';
        }
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    const themeConfig = {
        light: {
            bg: 'bg-white',
            text: 'text-gray-900',
            navBg: 'bg-tealDeep',
            navText: 'text-white',
            cardBg: 'bg-gray-50',
            border: 'border-gray-200',
            inputBg: 'bg-white',
            inputBorder: 'border-gray-300',
            hoverBg: 'hover:bg-gray-100'
        },
        dark: {
            bg: 'bg-gray-900',
            text: 'text-white',
            navBg: 'bg-gray-800',
            navText: 'text-gray-100',
            cardBg: 'bg-gray-800',
            border: 'border-gray-700',
            inputBg: 'bg-gray-700',
            inputBorder: 'border-gray-600',
            hoverBg: 'hover:bg-gray-700'
        }
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, themeConfig: themeConfig[theme] }}>
            {children}
        </ThemeContext.Provider>
    );
}
