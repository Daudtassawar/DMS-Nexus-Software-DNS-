import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ThemeToggle from './ThemeToggle';
import authService from '../services/authService';
import { Menu, Search, LogOut, Bell, X, AlertTriangle, TrendingDown, Clock, CheckCircle } from 'lucide-react';

const NOTIFICATION_POLL_MS = 5 * 60 * 1000; // 5 minutes
const READ_KEY = 'dms_read_notifications';

const getReadIds = () => {
    try { 
        const stored = localStorage.getItem(READ_KEY);
        return stored ? JSON.parse(stored) : []; 
    } catch (e) { 
        console.error('Failed to parse read notification IDs:', e);
        return []; 
    }
};
const markRead = (ids) => {
    try {
        localStorage.setItem(READ_KEY, JSON.stringify([...new Set([...getReadIds(), ...ids])]));
    } catch (e) {
        console.error('Failed to save read notifications:', e);
    }
};

const notifIcon = (type) => {
    if (type === 'stock') return <TrendingDown size={14} className="text-orange-500" />;
    if (type === 'overdue') return <AlertTriangle size={14} className="text-red-500" />;
    if (type === 'due') return <Clock size={14} className="text-amber-500" />;
    return <Bell size={14} className="text-blue-500" />;
};

const Navbar = ({ onToggleSidebar, isSidebarOpen, isMobile }) => {
    const user = authService?.getCurrentUser?.()?.user;
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [notifLoading, setNotifLoading] = useState(false);
    const [readIds, setReadIds] = useState(getReadIds());
    const notifRef = useRef(null);

    // ── Scroll hide/show behavior ─────────────────────────────────────
    const [visible, setVisible] = useState(true);
    const lastScrollY = useRef(0);
    useEffect(() => {
        const handleScroll = () => {
            const current = window.scrollY;
            setVisible(current < lastScrollY.current || current < 60);
            lastScrollY.current = current;
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // ── Fetch notifications from backend ─────────────────────────────
    const fetchNotifications = async () => {
        setNotifLoading(true);
        try {
            const res = await axios.get('/api/notifications');
            setNotifications(res.data || []);
        } catch {
            setNotifications([]);
        } finally { setNotifLoading(false); }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, NOTIFICATION_POLL_MS);
        return () => clearInterval(interval);
    }, []);

    // ── Close notif dropdown when clicking outside ────────────────────
    useEffect(() => {
        const handler = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) {
                setIsNotifOpen(false);
            }
        };
        if (isNotifOpen) document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [isNotifOpen]);

    const unreadCount = (notifications || []).filter(n => n && !readIds.includes(n.id)).length;

    const handleMarkAllRead = () => {
        const allIds = notifications.map(n => n.id);
        markRead(allIds);
        setReadIds(prev => [...new Set([...prev, ...allIds])]);
    };

    const handleMarkOne = (id) => {
        markRead([id]);
        setReadIds(prev => [...new Set([...prev, id])]);
    };

    return (
        <header
            className="h-16 bg-[var(--bg-card)] border-b border-[var(--border)] px-4 md:px-6 flex items-center justify-between sticky top-0 z-40 shadow-sm transition-transform duration-300"
            style={{ transform: visible ? 'translateY(0)' : 'translateY(-100%)' }}
        >
            {/* Left: toggle + search */}
            <div className="flex items-center gap-3">
                <button
                    onClick={onToggleSidebar}
                    className="p-2 rounded-md border border-[var(--border)] hover:bg-[var(--secondary)] transition-all text-[var(--text-main)]"
                    aria-label="Toggle sidebar"
                >
                    {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
                </button>

                <div className="hidden lg:flex items-center gap-2 border border-[var(--border)] px-3 py-1.5 rounded-md w-64 bg-[var(--bg-app)] focus-within:ring-2 focus-within:ring-[var(--ring)] focus-within:border-[var(--primary)] transition-all">
                    <Search size={14} className="text-[var(--text-muted)] shrink-0" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="bg-transparent text-sm outline-none w-full text-[var(--text-main)] placeholder:text-[var(--text-muted)]"
                    />
                </div>
            </div>

            {/* Right: notifications + theme + user */}
            <div className="flex items-center gap-2 md:gap-3 shrink-0">

                {/* Bell Notifications */}
                <div className="relative" ref={notifRef}>
                    <button
                        onClick={() => setIsNotifOpen(prev => !prev)}
                        className={`relative p-2 rounded-md border transition-all ${isNotifOpen ? 'border-[var(--primary)] bg-[var(--secondary)] text-[var(--primary)]' : 'border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--secondary)]'}`}
                        aria-label="Notifications"
                    >
                        <Bell size={18} />
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5 leading-none border border-[var(--bg-card)]">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </button>

                    {isNotifOpen && (
                        <div className="absolute top-full right-0 mt-2 w-80 bg-[var(--bg-card)] border border-[var(--border)] rounded-md shadow-md z-[100] overflow-hidden">
                            {/* Header */}
                            <div className="px-4 py-3 border-b border-[var(--border)] flex justify-between items-center bg-[var(--secondary)]">
                                <div className="flex items-center gap-2">
                                    <Bell size={14} className="text-[var(--primary)]" />
                                    <span className="text-xs font-bold text-[var(--text-main)] uppercase tracking-wider">Notifications</span>
                                    {unreadCount > 0 && (
                                        <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">{unreadCount}</span>
                                    )}
                                </div>
                                {unreadCount > 0 && (
                                    <button onClick={handleMarkAllRead} className="text-[10px] font-bold text-[var(--primary)] hover:underline uppercase tracking-wider">
                                        Mark all read
                                    </button>
                                )}
                            </div>

                            {/* List */}
                            <div className="max-h-72 overflow-y-auto divide-y divide-[var(--border)]">
                                {notifLoading && (
                                    <div className="p-6 text-center text-xs text-[var(--text-muted)]">Loading alerts...</div>
                                )}
                                {!notifLoading && notifications.length === 0 && (
                                    <div className="p-6 text-center">
                                        <CheckCircle size={24} className="text-emerald-500 mx-auto mb-2" />
                                        <p className="text-xs font-bold text-[var(--text-muted)]">All clear — no alerts</p>
                                    </div>
                                )}
                                {!notifLoading && (notifications || []).map(n => {
                                    if (!n) return null;
                                    const isRead = readIds.includes(n.id);
                                    return (
                                        <div
                                            key={n.id}
                                            onClick={() => handleMarkOne(n.id)}
                                            className={`flex gap-3 p-3 cursor-pointer transition-colors hover:bg-[var(--secondary)] ${isRead ? 'opacity-60' : ''}`}
                                        >
                                            <div className="mt-0.5 shrink-0">{notifIcon(n.type)}</div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-bold text-[var(--text-main)] leading-tight">{n.title}</p>
                                                <p className="text-[10px] text-[var(--text-muted)] mt-0.5 leading-tight line-clamp-2">{n.message}</p>
                                            </div>
                                            {!isRead && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1 shrink-0" />}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Footer */}
                            <div className="px-4 py-2 border-t border-[var(--border)] bg-[var(--secondary)] text-center">
                                <button
                                    onClick={() => { fetchNotifications(); }}
                                    className="text-[10px] font-bold text-[var(--primary)] uppercase tracking-wider hover:underline"
                                >
                                    Refresh
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="hidden sm:block">
                    <ThemeToggle />
                </div>

                {/* User info */}
                <div className="flex items-center gap-2 border-l border-[var(--border)] pl-3 h-8">
                    <div className="hidden md:flex flex-col items-end">
                        <span className="text-sm font-semibold text-[var(--text-main)] leading-none">{user?.fullName || user?.userName || 'User'}</span>
                        <span className="text-[10px] text-[var(--primary)] font-bold uppercase tracking-wider mt-0.5">{user?.role || 'System'}</span>
                    </div>
                    <div className="w-8 h-8 rounded-md bg-[var(--secondary)] text-[var(--primary)] flex items-center justify-center font-bold border border-[var(--border)] text-sm shrink-0">
                        {(user?.userName || user?.UserName || 'U').charAt(0).toUpperCase()}
                    </div>
                    <button
                        onClick={() => authService.logout()}
                        className="p-1.5 text-[var(--text-muted)] hover:bg-red-50 hover:text-red-500 rounded-md transition-all"
                        title="Logout"
                    >
                        <LogOut size={16} />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
