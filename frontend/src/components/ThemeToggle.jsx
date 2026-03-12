import { useEffect, useState } from 'react';

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
        // Read persisted preference; default to light
        return localStorage.getItem('theme') === 'dark';
    });

    // Apply theme once on mount (restores after refresh)
    useEffect(() => {
        applyTheme(isDark);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
            style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                border: isDark ? '2px solid #3b82f6' : '2px solid #cbd5e1',
                backgroundColor: isDark ? '#1e3a5f' : '#e2e8f0',
                cursor: 'pointer',
                fontSize: '1.3rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
                boxShadow: isDark
                    ? '0 0 12px rgba(59,130,246,0.4)'
                    : '0 2px 8px rgba(0,0,0,0.15)',
            }}
        >
            {isDark ? '☀️' : '🌙'}
        </button>
    );
}
