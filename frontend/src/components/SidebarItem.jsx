import React from 'react';
import { Link } from 'react-router-dom';

const SidebarItem = ({ icon: Icon, label, route, isActive, isCollapsed, onClick }) => {
  return (
    <Link
      to={route}
      onClick={onClick}
      className={`
        flex items-center gap-[8px] px-[14px] py-[10px] mx-3 rounded-[12px] transition-all duration-200 group relative
        font-[500] text-[13px]
        ${isActive 
          ? 'bg-[rgba(59,130,246,0.18)] text-primary border-l-[3px] border-primary' 
          : 'text-slate-400 hover:bg-[rgba(59,130,246,0.12)] hover:text-primary'}
      `}
    >
      <div className={`shrink-0 transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
        <Icon size={18} />
      </div>
      
      {!isCollapsed && (
        <span className="truncate whitespace-nowrap">
          {label}
        </span>
      )}

      {isActive && !isCollapsed && (
        <div className="absolute right-3 w-1 h-1 bg-primary rounded-full"></div>
      )}
    </Link>
  );
};

export default SidebarItem;
