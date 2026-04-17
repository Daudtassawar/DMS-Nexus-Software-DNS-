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

    // ── Scroll behavior ──────────────────────────────────────────────
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

    // ── Notifications ────────────────────────────────────────────────
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
            className="h-16 bg-[var(--bg-card)] bg-opacity-80 border-b border-[var(--border)] px-4 md:px-6 flex items-center justify-between sticky top-0 z-40 shadow-sm transition-all duration-300 backdrop-blur-md"
            style={{ transform: visible ? 'translateY(0)' : 'translateY(-100%)' }}
        >
            {/* Left Section */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onToggleSidebar}
                    className="p-2.5 rounded-xl border border-[var(--border)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all bg-[var(--bg-app)] active:scale-90"
                    aria-label="Toggle Navigation"
                >
                    {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                </button>

                <div className="hidden lg:flex items-center gap-3 border border-[var(--border)] px-4 py-2 rounded-xl w-72 bg-[var(--bg-app)] focus-within:ring-2 focus-within:ring-[var(--ring)] focus-within:border-[var(--primary)] transition-all group">
                    <Search size={16} className="text-[var(--text-muted)] group-focus-within:text-[var(--primary)] transition-colors" />
                    <input
                        type="text"
                        placeholder="Search system..."
                        className="bg-transparent text-sm outline-none w-full text-[var(--text-main)] placeholder:text-[var(--text-muted)] font-medium"
                    />
                </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2 md:gap-4 shrink-0">

                <div className="relative" ref={notifRef}>
                    <button
                        onClick={() => setIsNotifOpen(prev => !prev)}
                        className={`relative p-2.5 rounded-xl border transition-all active:scale-95 ${isNotifOpen ? 'border-[var(--primary)] bg-[var(--primary)] bg-opacity-10 text-[var(--primary)] ring-4 ring-[var(--ring)]' : 'border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--secondary)]'}`}
                        aria-label="System Notifications"
                    >
                        <Bell size={20} />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-[var(--primary)] text-white text-[10px] font-black rounded-lg flex items-center justify-center px-1 border-2 border-[var(--bg-card)] shadow-lg shadow-[var(--ring)]">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </button>

                    {isNotifOpen && (
                        <div className="absolute top-full right-0 mt-3 w-80 bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl shadow-2xl z-[100] overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                            {/* Dropdown Content Same as before but with better styles */}
                            <div className="px-5 py-4 border-b border-[var(--border)] flex justify-between items-center bg-[var(--bg-app)]">
                                <div className="flex items-center gap-2.5">
                                    <Bell size={16} className="text-[var(--primary)]" />
                                    <span className="text-xs font-black text-[var(--text-main)] uppercase tracking-widest">Alerts</span>
                                    {unreadCount > 0 && (
                                        <span className="bg-[var(--primary)] text-white text-[10px] font-black px-2 py-0.5 rounded-full">{unreadCount}</span>
                                    )}
                                </div>
                                {unreadCount > 0 && (
                                    <button onClick={handleMarkAllRead} className="text-[10px] font-black text-[var(--primary)] hover:underline uppercase tracking-widest">
                                        Clear All
                                    </button>
                                )}
                            </div>

                            <div className="max-h-80 overflow-y-auto divide-y divide-[var(--border)]">
                                {notifLoading && (
                                    <div className="p-8 text-center text-xs text-[var(--text-muted)] font-bold animate-pulse uppercase tracking-widest">Synchronizing...</div>
                                )}
                                {!notifLoading && notifications.length === 0 && (
                                    <div className="p-10 text-center">
                                        <div className="w-12 h-12 bg-emerald-500 bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <CheckCircle size={24} className="text-emerald-500" />
                                        </div>
                                        <p className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest">System Clear</p>
                                    </div>
                                )}
                                {!notifLoading && (notifications || []).map(n => {
                                    if (!n) return null;
                                    const isRead = readIds.includes(n.id);
                                    return (
                                        <div
                                            key={n.id}
                                            onClick={() => handleMarkOne(n.id)}
                                            className={`flex gap-4 p-4 cursor-pointer transition-all hover:bg-[var(--bg-app)] ${isRead ? 'opacity-40 grayscale' : 'hover:translate-x-1'}`}
                                        >
                                            <div className="mt-1 shrink-0 bg-[var(--secondary)] p-2 rounded-lg">{notifIcon(n.type)}</div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-black text-[var(--text-main)] leading-tight uppercase tracking-tight">{n.title}</p>
                                                <p className="text-[11px] text-[var(--text-muted)] mt-1.5 leading-relaxed font-medium line-clamp-2">{n.message}</p>
                                            </div>
                                            {!isRead && <div className="w-2 h-2 rounded-full bg-[var(--primary)] mt-2 shrink-0 shadow-[0_0_8px_var(--primary)]" />}
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="px-5 py-3 border-t border-[var(--border)] bg-[var(--bg-app)] text-center">
                                <button
                                    onClick={() => { fetchNotifications(); }}
                                    className="text-[10px] font-black text-[var(--primary)] uppercase tracking-[0.2em] hover:opacity-70 transition-opacity"
                                >
                                    Force Refresh
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="hidden sm:block">
                    <ThemeToggle />
                </div>

                {/* User Profile */}
                <div className="flex items-center gap-3 border-l border-[var(--border)] pl-4 h-10">
                    <div className="hidden md:flex flex-col items-end">
                        <span className="text-sm font-black text-[var(--text-main)] leading-none tracking-tight">{user?.fullName || user?.userName || 'System Guest'}</span>
                        <span className="text-[9px] text-[var(--primary)] font-black uppercase tracking-[0.2em] mt-1">{user?.role || 'Guest'} Account</span>
                    </div>
                    <div className="relative group">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[var(--primary)] to-amber-300 text-white flex items-center justify-center font-black border-2 border-[var(--bg-card)] shadow-lg shadow-[var(--ring)] text-sm shrink-0 interactive overflow-hidden">
                            <span className="relative z-10 transition-transform group-hover:scale-110">{(user?.userName || user?.UserName || 'U').charAt(0).toUpperCase()}</span>
                            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity"></div>
                        </div>
                    </div>
                    <button
                        onClick={() => authService.logout()}
                        className="p-2 text-[var(--text-muted)] hover:bg-red-500 hover:bg-opacity-10 hover:text-red-500 rounded-xl transition-all active:scale-95"
                        title="Secure Logout"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
