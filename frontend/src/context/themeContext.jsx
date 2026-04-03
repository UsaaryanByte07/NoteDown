import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

// Read the initial theme SYNCHRONOUSLY before React renders to prevent FOUC.
// Priority: localStorage → OS preference → 'light'
const getInitialTheme = () => {
    const stored = localStorage.getItem('notedown-theme');
    if (stored === 'dark' || stored === 'light') return stored;
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    return 'light';
};

const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(getInitialTheme);

    // Apply or remove the .dark class on <html> whenever theme changes
    useEffect(() => {
        const root = document.documentElement; // = <html>
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        // Persist to localStorage so it survives page refresh
        localStorage.setItem('notedown-theme', theme);
    }, [theme]);

    // Listen for OS-level theme changes — only auto-switch if user has no saved preference
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e) => {
            const stored = localStorage.getItem('notedown-theme');
            if (!stored) {
                setTheme(e.matches ? 'dark' : 'light');
            }
        };
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    const toggleTheme = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

const useTheme = () => {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
    return ctx;
};

export { ThemeProvider, useTheme };
