import React from 'react';
import { Link } from 'react-router-dom';

const SidebarItem = ({ icon: Icon, label, route, isActive, isCollapsed, onClick }) => {
  return (
    <Link
      to={route}
      onClick={onClick}
      className={`
        flex items-center gap-3 px-4 py-2 mx-2 rounded-md transition-all duration-150 group relative
        text-sm font-medium
        ${isActive 
          ? 'bg-[var(--primary)] text-white' 
          : 'text-[var(--text-muted)] hover:bg-[var(--secondary)] hover:text-[var(--text-main)]'}
      `}
    >
      <div className={`shrink-0 ${isActive ? 'text-white' : 'group-hover:text-[var(--text-main)]'}`}>
        <Icon size={18} />
      </div>
      
      {!isCollapsed && (
        <span className="truncate whitespace-nowrap">
          {label}
        </span>
      )}

      {/* Removed absolute active indicator line for a cleaner block solid look */}
    </Link>
  );
};

export default SidebarItem;
