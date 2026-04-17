import React from 'react';
import { Link } from 'react-router-dom';

const SidebarItem = ({ icon: Icon, label, route, isActive, isCollapsed, onClick }) => {
  return (
    <Link
      to={route}
      onClick={onClick}
      className={`
        flex items-center gap-3 px-4 py-3 mx-2 rounded-xl transition-all duration-300 group relative overflow-hidden
        text-[11px] font-black uppercase tracking-widest
        ${isActive 
          ? 'bg-[var(--primary)] text-white shadow-lg shadow-[var(--ring)]' 
          : 'text-[var(--text-muted)] hover:bg-[var(--bg-app)] hover:text-[var(--text-main)]'}
      `}
    >
      <div className={`shrink-0 transition-transform duration-300 relative z-10 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
        <Icon size={18} />
      </div>
      
      {!isCollapsed && (
        <span className="truncate whitespace-nowrap relative z-10 transition-colors duration-300">
          {label}
        </span>
      )}

      {isActive && (
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary)] to-amber-400 opacity-100"></div>
      )}
    </Link>
  );
};

export default SidebarItem;
