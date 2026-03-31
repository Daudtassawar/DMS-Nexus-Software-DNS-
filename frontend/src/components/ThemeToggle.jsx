import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

// Apply theme to document root (both Tailwind class + CSS custom properties)
function applyTheme(isDark) {
    const root = document.documentElement;
    if (isDark) {
        root.classList.add('dark');
        root.setAttribute('data-theme', 'dark');
    } else {
        root.classList.remove('dark');
        root.setAttribute('data-theme', 'light');
    }
}

export default function ThemeToggle() {
    const [isDark, setIsDark] = useState(() => {
        return localStorage.getItem('theme') === 'dark';
    });

    useEffect(() => {
        applyTheme(isDark);
    }, [isDark]);

    const toggle = () => {
        const next = !isDark;
        setIsDark(next);
        applyTheme(next);
        localStorage.setItem('theme', next ? 'dark' : 'light');
    };

    return (
        <button
            onClick={toggle}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className={`
                w-10 h-10 flex items-center justify-center rounded-md border transition-all
                ${isDark 
                    ? 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-750' 
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }
            `}
        >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
    );
}
