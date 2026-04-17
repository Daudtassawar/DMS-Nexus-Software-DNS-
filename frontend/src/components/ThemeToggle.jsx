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
                w-10 h-10 flex items-center justify-center rounded-xl border transition-all duration-300 active:scale-90 shadow-sm
                ${isDark 
                    ? 'bg-[#1E1E1E] border-[#2A2A2A] text-amber-400 hover:ring-4 hover:ring-amber-400 hover:ring-opacity-10' 
                    : 'bg-white border-slate-200 text-slate-600 hover:ring-4 hover:ring-slate-100'
                }
            `}
        >
            {isDark ? <Sun size={20} className="animate-in spin-in-180 duration-500" /> : <Moon size={20} className="animate-in spin-in-180 duration-500" />}
        </button>
    );
}
