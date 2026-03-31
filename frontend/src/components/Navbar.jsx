import React from 'react';
import ThemeToggle from './ThemeToggle';
import authService from '../services/authService';
import { Menu, Search, LogOut, Bell, X } from 'lucide-react';

const Navbar = ({ onToggleSidebar, isSidebarOpen, isMobile }) => {
  const user = authService.getCurrentUser()?.user;
  const [isNotificationOpen, setIsNotificationOpen] = React.useState(false);
  const [notifications] = React.useState([
    { id: 1, title: 'System Status', message: 'All systems operational.', time: '2m ago', type: 'info' },
    { id: 2, title: 'New Invoice', message: 'Invoice #INV-2024-001 created.', time: '15m ago', type: 'success' },
    { id: 3, title: 'Stock Alert', message: 'Low stock for Product A.', time: '1h ago', type: 'warning' },
  ]);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const close = () => setIsNotificationOpen(false);
    if (isNotificationOpen) {
      window.addEventListener('click', close);
    }
    return () => window.removeEventListener('click', close);
  }, [isNotificationOpen]);

  return (
    <header className="h-16 bg-[var(--bg-card)] border-b border-[var(--border)] px-4 md:px-8 flex items-center justify-between sticky top-0 z-40 shadow-sm">
      <div className="flex items-center gap-4">
        <button 
          onClick={onToggleSidebar}
          className="p-2 rounded-md border border-[var(--border)] hover:bg-[var(--secondary)] transition-all text-[var(--text-main)]"
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        
        <div className="hidden lg:flex items-center gap-2 border border-[var(--border)] px-3 py-1.5 rounded-md w-64 bg-[var(--bg-app)] focus-within:ring-2 focus-within:ring-[var(--ring)] focus-within:border-[var(--primary)] transition-all">
          <Search size={16} className="text-[var(--text-muted)]" />
          <input type="text" placeholder="Search..." className="bg-transparent text-sm outline-none w-full text-[var(--text-main)] placeholder-[var(--text-muted)]" />
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-4 shrink-0">
        <div className="relative">
          <button 
            onClick={(e) => { e.stopPropagation(); setIsNotificationOpen(!isNotificationOpen); }}
            className={`p-2 rounded-md border transition-all relative ${isNotificationOpen ? 'border-[var(--primary)] bg-[var(--bg-app)] text-[var(--primary)]' : 'border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--secondary)]'}`}
          >
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[var(--bg-card)]"></span>
          </button>

          {isNotificationOpen && (
            <div className="absolute top-full right-0 mt-2 w-80 bg-[var(--bg-card)] border border-[var(--border)] rounded-md shadow-lg z-[100] overflow-hidden">
              <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--secondary)] flex justify-between items-center">
                <span className="text-xs font-bold text-[var(--text-main)] uppercase tracking-wider">Notifications</span>
                <button className="text-[var(--primary)] text-xs font-medium hover:underline" onClick={() => setIsNotificationOpen(false)}>Mark all read</button>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifications.map(n => (
                  <div key={n.id} className="p-4 border-b border-[var(--border)] last:border-0 hover:bg-[var(--secondary)] cursor-pointer transition-colors">
                    <p className="text-sm font-semibold text-[var(--text-main)] mb-1">{n.title}</p>
                    <p className="text-xs text-[var(--text-muted)] leading-tight">{n.message}</p>
                    <p className="text-[10px] text-[var(--text-muted)] mt-2">{n.time}</p>
                  </div>
                ))}
              </div>
              <div className="p-2 border-t border-[var(--border)] text-center">
                <button className="text-xs text-[var(--primary)] font-medium hover:underline">View all</button>
              </div>
            </div>
          )}
        </div>

        <div className="hidden sm:block">
          <ThemeToggle />
        </div>

        <div className="flex items-center gap-3 border-l border-[var(--border)] pl-4 h-8">
          <div className="flex flex-col items-end hidden md:flex">
            <span className="text-sm font-semibold text-[var(--text-main)] leading-none">{user?.userName}</span>
            <span className="text-[10px] text-[var(--primary)] font-medium uppercase tracking-wider mt-1">{user?.role || 'Administrator'}</span>
          </div>
          <div className="w-8 h-8 rounded-md bg-[var(--bg-app)] text-[var(--primary)] flex items-center justify-center font-bold border border-[var(--border)] text-sm">
            {user?.userName?.charAt(0).toUpperCase()}
          </div>
          <button onClick={() => authService.logout()} className="p-2 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-md transition-all ml-1" title="Logout">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
